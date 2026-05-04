import React, { useEffect, useState } from "react";
import { Plus, X, Search, Loader2 } from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { Account, AccountType } from "../types";
import { cn } from "../lib/utils";

export const MasterData: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(AccountType.ASSET);
  const [initialBalance, setInitialBalance] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const data = await firebaseService.getAccounts();
    setAccounts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    const newAccount: Account = {
      id: `acc-${code}`,
      code,
      name,
      type,
      initialBalance,
      currentBalance: initialBalance
    };

    await firebaseService.addAccount(newAccount);
    setShowForm(false);
    setCode("");
    setName("");
    setInitialBalance(0);
    fetchAccounts();
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.code.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Bagan Akun (COA)</h2>
          <p className="text-sm text-slate-500">Kelola rincian akun untuk sistem akuntansi Anda.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Akun
        </button>
      </header>

      {showForm && (
        <div className="card p-6 border-indigo-200 bg-indigo-50/30 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Input Akun Baru</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Kode Akun</label>
              <input 
                required
                type="text" 
                placeholder="1101"
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="input-field w-full" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Nama Akun</label>
              <input 
                required
                type="text" 
                placeholder="Kas Kecil"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="input-field w-full" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Tipe Akun</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as AccountType)} 
                className="input-field w-full"
              >
                {Object.values(AccountType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Saldo Awal (Rp)</label>
              <input 
                type="number" 
                value={initialBalance} 
                onChange={(e) => setInitialBalance(Number(e.target.value))} 
                className="input-field w-full" 
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary px-8">Simpan Akun</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari kode atau nama akun..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full pl-12 py-3"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                <th className="py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Akun</th>
                <th className="py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                <th className="py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Saldo Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-sm">Memuat data akun...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 italic">Data tidak ditemukan.</td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 md:px-6 text-sm font-mono text-indigo-600 font-bold whitespace-nowrap">{acc.code}</td>
                    <td className="py-4 px-4 md:px-6 text-sm text-slate-900 font-medium group-hover:text-indigo-600 transition-colors">{acc.name}</td>
                    <td className="py-4 px-4 md:px-6">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider whitespace-nowrap",
                        acc.type === AccountType.ASSET ? "bg-blue-50 text-blue-700" :
                        acc.type === AccountType.LIABILITY ? "bg-amber-50 text-amber-700" :
                        acc.type === AccountType.EQUITY ? "bg-purple-50 text-purple-700" :
                        acc.type === AccountType.REVENUE ? "bg-emerald-50 text-emerald-700" :
                        "bg-rose-50 text-rose-700"
                      )}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 md:px-6 text-sm text-right text-slate-900 font-mono font-bold whitespace-nowrap">
                      Rp {acc.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
