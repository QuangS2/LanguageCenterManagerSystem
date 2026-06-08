import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../service/apiClient';
import Login from '../Login';

vi.mock('../../service/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Render', () => {
    it('should render form elements', () => {
      render(<Login onLoginSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText('Tên đăng nhập')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /đăng nhập/i })
      ).toBeInTheDocument();
    });

    it('should render role buttons', () => {
      render(<Login onLoginSuccess={vi.fn()} />);

      expect(screen.getByText('Học viên')).toBeInTheDocument();
      expect(screen.getByText('Giáo viên')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should show loading state with disabled button and loading text', async () => {
      apiClient.post.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ data: { token: 'xyz' } }), 100))
      );
      apiClient.get.mockResolvedValueOnce({ data: { profileType: 'student' } });

      render(<Login onLoginSuccess={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });

      const button = screen.getByRole('button', { name: /đăng nhập/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Đang xử lý...');
      });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent('Đăng nhập');
      }, { timeout: 200 });
    });

    it('should show error message when login fails', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Unauthorized'));

      render(<Login onLoginSuccess={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'wrong-user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'wrong-pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      expect(
        await screen.findByText(/sai tài khoản hoặc mật khẩu/i)
      ).toBeInTheDocument();
    });
  });

  
  describe('State & Events', () => {
    it('should update form fields when typing', () => {
      render(<Login onLoginSuccess={vi.fn()} />);

      const usernameInput = screen.getByPlaceholderText('Tên đăng nhập');
      const passwordInput = screen.getByPlaceholderText('Mật khẩu');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      expect(usernameInput.value).toBe('testuser');
      expect(passwordInput.value).toBe('testpass');
    });

    it('should change active role when role button is clicked', () => {
      render(<Login onLoginSuccess={vi.fn()} />);

     
      const teacherBtnContainer = screen.getByText('Giáo viên').closest('.role-btn');
      fireEvent.click(teacherBtnContainer);

    
      expect(teacherBtnContainer).toHaveClass('active');
    });

    it('should not show error message initially', () => {
      render(<Login onLoginSuccess={vi.fn()} />);

      expect(
        screen.queryByText(/sai tài khoản hoặc mật khẩu/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Login - Success Path', () => {
    it('should login successfully with profile.profileType', async () => {
      const onLoginSuccess = vi.fn();

      apiClient.post.mockResolvedValueOnce({
        data: { token: 'mock-token' },
      });
      apiClient.get.mockResolvedValueOnce({
        data: { profileType: 'teacher' },
      });

      render(<Login onLoginSuccess={onLoginSuccess} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'khoa' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
          username: 'khoa',
          password: '123456',
        });
        expect(apiClient.get).toHaveBeenCalledWith('/me/profile');
        expect(localStorage.getItem('token')).toBe('mock-token');
        expect(onLoginSuccess).toHaveBeenCalledWith('teacher');
      });
    });

    it('should use accessToken as fallback when token is missing', async () => {
      const onLoginSuccess = vi.fn();

      apiClient.post.mockResolvedValueOnce({
        data: { accessToken: 'fallback-token' }, 
      });
      apiClient.get.mockResolvedValueOnce({
        data: { profileType: 'student' },
      });

      render(<Login onLoginSuccess={onLoginSuccess} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fallback-token');
        expect(onLoginSuccess).toHaveBeenCalledWith('student');
      });
    });

    it('should use roles[0] as fallback when profileType is missing', async () => {
      const onLoginSuccess = vi.fn();

      apiClient.post.mockResolvedValueOnce({
        data: { token: 'xyz' },
      });
      apiClient.get.mockResolvedValueOnce({
        data: { roles: ['admin'] }, 
      });

      render(<Login onLoginSuccess={onLoginSuccess} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('xyz');
        expect(onLoginSuccess).toHaveBeenCalledWith('admin');
      });
    });

    it('should use activeRole as fallback when both profileType and roles are missing', async () => {
      const onLoginSuccess = vi.fn();

      apiClient.post.mockResolvedValueOnce({
        data: { token: 'xyz' },
      });
      apiClient.get.mockResolvedValueOnce({
        data: {}, 
      });

      render(<Login onLoginSuccess={onLoginSuccess} />);

      const teacherBtnContainer = screen.getByText('Giáo viên').closest('.role-btn');
      fireEvent.click(teacherBtnContainer);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('xyz');
        expect(onLoginSuccess).toHaveBeenCalledWith('teacher');
      });
    });

    it('should clear error message when submitting a new login after error', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('First attempt fails'));
      apiClient.post.mockResolvedValueOnce({ data: { token: 'xyz' } });
      apiClient.get.mockResolvedValueOnce({ data: { profileType: 'student' } });

      const onLoginSuccess = vi.fn();
      render(<Login onLoginSuccess={onLoginSuccess} />);

      // First attempt: fail
      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user1' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass1' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      expect(
        await screen.findByText(/sai tài khoản hoặc mật khẩu/i)
      ).toBeInTheDocument();

      // Second attempt: success
      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user2' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass2' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(
          screen.queryByText(/sai tài khoản hoặc mật khẩu/i)
        ).not.toBeInTheDocument();
        expect(onLoginSuccess).toHaveBeenCalledWith('student');
      });
    });
  });

  describe('Login - Error Path', () => {
    it('should not save token to localStorage when login fails', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Unauthorized'));

      render(<Login onLoginSuccess={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'wrong-user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'wrong-pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    it('should reset loading state when login fails', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Error'));

      render(<Login onLoginSuccess={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });

      const button = screen.getByRole('button', { name: /đăng nhập/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent('Đăng nhập');
      });
    });

    it('should still save token even if profile fetch fails', async () => {
      const onLoginSuccess = vi.fn();

      apiClient.post.mockResolvedValueOnce({
        data: { token: 'valid-token' },
      });
      apiClient.get.mockRejectedValueOnce(new Error('Profile error'));

      render(<Login onLoginSuccess={onLoginSuccess} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('valid-token');
      });
    });

    it('should not call onLoginSuccess when login fails', async () => {
      const onLoginSuccess = vi.fn();
      apiClient.post.mockRejectedValueOnce(new Error('Login failed'));

      render(<Login onLoginSuccess={onLoginSuccess} />);

      fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), {
        target: { value: 'pass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

      await waitFor(() => {
        expect(onLoginSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
