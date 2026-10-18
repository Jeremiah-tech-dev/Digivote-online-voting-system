import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing page with an admin entry point', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
});
