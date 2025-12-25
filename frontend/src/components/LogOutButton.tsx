'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Clear the Access Token
    Cookies.remove('access_token');

    // 2. Redirect to Login
    router.push('/login');
    
    // 3. Refresh the page to clear any 'isLoggedIn' states in the layout
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-semibold text-red-500 hover:text-red-700 transition px-3 py-1 rounded-md hover:bg-red-50"
    >
      Logout
    </button>
  );
}