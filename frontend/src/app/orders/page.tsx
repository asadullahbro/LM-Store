'use client';

import { useState, useEffect } from 'react';
import { secureFetch } from '@/lib/api';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await secureFetch('/orders');
        if (res.ok) {
          const data = await res.json();
          // Ensure we are setting the array correctly
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 font-bold">Loading Orders...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 mb-8"
      >
        Order History
      </motion.h1>

      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order Reference</p>
                  <p className="font-mono text-lg text-slate-900 font-bold">#ORD-{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">User ID</p>
                  <p className="text-sm font-semibold text-slate-700">{order.user_id}</p>
                </div>
                <div className="col-span-2 md:col-span-1 md:text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Paid</p>
                  {/* Matching your 'total_amount' key */}
                  <p className="text-3xl font-black text-slate-900">${order.total_amount}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}