import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface ServiceManagerProps {
  bookings: any[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  showToast?: any; // kept for compatibility
}

export const ServiceManager = ({ bookings, onUpdateStatus }: ServiceManagerProps) => {

  const filteredBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="space-y-8 fade-in">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Bookings</h2>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Review and approve new service bookings.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Client</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Service</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Date & Time</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold uppercase tracking-tight">{b.user_name || 'Anonymous'}</p>
                  <p className="text-[10px] text-white/40">{b.user_email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 rounded bg-white/10 text-xs font-bold uppercase">
                    {b.service_type === 'pt' ? 'Personal Training' : String(b.service_type || 'General').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-white/80 font-bold">{b.date || b.requested_date}</p>
                  <p className="text-[10px] text-brand-teal uppercase font-bold tracking-widest mt-1">
                    {b.time_slot || b.requested_time}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'rejected')}
                      className="p-2 rounded bg-brand-coral/10 text-brand-coral hover:bg-brand-coral hover:text-black transition-all flex items-center gap-2 text-xs font-bold uppercase px-4"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'approved')}
                      className="p-2 rounded bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-black transition-all flex items-center gap-2 text-xs font-bold uppercase px-4"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="p-12 text-center text-white/40 text-sm">
             <Calendar size={48} className="mx-auto opacity-20 mb-4" />
             No pending bookings right now.
          </div>
        )}
      </div>
    </div>
  );
};
