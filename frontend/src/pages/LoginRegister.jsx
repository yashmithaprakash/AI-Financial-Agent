import React, { useState } from 'react';
import { Cpu, ShieldCheck, ArrowRight, Lock, Mail, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('yashmitha@demo.com');
  const [password, setPassword] = useState('Password@123');
  const [income, setIncome] = useState('85000');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      register(name || 'Yashmitha S.', email, password, income);
    } else {
      login(email, password);
    }
  };

  const handleQuickDemoLogin = () => {
    login('yashmitha@ibm-interview.demo', 'demoPass');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-950 px-8 py-7 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AI Financial Agent</h2>
              <span className="text-[11px] font-medium text-blue-400">IBM Watson Assistant Integration</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Intelligent wealth management, automated budgeting, and AI-powered conversational financial guidance.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h3>
            <span className="text-xs text-slate-500">
              {isRegister ? 'Step into Smart Finance' : 'Sign in to dashboard'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yashmitha S."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Monthly Income (₹)
                </label>
                <input
                  type="number"
                  required
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="85000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{isRegister ? 'Register & Enter Dashboard' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo One-Click Access for Placement Evaluation */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Click Placement Demo Access</span>
            </button>
          </div>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up with Monthly Income"}
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>IBM Watson v2 Architecture • Encrypted Local Vault</span>
        </div>
      </div>
    </div>
  );
}
