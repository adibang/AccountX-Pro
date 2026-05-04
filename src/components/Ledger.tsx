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
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Buku Besar</h2>
          <p className="text-slate-500">Rincian mutasi untuk setiap akun.</p>
        </div>
        <select 
          value={selectedAccount} 
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">Semua Akun</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
          ))}
        </select>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref</th>
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
              <th className="text-right py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Debit</th>
              <th className="text-right py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Kredit</th>
              <th className="text-right py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
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
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">{item.date}</td>
                    <td className="py-4 px-6 text-sm text-slate-900 font-bold">{item.ref}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      <div className="font-medium text-slate-900">{item.accountName}</div>
                      <div className="text-xs">{item.description}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-emerald-600 font-medium">
                      {item.debit > 0 ? item.debit.toLocaleString() : "-"}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-rose-600 font-medium">
                      {item.credit > 0 ? item.credit.toLocaleString() : "-"}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-slate-900 font-bold">
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
  );
};
