import { fireEvent, screen } from '@testing-library/react';
import VotingPopup from './VotingPopup';
import { jsonResponse, renderWithProviders } from '../testUtils';

const candidate = (id, first, last, position, county = null) => ({
  id, first_name: first, last_name: last, party: 'Party', position, county, image_url: null, party_logo_url: null
});

const CANDIDATES = [
  candidate(1, 'William', 'Ruto', 'Presidential'),
  candidate(2, 'Rigathi', 'Gachagua', 'Presidential'),
  candidate(5, 'Johnson', 'Sakaja', 'Governor', 'Nairobi'),
  candidate(9, 'Abdulswamad', 'Nassir', 'Governor', 'Mombasa'),
  candidate(7, 'Edwin', 'Sifuna', 'Senator', 'Nairobi'),
  candidate(8, 'Karen', 'Nyamu', 'Senator', 'Nairobi')
];

const choose = (name) => {
  const card = screen.getByText(name).closest('.voting-candidate-card');
  fireEvent.click(card.querySelector('button'));
};

test('a voter picks three candidates, reviews them and submits one ballot', async () => {
  global.fetch = jest.fn(() => jsonResponse({ receipt_code: 'ABCD-EFGH-JKLM' }, 201));
  const onFinished = jest.fn();
  renderWithProviders(
    <VotingPopup voterCounty="Nairobi" candidates={CANDIDATES} electionId={1} token="voter-token" onFinished={onFinished} />
  );

  choose('H.E RIGATHI GACHAGUA');
  // Only the voter's own county appears for Governor
  expect(screen.queryByText('H.E ABDULSWAMAD NASSIR')).not.toBeInTheDocument();
  choose('H.E JOHNSON SAKAJA');
  choose('H.E KAREN NYAMU');

  // Nothing is sent until the voter confirms on the review screen
  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.getByText('Review Your Ballot')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /submit my ballot/i }));

  expect(await screen.findByText('ABCD-EFGH-JKLM')).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer voter-token');
  expect(JSON.parse(options.body)).toEqual({ election_id: 1, presidential_id: 2, governor_id: 5, senator_id: 8 });

  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onFinished).toHaveBeenCalled();
});

test('a voter can go back and change their choices before submitting', () => {
  global.fetch = jest.fn();
  renderWithProviders(<VotingPopup voterCounty="Nairobi" candidates={CANDIDATES} electionId={1} token="t" />);

  choose('H.E WILLIAM RUTO');
  choose('H.E JOHNSON SAKAJA');
  choose('H.E EDWIN SIFUNA');
  fireEvent.click(screen.getByRole('button', { name: /change my choices/i }));

  expect(screen.getByText('Presidential Candidates')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('a rejected ballot shows the reason and can be retried', async () => {
  global.fetch = jest.fn(() => jsonResponse({ detail: 'Voting is not open for this election' }, 403));
  renderWithProviders(<VotingPopup voterCounty="Nairobi" candidates={CANDIDATES} electionId={1} token="t" />);

  choose('H.E WILLIAM RUTO');
  choose('H.E JOHNSON SAKAJA');
  choose('H.E EDWIN SIFUNA');
  fireEvent.click(screen.getByRole('button', { name: /submit my ballot/i }));

  expect(await screen.findByText('Voting is not open for this election')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /submit my ballot/i })).toBeEnabled();
});
