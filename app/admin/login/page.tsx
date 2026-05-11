'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Sai mật khẩu');
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl text-dark text-center mb-2">
          Quản lý thiệp cưới
        </h1>
        <p className="font-body text-sm text-mid text-center mb-8">
          Nhập mật khẩu để tiếp tục
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
            className="font-body border border-cream-3 rounded-lg px-4 py-3 text-dark bg-cream focus:outline-none focus:ring-2 focus:ring-burg focus:border-transparent"
          />

          {error && (
            <p className="font-body text-sm text-burg text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-body bg-burg text-cream rounded-lg px-4 py-3 font-medium tracking-wide disabled:opacity-60 hover:bg-burg-2 transition-colors"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
