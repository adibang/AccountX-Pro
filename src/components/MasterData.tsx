import React, { useEffect, useState } from "react";
import { firebaseService } from "../services/firebaseService";
import { Account, AccountType } from "../types";
import { cn } from "../lib/utils";

export const MasterData: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    firebaseService.getAccounts().then(setAccounts);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Bagan Akun (Chart of Accounts)</h2>
        <p className="text-slate-500">Daftar seluruh akun yang digunakan dalam sistem akuntansi Anda.</p>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Akun</th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
              <th className="text-right py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-mono text-indigo-600 font-bold">{acc.code}</td>
                <td className="py-4 px-6 text-sm text-slate-900 font-medium">{acc.name}</td>
                <td className="py-4 px-6">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                    acc.type === AccountType.ASSET ? "bg-blue-50 text-blue-700" :
                    acc.type === AccountType.LIABILITY ? "bg-amber-50 text-amber-700" :
                    acc.type === AccountType.EQUITY ? "bg-purple-50 text-purple-700" :
                    acc.type === AccountType.REVENUE ? "bg-emerald-50 text-emerald-700" :
                    "bg-rose-50 text-rose-700"
                  )}>
                    {acc.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-right text-slate-900 font-mono">
                  {acc.currentBalance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
