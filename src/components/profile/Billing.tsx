import { FileText, CreditCard, Calendar, CheckCircle, RefreshCw } from 'lucide-react';
import { UserProfile, BillingHistory } from '../../types';

export const Billing = ({ user, showToast }: { user: UserProfile, showToast: any }) => {
  // Scaffold dummy history, easily replaceable with stripe webhooks
  const history: BillingHistory[] = [
    { id: 'inv_12345', user_id: user.id, amount: 59.00, status: 'paid', date: '2026-07-24', description: 'Elite Membership - Monthly' },
    { id: 'inv_12344', user_id: user.id, amount: 59.00, status: 'paid', date: '2026-06-24', description: 'Elite Membership - Monthly' },
    { id: 'inv_12343', user_id: user.id, amount: 59.00, status: 'paid', date: '2026-05-24', description: 'Elite Membership - Monthly' },
  ];

  return (
    <div className="space-y-12 fade-in">
      <header>
        <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-tighter">
          Billing & <span className="text-brand-teal">Payments</span>
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">
          Manage your subscription and payment methods
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-gradient p-8 space-y-8">
          <div className="flex items-center gap-4">
            <CreditCard size={24} className="text-brand-teal" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Active Plan</h3>
          </div>
          
          <div className="p-6 bg-brand-teal/10 border border-brand-teal/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-white">{user.tier || 'Basic'} Tier</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-teal mt-1">Billed Monthly</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-teal">$59.00</p>
              <p className="text-[8px] uppercase tracking-widest text-white/40">USD / mo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest font-bold text-white/40">Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest">Active</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest font-bold text-white/40">Next Billing Date</span>
              <span className="text-xs uppercase font-bold text-white tracking-widest">Aug 24, 2026</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest font-bold text-white/40">Auto-Pay</span>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-bold text-white tracking-widest">Enabled</span>
                <button 
                  onClick={() => showToast('Toggle auto-pay functionality to be wired up')}
                  className="w-8 h-4 bg-brand-teal rounded-full relative"
                >
                  <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-black rounded-full shadow" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient p-8 space-y-8">
          <div className="flex items-center gap-4 text-white">
            <CreditCard size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">Payment Method</h3>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-white/10 rounded overflow-hidden flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full translate-x-1.5" />
                <div className="w-6 h-6 border-2 border-white/50 rounded-full -translate-x-1.5 backdrop-blur-sm" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-tight tracking-widest">•••• •••• •••• 4242</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Expires 12/28</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-white/10 text-white text-[8px] uppercase tracking-widest font-bold rounded">Default</span>
          </div>

          <button 
            className="w-full py-4 border border-white/20 hover:border-brand-teal transition-all text-[10px] uppercase font-bold tracking-widest rounded-xl"
            onClick={() => showToast('Payment UI modal flow to be integrated with Stripe')}
          >
            Update Payment Method
          </button>
        </div>
      </div>

      <div className="card-gradient overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <FileText size={20} className="text-white/40" />
            <h3 className="text-lg font-bold uppercase tracking-tight">Billing History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Date</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Amount</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
                <th className="px-8 py-4 text-[10px] text-right uppercase tracking-widest text-white/40 font-bold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/80">
                    {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-4 text-xs tracking-tight">{invoice.description}</td>
                  <td className="px-8 py-4 text-xs font-bold font-mono">${invoice.amount.toFixed(2)}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded text-[8px] uppercase tracking-widest font-bold ${
                      invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-coral/10 text-brand-coral'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="text-[10px] text-brand-teal uppercase tracking-widest font-bold hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
