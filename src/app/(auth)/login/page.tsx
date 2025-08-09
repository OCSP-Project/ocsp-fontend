'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password } as any);
    router.push('/dashboard');
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Đăng nhập</h1>
      <input className="w-full border p-2 rounded mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded mb-4" placeholder="Mật khẩu" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="w-full bg-blue-600 text-white py-2 rounded">Đăng nhập</button>
    </form>
  );
}
