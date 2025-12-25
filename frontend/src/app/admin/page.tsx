'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { secureFetch } from '@/lib/api';
import AddProductModal from '@/components/AddProductModal';
import { 
  Package, TrendingUp, Users, Plus, Loader2, 
  ShieldAlert, Edit3, Trash2, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [products, setProducts] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    try {
      const userRes = await secureFetch('/admin/users');
      if (!userRes.ok) return setStatus('denied');
      
      const userData = await userRes.json();
      setUsersCount(userData.length);

      const prodRes = await secureFetch('/products');
      const prodData = await prodRes.json();
      setProducts(prodData);
      setStatus('authorized');
    } catch (err) {
      setStatus('denied');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEditStock = async (id: number, currentStock: number) => {
    const newVal = prompt("Enter new stock quantity:", currentStock.toString());
    if (newVal !== null) {
      const res = await secureFetch(`/admin/product/${id}/stock?stock=${newVal}`, { method: 'PUT' });
      if (res.ok) loadData();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Archive this product? It can be restored later.")) {
      const res = await secureFetch(`/admin/deactive/${id}`, { method: 'POST' });
      if (res.ok) loadData();
    }
  };

  if (status === 'loading') return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (status === 'denied') return <div className="h-screen flex items-center justify-center text-red-500 font-black">ACCESS DENIED</div>;

  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
        
        {/* MAIN SECTION */}
        <div className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Inventory</h1>
            <div className="flex gap-4">
                
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4">
                 <div><p className="text-[10px] font-black text-slate-500 uppercase">Total Users</p><p className="font-bold text-blue-600">{usersCount}</p></div>
                 <div className="w-px h-full bg-slate-100" />
                 <div><p className="text-[10px] font-black text-slate-400 uppercase">Products</p><p className="font-bold text-blue-600">{products.length}</p></div>
              </div>
              <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              <Plus size={24} strokeWidth={3} /> ADD PRODUCT
            </button>
                {/* AddProductModal Component */}
                {isModalOpen && (
                    <AddProductModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={loadData}
                    />
                )}
            </div>
          </div>
                
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                <tr>
                  <th className="p-6">Product</th>
                  <th className="p-6">Stock Level</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(p => (
                  <tr key={p.id} className="group hover:bg-slate-50/50">
                    <td className="p-6">
                      <p className="font-extrabold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400 font-bold">${p.price}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${p.stock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                          {p.stock} Units
                        </span>
                        {p.stock < 5 && <span className="bg-orange-100 text-orange-600 text-[8px] px-2 py-0.5 rounded-full font-black">LOW</span>}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditStock(p.id, p.stock)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR: Out of Stock Alerts */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 sticky top-28 shadow-2xl shadow-slate-300">
            <div className="flex items-center gap-3 mb-8">
              <AlertCircle className="text-red-500" />
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Critical Stock</h2>
            </div>

            <div className="space-y-4">
              {outOfStock.length > 0 ? outOfStock.map(p => (
                <div key={p.id} onClick={() => handleEditStock(p.id, p.stock)} className="bg-white/10 border border-white/5 p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-all">
                  <p className="text-white font-bold text-sm">{p.name}</p>
                  <p className="text-red-400 text-[10px] font-black uppercase mt-1">Sold Out</p>
                </div>
              )) : (
                <div className="text-center py-10">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={40} />
                  <p className="text-slate-400 font-bold text-sm leading-relaxed">Everything is<br/>Perfectly in Stock</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}