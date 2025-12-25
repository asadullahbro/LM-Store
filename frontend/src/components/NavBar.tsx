'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, LogOut, User, Store, Menu, X, ChevronRight, ShieldCheck } from 'lucide-react';
import Cookies from 'js-cookie';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const checkAuth = () => {
    const token = Cookies.get('access_token');
    setIsLoggedIn(token || null);
    // Also sync role here in case of manual refresh
    setRole(localStorage.getItem('role'));
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();

    const syncAuth = () => {
      checkAuth(); // This handles both token and role
    };

    window.addEventListener('auth-change', syncAuth);
    return () => window.removeEventListener('auth-change', syncAuth);
  }, []);

  const handleLogout = () => {
    Cookies.remove('access_token');
    localStorage.removeItem('role'); // Don't forget to clear this!
    window.dispatchEvent(new Event('auth-change'));
    setIsOpen(false);
    router.push('/login?message=You\'ve been logged out');
  };

  const navLinks = [
    { name: 'Store', href: '/', icon: Store },
    { name: 'Cart', href: '/cart', icon: ShoppingCart },
    { name: 'Orders', href: '/orders', icon: Package },
  ];

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-[100] w-full px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto bg-white/80 h-[68px] rounded-[2rem] border border-slate-100 shadow-sm" />
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-[100] w-full px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2rem] px-4 md:px-6 py-3 flex items-center justify-between">
        
        {/* Left Side: Logo & Desktop Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Store size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">LM</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </motion.div>
                </Link>
              );
            })}

            {/* INTEGRATED ADMIN BUTTON (DESKTOP) */}
            {isLoggedIn && role === 'admin' && (
              <Link href="/admin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all bg-purple-600 text-white shadow-lg shadow-purple-200 ml-2`}
                >
                  <ShieldCheck size={18} />
                  Admin
                </motion.div>
              </Link>
            )}
          </div>
        </div>

        {/* Right Side: Profile & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout}
                className="hidden md:flex p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={20} />
              </button>
              <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User size={20} />
              </div>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-black shadow-lg shadow-blue-200">
              Join
            </Link>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="md:hidden absolute top-24 left-4 right-4 bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] shadow-2xl p-6 z-[101]"
          >
            <div className="flex flex-col gap-3">
              {/* MOBILE ADMIN LINK */}
              {isLoggedIn && role === 'admin' && (
                <Link 
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl font-black bg-purple-600 text-white mb-2 shadow-lg shadow-purple-100"
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={22} />
                    Admin Panel
                  </div>
                  <ChevronRight size={18} />
                </Link>
              )}

              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                    pathname === link.href ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <link.icon size={22} />
                    {link.name}
                  </div>
                  <ChevronRight size={18} className="opacity-30" />
                </Link>
              ))}
              
              {isLoggedIn && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-4 text-red-500 font-bold border-t border-slate-50 mt-2"
                >
                  <LogOut size={22} />
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}