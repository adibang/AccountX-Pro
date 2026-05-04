import React, { useEffect, useState } from "react";
import { firebaseService } from "../services/firebaseService";
import { Account, JournalEntry, Transaction } from "../types";
import { INITIAL_COA } from "../constants";

export const Ledger: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  useEffect(() => {
    firebaseService.getAccounts().then(setAccounts);
    const unsub = firebaseService.listenEntries(setEntries);
    return () => unsub();
  }, []);

  const ledgerData = entries.flatMap(entry => 
    entry.transactions
      .filter(t => !selectedAccount || t.accountId === selectedAccount)
      .map(t => ({
        date: entry.date,
        ref: entry.referenceCode,
        description: entry.description,
        debit: t.debit,
        credit: t.credit,
        accountId: t.accountId,
        accountName: t.accountName
      }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Buku Besar</h2>
          <p className="text-sm text-slate-500">Rincian mutasi untuk setiap akun.</p>
        </div>
        <select 
          value={selectedAccount} 
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="input-field max-w-xs w-full sm:w-auto"
        >
          <option value="">Semua Akun</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
          ))}
        </select>
      </header>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ref</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Kredit</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Pilih akun atau belum ada transaksi.</td>
                </tr>
              ) : (
                ledgerData.map((item, idx) => {
                  runningBalance += (item.debit - item.credit);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 md:px-6 text-sm text-slate-600 font-medium whitespace-nowrap">{item.date}</td>
                      <td className="py-4 px-4 md:px-6 text-sm text-slate-900 font-bold whitespace-nowrap">{item.ref}</td>
                      <td className="py-4 px-4 md:px-6 text-sm text-slate-600 min-w-[200px]">
                        <div className="font-medium text-slate-900">{item.accountName}</div>
                        <div className="text-xs">{item.description}</div>
                      </td>
                      <td className="py-4 px-4 md:px-6 text-sm text-right text-emerald-600 font-medium whitespace-nowrap">
                        {item.debit > 0 ? item.debit.toLocaleString() : "-"}
                      </td>
                      <td className="py-4 px-4 md:px-6 text-sm text-right text-rose-600 font-medium whitespace-nowrap">
                        {item.credit > 0 ? item.credit.toLocaleString() : "-"}
                      </td>
                      <td className="py-4 px-4 md:px-6 text-sm text-right text-slate-900 font-bold whitespace-nowrap">
                        {runningBalance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
