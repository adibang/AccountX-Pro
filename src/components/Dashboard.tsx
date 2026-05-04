import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Layers
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";
import { firebaseService } from "../services/firebaseService";
import { Account, AccountType, JournalEntry } from "../types";
import { cn } from "../lib/utils";

export const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [accs, entries] = await Promise.all([
        firebaseService.getAccounts(),
        firebaseService.getJournalEntries()
      ]);
      setAccounts(accs);
      setRecentEntries(entries.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalRevenue = accounts.filter(a => a.type === AccountType.REVENUE).reduce((sum, a) => sum + a.currentBalance, 0);
  const totalExpense = accounts.filter(a => a.type === AccountType.EXPENSE).reduce((sum, a) => sum + a.currentBalance, 0);
  const netProfit = totalRevenue - totalExpense;
  const cashBalance = accounts.filter(a => a.code.startsWith('11')).reduce((sum, a) => sum + a.currentBalance, 0);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard Finansial</h2>
        <p className="text-sm text-slate-500">Ringkasan performa keuangan bisnis Anda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          change="+0%" 
          isPositive={true} 
          icon={TrendingUp} 
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard 
          title="Total Beban" 
          value={`Rp ${totalExpense.toLocaleString()}`} 
          change="+0%" 
          isPositive={false} 
          icon={TrendingDown} 
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <StatCard 
          title="Laba Bersih" 
          value={`Rp ${netProfit.toLocaleString()}`} 
          change="+0%" 
          isPositive={netProfit >= 0} 
          icon={DollarSign} 
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard 
          title="Saldo Kas & Bank" 
          value={`Rp ${cashBalance.toLocaleString()}`} 
          change="+0%" 
          isPositive={true} 
          icon={Wallet} 
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Struktur Keuangan</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Pendapatan', value: totalRevenue },
                { name: 'Beban', value: totalExpense },
                { name: 'Laba Bersih', value: netProfit }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Komposisi Akun Utama</h3>
          <div className="space-y-6">
            {accounts.filter(a => a.currentBalance > 0).slice(0, 4).map(acc => (
              <div key={acc.id} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">{acc.name}</span>
                  <span className="font-mono text-slate-400">Rp {acc.currentBalance.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (acc.currentBalance / Math.max(totalRevenue, totalExpense, 1000000)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-6 border-t border-slate-100 mt-6">
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Akun</div>
                  <div className="text-lg font-bold text-slate-900">{accounts.length} Akun Terdaftar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6">Aktivitas Terakhir</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentEntries.length === 0 ? (
            <p className="col-span-full text-sm text-slate-400 italic py-10 text-center">Belum ada transaksi.</p>
          ) : (
            recentEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{entry.referenceCode}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{entry.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">
                    Rp {entry.transactions.reduce((sum, t) => sum + t.debit, 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{entry.date}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

function totalAssets(accounts: Account[]) {
  return accounts.filter(a => a.type === AccountType.ASSET).reduce((sum, a) => sum + a.currentBalance, 0);
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, color, bgColor }) => (
  <div className="card p-6 border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-xl", bgColor)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h4 className="text-xl md:text-2xl font-bold text-slate-900 mt-2 font-mono">{value}</h4>
    </div>
  </div>
);
