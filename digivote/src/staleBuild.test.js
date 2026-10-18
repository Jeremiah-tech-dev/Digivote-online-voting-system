import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Link, Routes, Route } from 'react-router-dom';
import { latestBuild, runningBuild, useReloadOnNewRelease } from './staleBuild';
import { ROUTER_FUTURE_FLAGS } from './config';

const realLocation = window.location;

const addMainScript = (src) => {
  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
  return script;
};

const servedPage = (mainFile) => Promise.resolve({
  ok: true,
  text: () => Promise.resolve(`<html><script defer src="${mainFile}"></script></html>`)
});

const Pages = () => {
  useReloadOnNewRelease();
  return (
    <>
      <Link to="/admin/login">Admin</Link>
      <Routes><Route path="*" element={<p>page</p>} /></Routes>
    </>
  );
};

let script;
beforeEach(() => {
  delete window.location;
  window.location = { ...realLocation, reload: jest.fn() };
});
afterEach(() => {
  window.location = realLocation;
  if (script) script.remove();
  script = null;
});

test('reads the version this tab is running and the version the server serves', async () => {
  script = addMainScript('http://localhost/static/js/main.aaaa1111.js');
  expect(runningBuild()).toBe('/static/js/main.aaaa1111.js');
  global.fetch = jest.fn(() => servedPage('/static/js/main.bbbb2222.js'));
  expect(await latestBuild()).toBe('/static/js/main.bbbb2222.js');
});

test('a tab running an old release loads the new one at the next page change', async () => {
  script = addMainScript('http://localhost/static/js/main.aaaa1111.js');
  global.fetch = jest.fn(() => servedPage('/static/js/main.bbbb2222.js'));
  render(<MemoryRouter future={ROUTER_FUTURE_FLAGS}><Pages /></MemoryRouter>);
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));
  expect(window.location.reload).not.toHaveBeenCalled(); // never mid-page

  fireEvent.click(screen.getByText('Admin'));
  await waitFor(() => expect(window.location.reload).toHaveBeenCalledTimes(1));
});

test('a tab on the current release is never reloaded', async () => {
  script = addMainScript('http://localhost/static/js/main.aaaa1111.js');
  global.fetch = jest.fn(() => servedPage('/static/js/main.aaaa1111.js'));
  render(<MemoryRouter future={ROUTER_FUTURE_FLAGS}><Pages /></MemoryRouter>);
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Admin'));
  await new Promise((r) => setTimeout(r, 0));
  expect(window.location.reload).not.toHaveBeenCalled();
});
