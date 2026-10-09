import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      toast.success('Password successfully reset');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-sm text-red-600">
        Invalid or missing reset token.
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Set New Password</h3>
      </div>
      <Input
        label="New Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm New Password"
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Reset Password
      </Button>

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordPage;
