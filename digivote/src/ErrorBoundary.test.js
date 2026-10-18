import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const Broken = () => {
  throw new Error('boom');
};

test('a crash shows a reload message instead of a blank page', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<ErrorBoundary><Broken /></ErrorBoundary>);
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  console.error.mockRestore();
});

test('a missing code file from an old release reloads the page once instead of crashing', () => {
  const realLocation = window.location;
  delete window.location;
  window.location = { ...realLocation, reload: jest.fn() };
  jest.spyOn(console, 'error').mockImplementation(() => {});
  sessionStorage.clear();
  const OldChunk = () => {
    const error = new Error('Loading chunk 959 failed.');
    error.name = 'ChunkLoadError';
    throw error;
  };

  render(<ErrorBoundary><OldChunk /></ErrorBoundary>);
  expect(window.location.reload).toHaveBeenCalledTimes(1);

  // A second failure straight away must not reload again (no reload loops)
  render(<ErrorBoundary><OldChunk /></ErrorBoundary>);
  expect(window.location.reload).toHaveBeenCalledTimes(1);

  console.error.mockRestore();
  window.location = realLocation;
});
