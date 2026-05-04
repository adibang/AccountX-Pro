import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, AlertCircle, Loader2, Search, Download } from "lucide-react";
import { Account, JournalEntry, Transaction } from "../types";
import { firebaseService } from "../services/firebaseService";
import { cn } from "../lib/utils";

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Entry State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([
    { accountId: "", accountName: "", debit: 0, credit: 0 },
    { accountId: "", accountName: "", debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    firebaseService.getAccounts().then(setAccounts);
    const unsub = firebaseService.listenEntries(setEntries);
    return () => unsub();
  }, []);

  const totalDebit = transactions.reduce((sum, t) => sum + Number(t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + Number(t.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.referenceCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addTransactionRow = () => {
    setTransactions([...transactions, { accountId: "", accountName: "", debit: 0, credit: 0 }]);
  };

  const removeTransactionRow = (index: number) => {
    if (transactions.length > 2) {
      setTransactions(transactions.filter((_, i) => i !== index));
    }
  };

  const updateTransaction = (index: number, field: keyof Transaction, value: any) => {
    const updated = [...transactions];
    if (field === "accountId") {
      const account = accounts.find(a => a.id === value);
      updated[index].accountId = value;
      updated[index].accountName = account?.name || "";
    } else {
      updated[index][field] = value;
    }
    setTransactions(updated);
  };

  const handleSave = async () => {
    if (!isBalanced) return;
    setIsSaving(true);
    
    try {
      const validTransactions = transactions.filter(t => t.accountId && (t.debit > 0 || t.credit > 0));
      const entry: Omit<JournalEntry, 'id'> = {
        date,
        referenceCode: reference,
        description,
        transactions: validTransactions,
        createdAt: new Date().toISOString(),
        createdBy: "", // Handled by service
      };

      await firebaseService.saveJournalEntry(entry, validTransactions);
      setShowForm(false);
      // Reset form
      setDescription("");
      setReference("");
      setTransactions([
        { accountId: "", accountName: "", debit: 0, credit: 0 },
        { accountId: "", accountName: "", debit: 0, credit: 0 },
      ]);
    } catch (error) {
       console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Jurnal Umum</h2>
          <p className="text-sm text-slate-500">Catat transaksi keuangan harian Anda.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Entry Baru
          </button>
        )}
      </div>
      
      {!showForm && (
        <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari referensi atau keterangan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-12 py-3 bg-white"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2 w-full md:w-auto h-full px-6 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      )}

      {showForm && (
        <div className="card p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Entry Jurnal Baru</h3>
            <button 
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="input-field w-full" 
              />
            </div>
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">No. Referensi</label>
              <input 
                type="text" 
                placeholder="REV-001" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                className="input-field w-full" 
              />
            </div>
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Keterangan</label>
              <input 
                type="text" 
                placeholder="Penjualan barang..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="input-field w-full" 
              />
            </div>
          </div>

          <div className="overflow-x-auto min-w-full mb-6 border border-slate-100 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">Akun</th>
                  <th className="py-3 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right w-32 whitespace-nowrap">Debit (Rp)</th>
                  <th className="py-3 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right w-32 whitespace-nowrap">Kredit (Rp)</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, index) => (
                  <tr key={index} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 px-2">
                      <select 
                        value={t.accountId} 
                        onChange={(e) => updateTransaction(index, "accountId", e.target.value)}
                        className="w-full bg-transparent outline-none text-sm"
                      >
                        <option value="">Pilih Akun...</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="number" 
                        value={t.debit || ""} 
                        onChange={(e) => updateTransaction(index, "debit", Number(e.target.value))}
                        className="w-full text-right bg-transparent outline-none text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="number" 
                        value={t.credit || ""} 
                        onChange={(e) => updateTransaction(index, "credit", Number(e.target.value))}
                        className="w-full text-right bg-transparent outline-none text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <button 
                        onClick={() => removeTransactionRow(index)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-3 px-2 text-sm text-slate-600 uppercase">Total</td>
                  <td className={cn(
                    "py-3 px-2 text-right text-sm",
                    isBalanced ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {totalDebit.toLocaleString()}
                  </td>
                  <td className={cn(
                    "py-3 px-2 text-right text-sm",
                    isBalanced ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {totalCredit.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <button 
              onClick={addTransactionRow}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Tambah Baris
            </button>
            
            <div className="flex items-center gap-4">
              {!isBalanced && totalDebit > 0 && (
                <div className="flex items-center gap-1 text-rose-500 text-xs font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Jurnal tidak balance
                </div>
              )}
              <button 
                onClick={handleSave}
                disabled={!isBalanced || !description || !reference}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                  isBalanced && description && reference
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                Simpan Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Referensi</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Keterangan</th>
                <th className="py-3 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    {searchTerm ? "Tidak ada hasil pencarian." : "Belum ada transaksi jurnal."}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 md:px-6 text-sm text-slate-600 font-medium whitespace-nowrap">{entry.date}</td>
                    <td className="py-4 px-4 md:px-6 text-sm text-slate-900 font-bold whitespace-nowrap">{entry.referenceCode}</td>
                    <td className="py-4 px-4 md:px-6 text-sm text-slate-600 min-w-[200px]">{entry.description}</td>
                    <td className="py-4 px-4 md:px-6 text-sm text-right text-slate-900 font-bold whitespace-nowrap">
                      Rp {entry.transactions.reduce((sum, t) => sum + t.debit, 0).toLocaleString()}
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
