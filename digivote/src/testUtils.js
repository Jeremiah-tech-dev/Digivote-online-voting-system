import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './auth';
import { ROUTER_FUTURE_FLAGS } from './config';

// Render a component inside the router and login state, starting at the given URL
export const renderWithProviders = (ui, { route = '/' } = {}) =>
  render(
    <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );

// A fake fetch Response
export const jsonResponse = (body, status = 200) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

// A JWT-shaped token that expires `secondsFromNow` from now (the signature is not checked in the browser)
export const fakeToken = (secondsFromNow = 3600) => {
  const payload = btoa(JSON.stringify({ sub: '1', role: 'voter', exp: Math.floor(Date.now() / 1000) + secondsFromNow }));
  return `header.${payload}.signature`;
};
