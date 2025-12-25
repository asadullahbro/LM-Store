'use client';

import { useState } from 'react';
import { secureFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AddToCartProps {
  productId: number;
}

export default function AddToCartButton({ productId }: AddToCartProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setLoading(true);

    try {
      // We use our 'secureFetch' wrapper so it automatically 
      // adds the Bearer token and handles the Refresh Token flow
      const response = await secureFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (response?.status === 401) {
        // If even the refresh token failed, send them to login
        router.push('/login');
        return;
      }

      if (response?.ok) {
        alert('Added to cart successfully! 🛒');
      } else {
        const errorData = await response?.json();
        alert(`Error: ${errorData.detail || 'Could not add item'}`);
      }
    } catch (error) {
      console.error('Cart Error:', error);
      alert('Something went wrong. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`mt-4 w-full flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white transition-all 
        ${loading 
          ? 'bg-slate-400 cursor-not-allowed' 
          : 'bg-slate-900 hover:bg-black active:scale-95'
        }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Adding...
        </span>
      ) : (
        'Add to Cart'
      )}
    </button>
  );
}