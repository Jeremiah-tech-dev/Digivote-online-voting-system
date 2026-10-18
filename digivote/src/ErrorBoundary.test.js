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
