import assert from 'node:assert/strict';
import { test } from 'node:test';

import groupEvents, { seriesOf, yearOf } from './groupEvents.js';

const events = [
  { id: 1, name: 'Katsucon 2023', start_date: '2023-02-17', albums_count: 14 },
  { id: 2, name: 'MAGFest 2023', start_date: '2023-01-05', albums_count: 3 },
  { id: 3, name: 'Katsucon 2022', start_date: '2022-02-18', albums_count: 12 },
  { id: 4, name: 'Anime Expo', start_date: null, albums_count: 1 },
];

test('groups by year, newest first, undated last', () => {
  const groups = groupEvents(events, 'year');

  assert.deepEqual(
    groups.map((g) => [g.label, g.events.length, g.albumCount]),
    [
      ['2023', 2, 17],
      ['2022', 1, 12],
      ['Undated', 1, 1],
    ],
  );
});

test('groups by series alphabetically, year stripped from the name', () => {
  const groups = groupEvents(events, 'event');

  assert.deepEqual(
    groups.map((g) => [g.label, g.events.length, g.albumCount]),
    [
      ['Anime Expo', 1, 1],
      ['Katsucon', 2, 26],
      ['MAGFest', 1, 3],
    ],
  );
});

test('falls back to the year in the name when start_date is missing', () => {
  assert.equal(yearOf({ name: 'Otakon 2019', start_date: null }), '2019');
  assert.equal(
    yearOf({ name: 'Otakon 2019', start_date: '2019-08-16' }),
    '2019',
  );
  assert.equal(yearOf({ name: 'Some Con', start_date: null }), null);
});

test('keeps the whole name when there is no trailing year', () => {
  assert.equal(
    seriesOf({ name: 'Cosplay Snow Festival' }),
    'Cosplay Snow Festival',
  );
  assert.equal(seriesOf({ name: 'Tora-con 2019' }), 'Tora-con');
});

test('preserves incoming event order inside a group', () => {
  const [katsucon] = groupEvents(events, 'event').filter(
    (g) => g.label === 'Katsucon',
  );

  assert.deepEqual(
    katsucon.events.map((e) => e.id),
    [1, 3],
  );
});

test('handles an empty list', () => {
  assert.deepEqual(groupEvents([], 'year'), []);
  assert.deepEqual(groupEvents(undefined, 'event'), []);
});
