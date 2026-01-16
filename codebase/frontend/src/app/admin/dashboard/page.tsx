'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = {
  username: string;
  role: string;
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Verify token
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Invalid token');
      }
    })
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(() => {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-babylon-lapis-900">
        <div className="text-babylon-gold-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-babylon-lapis-900">
      {/* Header */}
      <header className="bg-babylon-lapis-800 border-b border-babylon-gold-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-babylon-sand-100">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-babylon-sand-300">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-babylon-gold-500 hover:text-babylon-gold-400 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-babylon-gold-600/20 rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium text-babylon-sand-100 mb-2">
                Admin Dashboard Under Construction
              </h3>
              <p className="text-babylon-sand-300 mb-6">
                Archive management tools will be available here soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-babylon-sand-400">Planned features:</p>
                <ul className="text-sm text-babylon-sand-400 space-y-1">
                  <li>• Upload new content</li>
                  <li>• Edit metadata</li>
                  <li>• Manage creators</li>
                  <li>• View statistics</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  href="/"
                  className="text-babylon-gold-500 hover:text-babylon-gold-400"
                >
                  ← Back to Archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}