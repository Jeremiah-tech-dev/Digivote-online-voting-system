import { fireEvent, screen } from '@testing-library/react';
import App from './App';
import { fakeToken, jsonResponse, renderWithProviders } from './testUtils';

beforeEach(() => {
  sessionStorage.clear();
  global.fetch = jest.fn(() => jsonResponse({}));
});

test('renders the landing page with an admin entry point', () => {
  renderWithProviders(<App />);
  expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /vote for your future/i })).toHaveAttribute('href', '/login');
});

test('each form has its own address', () => {
  renderWithProviders(<App />, { route: '/register' });
  expect(screen.getByRole('heading', { name: /register as a voter/i })).toBeInTheDocument();
});

test('the voting portal sends logged-out visitors to the login form', () => {
  renderWithProviders(<App />, { route: '/vote' });
  expect(screen.getByRole('heading', { name: /login to vote/i })).toBeInTheDocument();
});

test('the admin portal sends logged-out visitors to the admin login', () => {
  renderWithProviders(<App />, { route: '/admin' });
  expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
});

test('an expired saved login is ignored', () => {
  sessionStorage.setItem('digivote-session', JSON.stringify({
    voter: { token: fakeToken(-60), profile: { county: 'Nairobi' } },
    admin: null
  }));
  renderWithProviders(<App />, { route: '/vote' });
  expect(screen.getByRole('heading', { name: /login to vote/i })).toBeInTheDocument();
});

test('unknown addresses go back to the home page', () => {
  renderWithProviders(<App />, { route: '/no-such-page' });
  expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
});

test('logging out of the voting portal returns to the home page', async () => {
  sessionStorage.setItem('digivote-session', JSON.stringify({
    voter: { token: fakeToken(), profile: { county: 'Nairobi' } },
    admin: null
  }));
  global.fetch = jest.fn((url) => {
    if (url.endsWith('/elections')) return jsonResponse({ elections: [] });
    if (url.includes('/candidates')) return jsonResponse({ candidates: [] });
    if (url.endsWith('/stats')) return jsonResponse({ total_voters: 0, voters_voted: 0 });
    return jsonResponse({ has_voted: false });
  });
  renderWithProviders(<App />, { route: '/vote' });

  fireEvent.click(await screen.findByRole('button', { name: /logout/i }));

  expect(await screen.findByRole('link', { name: /vote for your future/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /login to vote/i })).not.toBeInTheDocument();
  expect(JSON.parse(sessionStorage.getItem('digivote-session')).voter).toBeNull();
});

test('the home page explains that only the five cities can vote', async () => {
  global.fetch = jest.fn(() => jsonResponse({
    total_voters: 3,
    voters_voted: 1,
    registered_by_county: { Nairobi: 2, Mombasa: 0, Kisumu: 1, Nakuru: 0, Eldoret: 0 }
  }));
  renderWithProviders(<App />);

  expect(screen.getByRole('heading', { name: /open only to voters in kenya's five cities/i })).toBeInTheDocument();
  for (const city of ['Nairobi', 'Mombasa', 'Nakuru', 'Eldoret', 'Kisumu']) {
    expect(screen.getByRole('button', { name: new RegExp(city) })).toBeInTheDocument();
  }
  expect(await screen.findByText(/2 registered on Digivote/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /register to vote/i })).toHaveAttribute('href', '/register');
});

test('the hamburger button opens and closes the menu', () => {
  renderWithProviders(<App />);
  const menuButton = screen.getByRole('button', { name: /open menu/i });
  expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(menuButton);
  expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
  expect(document.querySelector('.main-nav')).toHaveClass('nav-open');

  fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
  expect(document.querySelector('.main-nav')).not.toHaveClass('nav-open');
});
