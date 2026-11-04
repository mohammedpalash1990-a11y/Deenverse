import { randomUUID } from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Knex } from 'knex';

export interface ProblemReportRoutesOptions {
  db: Knex;
}

const reportSchema = z.object({
  category: z.enum(['bug', 'audio', 'quran', 'hadith_dua', 'feature', 'suggestion']),
  description: z.string().trim().min(10).max(4000),
  stepsToReproduce: z.string().trim().max(2000).optional().default(''),
  currentSection: z.string().trim().min(1).max(100),
  appVersion: z.string().trim().min(1).max(30),
  surahNumber: z.number().int().min(1).max(114).optional(),
  ayahNumber: z.number().int().min(1).max(286).optional(),
  diagnostics: z.string().max(1500).optional()
}).refine((value) => (value.surahNumber === undefined) === (value.ayahNumber === undefined), {
  message: 'Surah and ayah numbers must be provided together.'
});

export const problemReportRoutes: FastifyPluginAsync<ProblemReportRoutesOptions> = async (
  fastify: FastifyInstance,
  opts: ProblemReportRoutesOptions
) => {
  fastify.post('/problem-reports', async (request, reply) => {
    const parsed = reportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the report fields and try again.',
          requestId: request.id,
          details: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
          retryable: false
        }
      });
    }

    const report = parsed.data;
    const id = randomUUID();
    await opts.db('problem_reports').insert({
      id,
      category: report.category,
      description: report.description,
      steps_to_reproduce: report.stepsToReproduce || null,
      current_section: report.currentSection,
      app_version: report.appVersion,
      surah_number: report.surahNumber ?? null,
      ayah_number: report.ayahNumber ?? null,
      diagnostics: report.diagnostics ?? null,
      status: 'new'
    });

    return reply.status(201).send({
      meta: { requestId: request.id },
      data: { id, status: 'received', message: 'Your report has been received.' }
    });
  });
};
