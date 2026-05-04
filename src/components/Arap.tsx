import React, { useState, useEffect } from "react";
import { CreditCard, TrendingUp, TrendingDown, ArrowRight, User, Loader2 } from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { Account, AccountType } from "../types";
import { cn } from "../lib/utils";

export const Arap: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await firebaseService.getAccounts();
      setAccounts(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const arAccounts = accounts.filter(a => a.code.startsWith("12") || a.name.toLowerCase().includes("piutang"));
  const apAccounts = accounts.filter(a => a.code.startsWith("21") || a.name.toLowerCase().includes("hutang"));

  const totalAr = arAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalAp = apAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Memuat ringkasan hutang & piutang...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Hutang & Piutang</h2>
        <p className="text-sm text-slate-500">Pantau saldo kewajiban dan tagihan Anda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard 
          title="Total Piutang (AR)" 
          amount={totalAr} 
          subtitle="Tagihan yang belum dibayar pelanggan"
          icon={<TrendingUp className="w-6 h-6" />}
          colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <SummaryCard 
          title="Total Hutang (AP)" 
          amount={totalAp} 
          subtitle="Kewajiban pembayaran kepada pemasok"
          icon={<TrendingDown className="w-6 h-6" />}
          colorClass="bg-rose-50 text-rose-600 border-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Rincian Piutang
          </h3>
          <div className="card divide-y divide-slate-100">
            {arAccounts.length === 0 ? (
              <p className="p-12 text-center text-slate-400 italic">Tidak ada saldo piutang.</p>
            ) : (
              arAccounts.map(acc => (
                <div key={acc.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="text-xs font-mono text-slate-400">{acc.code}</span>
                    <h4 className="text-sm font-bold text-slate-700">{acc.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-slate-900">Rp {acc.currentBalance.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Aktif</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-600" /> Rincian Hutang
          </h3>
          <div className="card divide-y divide-slate-100">
            {apAccounts.length === 0 ? (
              <p className="p-12 text-center text-slate-400 italic">Tidak ada saldo hutang.</p>
            ) : (
              apAccounts.map(acc => (
                <div key={acc.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="text-xs font-mono text-slate-400">{acc.code}</span>
                    <h4 className="text-sm font-bold text-slate-700">{acc.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-slate-900">Rp {acc.currentBalance.toLocaleString()}</span>
                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Jatuh Tempo</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="card p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold">Butuh Penagihan Lebih Cepat?</h4>
            <p className="text-sm text-slate-400">Gunakan modul Invoice untuk mengirim tagihan otomatis ke email pelanggan.</p>
          </div>
        </div>
        <button className="btn-primary py-2 px-6">Buka Invoice</button>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ title: string; amount: number; subtitle: string; icon: any; colorClass: string }> = ({ title, amount, subtitle, icon, colorClass }) => (
  <div className={cn("card p-6 flex items-start gap-4 border-l-4", colorClass)}>
    <div className="p-3 bg-white rounded-xl shadow-sm">
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{title}</h4>
      <div className="text-2xl font-bold mb-1">Rp {amount.toLocaleString()}</div>
      <p className="text-xs opacity-60 font-medium">{subtitle}</p>
    </div>
  </div>
);
