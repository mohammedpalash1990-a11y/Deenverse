import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Knex } from 'knex';

interface ReviewRoutesOptions { db: Knex; }
const hash = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
const adminAuthorized = (provided: string | undefined) => {
  const expected = process.env.QURAN_REVIEW_ADMIN_TOKEN || '';
  if (!expected || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const quranReviewRoutes: FastifyPluginAsync<ReviewRoutesOptions> = async (
  fastify: FastifyInstance, opts: ReviewRoutesOptions
) => {
  fastify.post<{ Body: { sourceId: string; surahNumber: number; ayahNumber: number; reviewers: string[]; createdBy: string } }>(
    '/review-batches', async (request, reply) => {
      if (!adminAuthorized(request.headers['x-review-admin-token'] as string | undefined)) {
        return reply.status(401).send({ error: { code: 'UNAUTHENTICATED', message: 'Review administrator access is not configured or valid.' } });
      }
      const { sourceId, surahNumber, ayahNumber, reviewers, createdBy } = request.body || {};
      if (!sourceId || !createdBy || !Number.isInteger(surahNumber) || !Number.isInteger(ayahNumber)
        || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1 || ayahNumber > 286
        || !Array.isArray(reviewers) || reviewers.length < 3 || reviewers.length > 5
        || reviewers.some((name) => typeof name !== 'string' || !name.trim() || name.length > 100)
        || new Set(reviewers.map((name) => name.trim().toLowerCase())).size !== reviewers.length) {
        return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Provide a source, valid Ayah coordinates, creator name, and 3–5 distinct reviewer names.' } });
      }
      const source = await opts.db('content_sources').where({ id: sourceId, content_type: 'quran' }).first('id', 'edition', 'source_url', 'attribution', 'license_id', 'checksum');
      const ayah = await opts.db('quran_ayahs').where({ source_id: sourceId, surah_number: surahNumber, ayah_number: ayahNumber }).first('arabic', 'text_sha256');
      if (!source || !ayah || !/^[a-f0-9]{64}$/i.test(String(source.checksum || ''))
        || !/^[a-f0-9]{64}$/i.test(String(ayah.text_sha256 || ''))
        || hash(String(ayah.arabic)) !== String(ayah.text_sha256).toLowerCase()) {
        return reply.status(409).send({ error: { code: 'SOURCE_NOT_REVIEWABLE', message: 'The exact source Ayah and matching text digest are not available for review.' } });
      }
      const now = new Date();
      const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const batchId = randomUUID();
      const links = reviewers.map((label) => {
        const token = randomBytes(32).toString('base64url');
        return { label: label.trim(), token, tokenHash: hash(token) };
      });
      await opts.db.transaction(async (trx) => {
        await trx('quran_review_batches').insert({
          id: batchId, source_id: sourceId, surah_number: surahNumber, ayah_number: ayahNumber,
          artifact_sha256: String(source.checksum).toLowerCase(), created_by: createdBy.trim(),
          created_at: now.toISOString(), expires_at: expires.toISOString()
        });
        await trx('quran_review_invites').insert(links.map((item) => ({
          token_hash: item.tokenHash, batch_id: batchId, reviewer_label: item.label,
          created_at: now.toISOString(), expires_at: expires.toISOString()
        })));
      });
      const origin = (process.env.PUBLIC_APP_URL || '').replace(/\/$/, '');
      return reply.status(201).send({
        data: {
          batchId, surahNumber, ayahNumber, expiresAt: expires.toISOString(),
          invites: links.map((item) => ({ reviewer: item.label, url: origin ? origin + '/quran/review/' + item.token : null, token: origin ? undefined : item.token }))
        }
      });
    }
  );

  fastify.get<{ Params: { token: string } }>('/review/:token', async (request, reply) => {
    const token = request.params.token;
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Review invitation not found.' } });
    const invite = await opts.db('quran_review_invites as i')
      .join('quran_review_batches as b', 'b.id', 'i.batch_id')
      .where('i.token_hash', hash(token))
      .first('i.reviewer_label', 'i.expires_at', 'i.submitted_at', 'b.source_id', 'b.surah_number', 'b.ayah_number', 'b.artifact_sha256');
    if (!invite || new Date(invite.expires_at).getTime() <= Date.now()) return reply.status(404).send({ error: { code: 'INVITE_EXPIRED', message: 'This review link is invalid or expired.' } });
    if (invite.submitted_at) return reply.status(409).send({ error: { code: 'ALREADY_SUBMITTED', message: 'This review has already been submitted.' } });
    const [source, ayah] = await Promise.all([
      opts.db('content_sources').where({ id: invite.source_id }).first('edition', 'source_url', 'attribution', 'license_id', 'checksum'),
      opts.db('quran_ayahs').where({ source_id: invite.source_id, surah_number: invite.surah_number, ayah_number: invite.ayah_number }).first('arabic', 'text_sha256')
    ]);
    if (!source || !ayah || String(source.checksum).toLowerCase() !== String(invite.artifact_sha256).toLowerCase()
      || hash(String(ayah.arabic)) !== String(ayah.text_sha256).toLowerCase()) {
      return reply.status(409).send({ error: { code: 'SOURCE_CHANGED', message: 'The source artifact changed; this invitation can no longer be used.' } });
    }
    return { data: { reviewerLabel: invite.reviewer_label, surahNumber: invite.surah_number, ayahNumber: invite.ayah_number, arabic: ayah.arabic, source: { edition: source.edition, url: source.source_url, attribution: source.attribution, licenseId: source.license_id, checksum: invite.artifact_sha256 }, instructions: 'Compare every Arabic character, diacritics and verse boundary against the named source. Do not correct or rewrite the Quran text.' } };
  });

  fastify.post<{ Params: { token: string }; Body: { reviewerName: string; decision: 'passed' | 'failed' | 'needs_correction'; textMatch: boolean; referenceMatch: boolean; issueNote?: string } }>(
    '/review/:token', async (request, reply) => {
      const token = request.params.token;
      const tokenHash = hash(token);
      const { reviewerName, decision, textMatch, referenceMatch, issueNote } = request.body || {};
      if (!/^[A-Za-z0-9_-]{40,60}$/.test(token) || !reviewerName?.trim() || reviewerName.length > 100
        || !['passed', 'failed', 'needs_correction'].includes(decision)
        || typeof textMatch !== 'boolean' || typeof referenceMatch !== 'boolean'
        || (decision === 'passed' && (!textMatch || !referenceMatch))
        || (issueNote !== undefined && (typeof issueNote !== 'string' || issueNote.length > 2000))) {
        return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Review decision and exact-text/reference checks are required.' } });
      }
      const invite = await opts.db('quran_review_invites').where({ token_hash: tokenHash }).first();
      if (!invite || new Date(invite.expires_at).getTime() <= Date.now()) return reply.status(404).send({ error: { code: 'INVITE_EXPIRED', message: 'This review link is invalid or expired.' } });
      if (invite.submitted_at) return reply.status(409).send({ error: { code: 'ALREADY_SUBMITTED', message: 'This review has already been submitted.' } });
      const submittedAt = new Date().toISOString();
      await opts.db.transaction(async (trx) => {
        await trx('quran_review_submissions').insert({
          id: randomUUID(), token_hash: tokenHash, reviewer_name: reviewerName.trim(), decision,
          text_match: textMatch, reference_match: referenceMatch, issue_note: issueNote?.trim() || null,
          submitted_at: submittedAt
        });
        const updated = await trx('quran_review_invites').where({ token_hash: tokenHash, submitted_at: null }).update({ submitted_at: submittedAt });
        if (updated !== 1) throw new Error('Review invitation has already been submitted.');
      });
      return reply.status(201).send({ data: { submitted: true, submittedAt, decision } });
    }
  );

  fastify.get<{ Params: { batchId: string } }>('/review-batches/:batchId', async (request, reply) => {
    if (!adminAuthorized(request.headers['x-review-admin-token'] as string | undefined)) {
      return reply.status(401).send({ error: { code: 'UNAUTHENTICATED', message: 'Review administrator access is not configured or valid.' } });
    }
    const batch = await opts.db('quran_review_batches').where({ id: request.params.batchId }).first();
    if (!batch) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Review batch not found.' } });
    const reviews = await opts.db('quran_review_invites as i')
      .leftJoin('quran_review_submissions as s', 's.token_hash', 'i.token_hash')
      .where('i.batch_id', batch.id)
      .select('i.reviewer_label', 'i.submitted_at', 's.reviewer_name', 's.decision', 's.text_match', 's.reference_match', 's.issue_note', 's.submitted_at as review_submitted_at');
    return { data: { batch, reviews, allSubmitted: reviews.every((item) => Boolean(item.review_submitted_at)) } };
  });
};
