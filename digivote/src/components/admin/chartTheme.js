// Shared colours and styles for every admin chart.
// The categorical palette is a colour-blind-checked set. Within a race, each
// candidate keeps the same colour (by ballot order) even when bars re-sort by votes.
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];

export const COLORS = {
  textPrimary: '#14181f',
  textSecondary: '#52514e',
  textMuted: '#8a8a85',
  grid: '#ececea',
  track: '#eef0f3',
  remainder: '#d9dce1',
  accent: '#1f8a4c',
  surface: '#ffffff'
};

export const FONT = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const baseTextStyle = { fontFamily: FONT, color: COLORS.textSecondary };

export const tooltipStyle = {
  backgroundColor: '#14181f',
  borderWidth: 0,
  padding: [10, 14],
  textStyle: { color: '#ffffff', fontFamily: FONT, fontSize: 13 },
  extraCssText: 'border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);'
};

// Colour for each candidate, keyed by candidate id, assigned in ballot order
export const colorByCandidate = (candidates) => {
  const map = {};
  [...candidates]
    .sort((a, b) => a.candidate_id - b.candidate_id)
    .forEach((c, i) => { map[c.candidate_id] = SERIES_COLORS[i % SERIES_COLORS.length]; });
  return map;
};

export const formatPercent = (part, whole) => (whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : '0%');

// A centred "no data yet" message drawn inside a chart. It always exists (with a
// fixed id) and is just hidden when there is data, because chart updates are merged.
export const emptyGraphic = (text, visible) => ({
  id: 'empty-message',
  type: 'text',
  left: 'center',
  top: 'middle',
  invisible: !visible,
  style: { text, fill: COLORS.textMuted, font: `500 14px ${FONT}` }
});
