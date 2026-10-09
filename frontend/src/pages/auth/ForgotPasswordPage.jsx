import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a password reset link to {email}.
        </p>
        <div className="mt-6">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Password</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <Input
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Send reset link
      </Button>

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordPage;
