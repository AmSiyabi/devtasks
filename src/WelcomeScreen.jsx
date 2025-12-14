import React, { useState } from 'react';
import { ArrowRight, Mail, Loader, CheckCircle } from 'lucide-react';

export default function WelcomeScreen({ onComplete }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    const res = await window.api.submitEmail(email);
    setLoading(false);

    if (res.success) {
      setStatus('success');
      // Auto-continue after 1.5 seconds if successful
      setTimeout(() => onComplete(), 1500);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-3xl">⚡</span>
        </div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Welcome to Nodepad</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-md mx-auto">
          A local-first, privacy-focused task manager built for developers.
        </p>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 max-w-sm mx-auto animate-in fade-in zoom-in">
            <div className="flex flex-col items-center gap-2 text-green-500">
              <CheckCircle size={32} />
              <span className="font-bold">You're in! Welcome aboard.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
            <p className="text-sm text-[var(--text-secondary)]">
              Join the community for updates, tips, and news about upcoming premium features.
            </p>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-[var(--text-secondary)]" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] py-3 pl-12 pr-4 rounded-lg focus:outline-none focus:border-blue-500 font-sans text-base"
                required
              />
            </div>
            
            {status === 'error' && <p className="text-xs text-red-400">Something went wrong. Please try again.</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader size={18} className="animate-spin"/> : <>Join & Continue <ArrowRight size={18}/></>}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <button 
            onClick={onComplete}
            className="mt-6 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}