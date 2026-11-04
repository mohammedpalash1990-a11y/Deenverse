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

def assert_unique_mapping_keys(node, location = "$")
  return unless node.respond_to?(:children)

  if node.is_a?(Psych::Nodes::Mapping)
    pairs = node.children.each_slice(2).to_a
    names = pairs.map { |key, _value| key.respond_to?(:value) ? key.value : key.class.name }
    duplicate = names.group_by(&:itself).find { |_name, occurrences| occurrences.length > 1 }
    abort_with("duplicate YAML key #{duplicate.first.inspect} at #{location}") if duplicate
    pairs.each do |key, value|
      name = key.respond_to?(:value) ? key.value : key.class.name
      assert_unique_mapping_keys(value, "#{location}.#{name}")
    end
  else
    node.children.each_with_index do |child, index|
      assert_unique_mapping_keys(child, "#{location}[#{index}]")
    end
  end
end

def walk(value, &block)
  yield value
  case value
  when Hash
    value.each_value { |child| walk(child, &block) }
  when Array
    value.each { |child| walk(child, &block) }
  end
end

def resolve_local_reference(spec, reference)
  return nil unless reference.start_with?("#/")
  reference.delete_prefix("#/").split("/").reduce(spec) do |node, part|
    decoded = part.gsub("~1", "/").gsub("~0", "~")
    node.is_a?(Hash) ? node[decoded] : nil
  end
end

ast = Psych.parse_file(SPEC_PATH)
abort_with("OpenAPI file is empty or invalid YAML") unless ast
assert_unique_mapping_keys(ast)

spec = YAML.safe_load_file(SPEC_PATH, permitted_classes: [], aliases: false)
abort_with("expected OpenAPI 3.1.0") unless spec.is_a?(Hash) && spec["openapi"] == "3.1.0"
paths = spec["paths"]
abort_with("paths must be a non-empty mapping") unless paths.is_a?(Hash) && !paths.empty?

walk(spec) do |value|
  next unless value.is_a?(Hash) && value["$ref"].is_a?(String)
  reference = value["$ref"]
  next unless reference.start_with?("#/")
  abort_with("unresolved local reference #{reference}") if resolve_local_reference(spec, reference).nil?
end

app_source = File.read(APP_PATH)
actual = Hash.new { |hash, key| hash[key] = [] }

abort_with("app.ts uses api.route(); extend this scanner before adding route-object registrations") if app_source.match?(/\bapi\.route\s*\(/)
app_source.scan(/\bapi\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/m) do |method, path|
  actual[path] << method
end

route_imports = app_source.scan(/import\s*\{\s*(\w+)\s*\}\s*from\s*['"]\.\/routes\/([^'"]+)\.js['"]/m).to_h
registrations = app_source.scan(/api\.register\(\s*(\w+)\s*,\s*\{\s*prefix:\s*['"]([^'"]+)['"]/m)

registrations.each do |plugin, prefix|
  route_file = route_imports[plugin]
  abort_with("registered route plugin #{plugin} has no matching route import") unless route_file

  source_path = File.join(ROOT, "backend", "src", "routes", "#{route_file}.ts")
  abort_with("route source not found for #{plugin}: #{source_path}") unless File.file?(source_path)
  source = File.read(source_path)
  abort_with("#{plugin} uses fastify.route(); extend this scanner before adding route-object registrations") if source.match?(/\bfastify\.route\s*\(/)

  declarations = source.scan(/\bfastify\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/m)
  abort_with("no literal route declarations found for #{plugin}") if declarations.empty?

  declarations.each do |method, route|
    full_path = "#{prefix}#{route}"
    actual[full_path.gsub(/:([A-Za-z0-9_]+)/, '{\1}')] << method
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

puts "OpenAPI 3.1 YAML, unique keys, local references, and backend route parity verified: #{paths.length} paths, #{operation_ids.length} operations."
