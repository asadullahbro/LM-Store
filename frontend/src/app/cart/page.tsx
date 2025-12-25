'use client';

import { useState, useEffect } from 'react';
import { secureFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, Lock, CheckCircle2, Loader2, 
  ShoppingBag, ArrowLeft, Trash2, Minus, Plus 
} from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'cart' | 'paying' | 'success'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState('Customer');
  const router = useRouter();

  useEffect(() => {
    fetchCart();
    const storedName = localStorage.getItem('username');
    if (storedName) setUserName(storedName);
  }, []);

  const fetchCart = async () => {
    try {
      const res = await secureFetch('/cart');
      if (res.ok) {
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. UPDATE QUANTITY LOGIC
  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }

    // Optimistic UI Update (Update screen instantly before API finishes)
    setCartItems(prev => prev.map(item => 
      item.product_id === productId ? { ...item, quantity: newQty } : item
    ));

    try {
      // Assuming your backend has a PUT/POST endpoint for qty
      await secureFetch(`/cart/add`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: newQty })
      });
      // Sync Navbar count
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to update qty", err);
    }
  };

  // 2. REMOVE FROM CART LOGIC
  const removeFromCart = async (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
    
    try {
      await secureFetch(`/cart/remove/${productId}`, { method: 'DELETE' });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleFakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(async () => {
      try {
        const res = await secureFetch('/checkout', { method: 'POST' });
        if (res.ok) {
          setStep('success');
          window.dispatchEvent(new Event("cart-updated")); // Clear navbar bubble
        } else {
          alert("Payment Declined.");
          setStep('cart');
        }
      } catch (err) {
        console.error("Checkout error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-400 font-bold tracking-widest uppercase">Syncing your gear</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: CART LIST */}
        {step === 'cart' && (
          <motion.div key="cart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-10">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Cart</h1>
              <p className="text-slate-500 font-medium">Review your items before payment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.product_id}
                      layout
                      className="flex flex-wrap md:flex-nowrap items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-blue-100 transition-all"
                    >
                      <img src={item.image_url} alt={item.name} className="w-24 h-24 object-contain bg-slate-50 rounded-2xl p-2" />
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-extrabold text-black leading-tight">{item.name}</h3>
                        <p className="text-blue-600 font-black mt-1">${item.price}</p>
                      </div>

                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-900">
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-black text-slate-900 text-lg">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-900">
                          <Plus size={16} />
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(item.product_id)} className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <ShoppingBag className="mx-auto text-slate-200 mb-4" size={60} />
                    <p className="text-slate-400 text-lg font-bold">Your cart is empty</p>
                    <button onClick={() => router.push('/')} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Start Shopping</button>
                  </div>
                )}
              </div>

              {/* SUMMARY PANEL */}
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl h-fit sticky top-24">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-500 font-medium"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-500 font-medium"><span>Shipping</span><span className="text-green-600 font-bold">FREE</span></div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total</span>
                    <span className="text-3xl font-black text-slate-900">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setStep('paying')} 
                  disabled={cartItems.length === 0}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl mt-8 shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none"
                >
                  CHECKOUT
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PAYMENT (MODAL OVERLAY STYLE) */}
        {step === 'paying' && (
          <motion.div key="paying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setStep('cart')} className="absolute top-8 left-8 text-slate-400 hover:text-slate-900"><ArrowLeft size={24}/></button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">Secure Pay</h2>
                <p className="text-slate-500 font-medium">Total: ${totalPrice.toFixed(2)}</p>
              </div>

              <form onSubmit={handleFakePayment} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest block mb-1">Card Number</label>
                  <input 
      type="text" 
      placeholder="4242 4242 4242 4242" 
      className="w-full bg-transparent font-mono text-lg outline-none text-slate-900 placeholder:text-slate-300 font-bold" 
      required 
    />                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300">
<label className="text-xs font-black text-slate-700 uppercase block mb-1">Expiry</label>
      <input 
        type="text" 
        placeholder="MM/YY" 
        className="w-full bg-transparent outline-none text-slate-900 font-bold" 
        required 
      />                  
      </div>
<div className="bg-slate-50 p-4 rounded-2xl border border-slate-300">
      <label className="text-xs font-black text-slate-700 uppercase block mb-1">CVC</label>
      <input 
        type="text" 
        placeholder="***" 
        className="w-full bg-transparent outline-none text-slate-900 font-bold" 
        required 
      />
    </div>
  </div>

                <button
                  disabled={isProcessing}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-xl"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : `CONFIRM PAYMENT`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-blue-600 text-white p-6 text-center">
            <div className="max-w-md">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-full inline-block mb-8">
                <CheckCircle2 size={80} className="text-blue-600" />
              </motion.div>
              <h1 className="text-6xl font-black mb-4 tracking-tighter">SUCCESS!</h1>
              <p className="text-blue-100 text-xl mb-12">Nice choice, {userName}! Your tech gear is officially being packed.</p>
              <button onClick={() => router.push('/orders')} className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-slate-50 transition-colors">
                TRACK ORDER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}