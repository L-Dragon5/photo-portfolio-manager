/**
 * Group events for the /events page.
 *
 * Events are named "<Series> <Year>" (e.g. "Katsucon 2023"), so both groupings
 * come straight off existing columns — no schema or query changes.
 *
 * ponytail: derived at render time from the full event list. If the event count
 * ever outgrows a single page payload, move this into the controller.
 */

const YEAR_SUFFIX = /\s*(\d{4})\s*$/;

export const yearOf = (event) =>
  event.start_date?.slice(0, 4) || event.name?.match(YEAR_SUFFIX)?.[1] || null;

export const seriesOf = (event) =>
  event.name?.replace(YEAR_SUFFIX, '').trim() || event.name || 'Other';

const groupEvents = (events, mode) => {
  const groups = new Map();

  for (const event of events ?? []) {
    const label =
      mode === 'year' ? (yearOf(event) ?? 'Undated') : seriesOf(event);
    if (!groups.has(label)) {
      groups.set(label, { label, events: [], albumCount: 0 });
    }
    const group = groups.get(label);
    group.events.push(event);
    group.albumCount += event.albums_count ?? 0;
  }

  const sorted = [...groups.values()];

  if (mode === 'year') {
    // Newest year first, undated last.
    sorted.sort((a, b) => {
      if (a.label === 'Undated') return 1;
      if (b.label === 'Undated') return -1;
      return b.label.localeCompare(a.label);
    });
  } else {
    sorted.sort((a, b) =>
      a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }),
    );
  }

  return sorted;
};

export default groupEvents;
