import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(formData);
      if (res.success) {
        navigate('/login');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#e0e4e8] p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-[#2c5f8a] rounded-lg flex items-center justify-center text-white mb-4">
          <Shield size={28} />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#1a1a2e]">Create Account</h1>
        <p className="text-[13px] text-[#888888] mt-1">Register for ShieldNet NIDS access</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[rgba(198,40,40,0.08)] border border-[#c62828] rounded text-[#c62828] text-[13px] flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
              <User size={16} />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
              <Mail size={16} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Mobile Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
              <Phone size={16} />
            </div>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
              placeholder="10 digit mobile number"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Confirm</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full py-2.5 rounded text-[13px] font-medium text-white transition-colors flex justify-center items-center gap-2 mt-6",
            loading ? "bg-[#2c5f8a]/70 cursor-not-allowed" : "bg-[#2c5f8a] hover:bg-[#1e4a6e]"
          )}
        >
          {loading ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#e0e4e8] text-center">
        <p className="text-[13px] text-[#666666]">
          Already have an account? <Link to="/login" className="text-[#2c5f8a] font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
