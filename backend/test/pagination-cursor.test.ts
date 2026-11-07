import assert from 'node:assert/strict';
import test from 'node:test';
import {
  decodeCursor,
  encodeCursor,
  PaginationQuerySchema
} from '../src/services/validation.js';

test('signed pagination cursor round-trips a safe offset for its exact query scope', () => {
  const scope = 'hadith:search|q:sample|locale:bn|limit:20';
  const cursor = encodeCursor(40, scope);
  assert.equal(decodeCursor(cursor, scope), 40);
  assert.equal(PaginationQuerySchema.safeParse({ limit: 20, cursor }).success, true);
});

test('signed pagination cursor rejects replay against a different query scope', () => {
  const cursor = encodeCursor(20, 'hadith:records|book:book-a|locale:bn|limit:20');
  assert.throws(
    () => decodeCursor(cursor, 'hadith:records|book:book-b|locale:bn|limit:20'),
    /different query/
  );
});

test('signed pagination cursor rejects page-size and filter changes', () => {
  const cursor = encodeCursor(20, 'quran:surahs:limit:20');
  assert.throws(() => decodeCursor(cursor, 'quran:surahs:limit:10'), /different query/);
});

test('signed pagination cursor rejects tampering and malformed tokens', () => {
  const cursor = encodeCursor(20, 'hadith:books|limit:20');
  const [payload, signature] = cursor.split('.');
  const replacement = signature[0] === 'A' ? 'B' : 'A';
  assert.throws(() => decodeCursor(payload + '.' + replacement + signature.slice(1), 'hadith:books|limit:20'));
  assert.throws(() => decodeCursor('MA==', 'hadith:books|limit:20'));
  assert.equal(PaginationQuerySchema.safeParse({ cursor: 'MA==' }).success, false);
});

test('cursor encoder rejects negative, fractional, and unsafe offsets', () => {
  const scope = 'hadith:books|limit:20';
  for (const offset of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => encodeCursor(offset, scope));
  }
});
