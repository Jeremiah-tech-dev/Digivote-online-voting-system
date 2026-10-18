import { displayName, groupCandidates, sortedCounties } from './candidates';

test('groups candidates into the presidential race and county races', () => {
  const grouped = groupCandidates([
    { id: 1, position: 'Presidential', county: null },
    { id: 2, position: 'Governor', county: 'Kisumu' },
    { id: 3, position: 'Senator', county: 'Kisumu' },
    { id: 4, position: 'Governor', county: 'Nairobi' }
  ]);
  expect(grouped.presidential.map(c => c.id)).toEqual([1]);
  expect(grouped.counties.Kisumu.governors.map(c => c.id)).toEqual([2]);
  expect(grouped.counties.Kisumu.senators.map(c => c.id)).toEqual([3]);
  expect(grouped.counties.Nairobi.senators).toEqual([]);
});

test('counties keep a stable order with new ones last', () => {
  expect(sortedCounties({ Turkana: {}, Kisumu: {}, Nairobi: {} })).toEqual(['Nairobi', 'Kisumu', 'Turkana']);
});

test('display names are upper-case with a title', () => {
  expect(displayName({ first_name: 'Karen', last_name: 'Nyamu' })).toBe('H.E KAREN NYAMU');
});
