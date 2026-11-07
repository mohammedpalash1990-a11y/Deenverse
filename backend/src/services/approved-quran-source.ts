import { Knex } from 'knex';

/**
 * Select a Quran source only when exactly one active, redistribution-permitted
 * source has an approved digest-bound decision from a distinct, independent
 * reviewer. The project-owner chat authorization identity is never a reviewer.
 *
 * Returning null for both zero and multiple eligible sources is deliberate:
 * row order must never choose which Quran edition a public reader receives.
 */
export async function findSingleApprovedQuranSource(db: Knex) {
  const sources = await db('content_sources')
    .join('content_source_approvals', 'content_source_approvals.source_id', 'content_sources.id')
    .where({
      'content_sources.content_type': 'quran',
      'content_sources.is_active': true,
      'content_sources.redistribution_allowed': true,
      'content_source_approvals.decision': 'approved'
    })
    .whereRaw('content_source_approvals.artifact_sha256 = content_sources.checksum')
    .whereRaw('content_source_approvals.reviewer_id <> content_sources.reviewer')
    .whereNot('content_sources.reviewer', 'project-owner-chat-authorization')
    .whereNot('content_source_approvals.reviewer_id', 'project-owner-chat-authorization')
    .select(
      'content_sources.*',
      'content_source_approvals.id as approval_id',
      'content_source_approvals.decision as approval_decision',
      'content_source_approvals.reviewer_id as approval_reviewer',
      'content_source_approvals.approved_at as approval_date'
    )
    .limit(2);

  return sources.length === 1 ? sources[0] : null;
}
