import React from 'react';

// Images shown next to each county's races
export const COUNTY_IMAGES = {
  Nairobi: '/Nairobi.jpeg',
  Mombasa: '/mombasa.png',
  Kisumu: '/kisumu.webp',
  Nakuru: '/nakuru.png',
  Eldoret: '/eldoret.png'
};

export const COUNTIES = Object.keys(COUNTY_IMAGES);
export const POSITIONS = ['Presidential', 'Governor', 'Senator'];

// Show the logo if a candidate's photo link is broken
export const showFallbackImage = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/logo.png';
};

export const displayName = (candidate) =>
  `H.E ${candidate.first_name} ${candidate.last_name}`.toUpperCase();

// The party logo, or the party name when there is no logo (e.g. independents)
export const PartyLogo = ({ candidate, className }) =>
  candidate.party_logo_url ? (
    <img src={candidate.party_logo_url} alt={`${candidate.party} logo`} className={className} onError={showFallbackImage} />
  ) : (
    <p className={`${className} party-name-fallback`}>{candidate.party.toUpperCase()}</p>
  );

// Split a flat candidate list into presidential and per-county lists:
// { presidential: [...], counties: { Nairobi: { governors: [...], senators: [...] }, ... } }
export const groupCandidates = (candidates) => {
  const grouped = { presidential: [], counties: {} };
  candidates.forEach((candidate) => {
    if (candidate.position === 'Presidential') {
      grouped.presidential.push(candidate);
      return;
    }
    const county = grouped.counties[candidate.county] || { governors: [], senators: [] };
    if (candidate.position === 'Governor') county.governors.push(candidate);
    if (candidate.position === 'Senator') county.senators.push(candidate);
    grouped.counties[candidate.county] = county;
  });
  return grouped;
};

// Counties in a stable order: the known ones first, then any others alphabetically
export const sortedCounties = (counties) =>
  Object.keys(counties).sort((a, b) => {
    const ia = COUNTIES.indexOf(a);
    const ib = COUNTIES.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
