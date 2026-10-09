import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/signup', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        company_name: formData.companyName,
        role: 'CLIENT' // Defaulting to client as requested
      });
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        name="fullName"
        required
        value={formData.fullName}
        onChange={handleChange}
      />
      <Input
        label="Email address"
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        label="Company Name (Optional)"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={handleChange}
      />
      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        required
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign up
      </Button>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default SignupPage;
