import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
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
        <h1 className="font-display text-2xl font-bold text-[#1a1a2e]">ShieldNet Login</h1>
        <p className="text-[13px] text-[#888888] mt-1">Enter your credentials to access the NIDS</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[rgba(198,40,40,0.08)] border border-[#c62828] rounded text-[#c62828] text-[13px] flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
              placeholder="admin@nids.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#666666] mb-1.5 uppercase">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
              <Lock size={16} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-[#f8f9fa] border border-[#e0e4e8] rounded text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[#2c5f8a] focus:bg-white transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-[#e0e4e8] text-[#2c5f8a] focus:ring-[#2c5f8a]" />
            <span className="text-[12px] text-[#666666]">Remember me</span>
          </label>
          <a href="#" className="text-[12px] text-[#2c5f8a] hover:underline font-medium">Forgot Password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full py-2.5 rounded text-[13px] font-medium text-white transition-colors flex justify-center items-center gap-2 mt-6",
            loading ? "bg-[#2c5f8a]/70 cursor-not-allowed" : "bg-[#2c5f8a] hover:bg-[#1e4a6e]"
          )}
        >
          {loading ? 'Authenticating...' : 'Secure Login'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#e0e4e8] text-center space-y-2">
        <p className="text-[13px] text-[#666666]">
          Don't have an account? <Link to="/register" className="text-[#2c5f8a] font-medium hover:underline">Register here</Link>
        </p>
        <p className="text-[12px] text-[#888888]">
          <Link to="/admin-login" className="hover:text-[#1a1a2e] transition-colors">Admin Portal Access</Link>
        </p>
      </div>
    </div>
  );
}
