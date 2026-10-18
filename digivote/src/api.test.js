import { apiRequest, setUnauthorizedHandler } from './api';
import { jsonResponse } from './testUtils';

afterEach(() => setUnauthorizedHandler(null));

test('sends JSON and the login token', async () => {
  global.fetch = jest.fn(() => jsonResponse({ ok: true }));
  await apiRequest('/votes', { method: 'POST', token: 'abc', body: { a: 1 } });

  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/votes$/);
  expect(options.headers.Authorization).toBe('Bearer abc');
  expect(JSON.parse(options.body)).toEqual({ a: 1 });
});

test('turns validation errors into a readable message', async () => {
  global.fetch = jest.fn(() => jsonResponse({
    detail: [
      { loc: ['body', 'nationalId'], msg: 'Value error, National ID must be 7 or 8 digits' },
      { loc: ['body', 'password'], msg: 'Value error, Password must be at least 8 characters' }
    ]
  }, 422));

  await expect(apiRequest('/register', { method: 'POST', body: {} }))
    .rejects.toThrow('National ID must be 7 or 8 digits\nPassword must be at least 8 characters');
});

test('reports a network failure clearly', async () => {
  global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
  await expect(apiRequest('/stats')).rejects.toThrow('Error connecting to server');
});

test('a rejected token triggers the logout handler', async () => {
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  global.fetch = jest.fn(() => jsonResponse({ detail: 'Session expired, please log in again' }, 401));

  await expect(apiRequest('/me', { token: 'old-token' })).rejects.toThrow('Session expired');
  expect(handler).toHaveBeenCalledWith('old-token');
});

test('a wrong password does not trigger the logout handler', async () => {
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  global.fetch = jest.fn(() => jsonResponse({ detail: 'Invalid credentials' }, 401));

  await expect(apiRequest('/login', { method: 'POST', body: {} })).rejects.toThrow('Invalid credentials');
  expect(handler).not.toHaveBeenCalled();
});
