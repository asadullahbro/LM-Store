'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Image as ImageIcon, DollarSign, Box, Type, Loader2 } from 'lucide-react';
import { secureFetch } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image_url: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await secureFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      });

      if (res.ok) {
        setFormData({ name: '', price: '', stock: '', image_url: '', description: '' });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Failed to add product", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">New Inventory</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Add product to store</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-2 ml-1">
                  <Type size={14} /> Product Name
                </label>
                <input 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  placeholder="e.g., iPhone 15 Pro"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-2 ml-1">
                  <DollarSign size={14} /> Price
                </label>
                <input 
                  required type="number" step="0.01"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  placeholder="999.99"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>

              {/* Stock */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-2 ml-1">
                  <Box size={14} /> Stock Units
                </label>
                <input 
                  required type="number"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  placeholder="50"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-2 ml-1">
                  <ImageIcon size={14} /> Image URL
                </label>
                <input 
                  required type="url"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  placeholder="https://images.com/iphone.png"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> LIST PRODUCT</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}