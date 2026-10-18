// The five city counties where Digivote is open, in Northern Corridor order
// (Mombasa port → Nairobi → Nakuru → Eldoret, with the branch to Kisumu).
// Populations are from the 2019 Kenya Population and Housing Census (KNBS).
//   county:    the county name on the map
//   appCounty: the county value voters register with in Digivote
export const FIVE_CITIES = [
  { county: 'Nairobi', appCounty: 'Nairobi', code: '047', city: 'Nairobi · capital city', pin: 'Nairobi', ll: [36.8172, -1.2864], pop: 4397073, zoom: 7.5 },
  { county: 'Mombasa', appCounty: 'Mombasa', code: '001', city: 'Mombasa · port city', pin: 'Mombasa', ll: [39.6682, -4.0435], pop: 1208333, zoom: 8 },
  { county: 'Nakuru', appCounty: 'Nakuru', code: '032', city: 'Nakuru City', pin: 'Nakuru', ll: [36.0800, -0.3031], pop: 2162202, zoom: 3.2 },
  { county: 'Uasin Gishu', appCounty: 'Eldoret', code: '027', city: 'Eldoret · Uasin Gishu County', pin: 'Eldoret', ll: [35.2698, 0.5143], pop: 1163186, zoom: 4.6 },
  { county: 'Kisumu', appCounty: 'Kisumu', code: '042', city: 'Kisumu · lake city', pin: 'Kisumu', ll: [34.7680, -0.0917], pop: 1155574, zoom: 4.6 }
];

export const KENYA_POPULATION = 47564296;
export const FIVE_CITIES_POPULATION = FIVE_CITIES.reduce((sum, c) => sum + c.pop, 0);

// Animated "trails" along the main road and rail corridor linking the five cities
export const CORRIDOR = [
  ['Mombasa', 'Nairobi'], ['Nairobi', 'Nakuru'], ['Nakuru', 'Uasin Gishu'], ['Nakuru', 'Kisumu'],
  ['Kisumu', 'Nakuru'], ['Uasin Gishu', 'Nakuru'], ['Nakuru', 'Nairobi'], ['Nairobi', 'Mombasa']
];
