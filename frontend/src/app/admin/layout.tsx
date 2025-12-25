'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/'); // Kick them back to home
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return null; // Show nothing while checking

  return <>{children}</>;
}