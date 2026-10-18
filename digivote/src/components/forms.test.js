import { fireEvent, screen } from '@testing-library/react';
import LoginForm from './LoginForm';
import RegisterVoter from './RegisterVoter';
import { jsonResponse, renderWithProviders } from '../testUtils';

test('login shows the server error for wrong credentials', async () => {
  global.fetch = jest.fn(() => jsonResponse({ detail: 'Invalid credentials' }, 401));
  const onLoginSuccess = jest.fn();
  renderWithProviders(<LoginForm onClose={() => {}} onLoginSuccess={onLoginSuccess} onRegisterClick={() => {}} />);

  fireEvent.change(screen.getByPlaceholderText(/national id/i), { target: { value: '12345678' } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong-pass1' } });
  fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  expect(onLoginSuccess).not.toHaveBeenCalled();
});

test('registration stops when the passwords do not match', () => {
  global.fetch = jest.fn();
  const { container } = renderWithProviders(<RegisterVoter onClose={() => {}} />);

  fireEvent.change(container.querySelector('input[name=password]'), { target: { value: 'Password123' } });
  fireEvent.change(container.querySelector('input[name=confirmPassword]'), { target: { value: 'Password124' } });
  fireEvent.submit(container.querySelector('form'));

  expect(screen.getByText('Passwords do not match!')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});
