#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("..", __dir__)
SPEC_PATH = File.join(ROOT, "docs", "OPENAPI-DRAFT.yaml")
APP_PATH = File.join(ROOT, "backend", "src", "app.ts")
METHODS = %w[get post put patch delete].freeze

def abort_with(message)
  warn "OpenAPI contract check failed: #{message}"
  exit 1
end

spec = YAML.safe_load_file(SPEC_PATH, permitted_classes: [], aliases: false)
abort_with("expected OpenAPI 3.1.0") unless spec.is_a?(Hash) && spec["openapi"] == "3.1.0"
paths = spec["paths"]
abort_with("paths must be a non-empty mapping") unless paths.is_a?(Hash) && !paths.empty?

app_source = File.read(APP_PATH)
actual = Hash.new { |hash, key| hash[key] = [] }

# Direct routes registered in app.ts (health/readiness).
app_source.scan(/\bapi\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/m) do |method, path|
  actual[path] << method
end

# Resolve each registered route plugin from its import and prefix, then scan
# the plugin source for literal route declarations. Fail closed on unknown
# plugins or files so a new plugin cannot silently escape the contract check.
route_imports = app_source.scan(/import\s*\{\s*(\w+)\s*\}\s*from\s*['"]\.\/routes\/([^'"]+)\.js['"]/m).to_h
registrations = app_source.scan(/api\.register\(\s*(\w+)\s*,\s*\{\s*prefix:\s*['"]([^'"]+)['"]/m)

registrations.each do |plugin, prefix|
  route_file = route_imports[plugin]
  abort_with("registered route plugin #{plugin} has no matching route import") unless route_file

  source_path = File.join(ROOT, "backend", "src", "routes", "#{route_file}.ts")
  abort_with("route source not found for #{plugin}: #{source_path}") unless File.file?(source_path)
  source = File.read(source_path)

  declarations = source.scan(/\bfastify\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/m)
  abort_with("no literal route declarations found for #{plugin}") if declarations.empty?

  declarations.each do |method, route|
    full_path = "#{prefix}#{route}"
    openapi_path = full_path.gsub(/:([A-Za-z0-9_]+)/, '{\1}')
    actual[openapi_path] << method
  end
end

actual = actual.transform_values { |verbs| verbs.uniq.sort }
documented = paths.each_with_object({}) do |(path, operations), result|
  abort_with("path #{path} must define an operation mapping") unless operations.is_a?(Hash)
  verbs = operations.keys.map(&:to_s).sort
  abort_with("path #{path} has unsupported/empty methods: #{verbs.inspect}") if verbs.empty? || (verbs - METHODS).any?
  result[path] = verbs
end

unless actual == documented
  missing = actual.keys - documented.keys
  undocumented = documented.keys - actual.keys
  method_mismatches = (actual.keys & documented.keys).filter_map do |path|
    [path, actual[path], documented[path]] unless actual[path] == documented[path]
  end
  abort_with("route mismatch; missing from OpenAPI=#{missing.inspect}; not registered=#{undocumented.inspect}; method mismatches=#{method_mismatches.inspect}")
end

operation_ids = []
paths.each do |path, operations|
  path_parameters = path.scan(/\{([^}]+)\}/).flatten.sort
  operations.each do |method, operation|
    abort_with("#{method.upcase} #{path} must have an operationId") unless operation.is_a?(Hash) && operation["operationId"].is_a?(String)
    operation_ids << operation["operationId"]
    responses = operation["responses"]
    abort_with("#{method.upcase} #{path} must document a 200 response") unless responses.is_a?(Hash) && responses.key?("200")

    declared_path_parameters = Array(operation["parameters"])
      .select { |parameter| parameter.is_a?(Hash) && parameter["in"] == "path" }
      .map { |parameter| parameter["name"] }
      .sort
    abort_with("#{method.upcase} #{path} path parameters mismatch: expected #{path_parameters.inspect}, got #{declared_path_parameters.inspect}") unless path_parameters == declared_path_parameters
  end
end

abort_with("operationId values must be unique") unless operation_ids.uniq.length == operation_ids.length

puts "OpenAPI 3.1 valid YAML and backend route parity verified: #{paths.length} paths, #{operation_ids.length} operations."
