import React, { useState, useEffect } from "react";
import { FileText, Download, Printer, Calculator, ArrowLeft, ChevronRight } from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { Account, AccountType } from "../types";
import { cn } from "../lib/utils";

type ReportType = "PL" | "BS" | "TB" | "CF" | null;

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedReport) {
      setLoading(true);
      firebaseService.getAccounts().then(data => {
        setAccounts(data);
        setLoading(false);
      });
    }
  }, [selectedReport]);

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedReport(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Laporan
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Menghitung data laporan...</p>
          </div>
        ) : (
          <>
            {selectedReport === "PL" && <ProfitLossReport accounts={accounts} />}
            {selectedReport === "BS" && <BalanceSheetReport accounts={accounts} />}
            {selectedReport === "TB" && <TrialBalanceReport accounts={accounts} />}
            {selectedReport === "CF" && <CashFlowReport accounts={accounts} />}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Laporan Keuangan</h2>
        <p className="text-sm text-slate-500">Hasil otomatis dari seluruh transaksi yang tercatat.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Laporan Laba Rugi" 
          description="Ringkasan pendapatan dan beban untuk periode tertentu."
          icon={Calculator}
          onClick={() => setSelectedReport("PL")}
        />
        <ReportCard 
          title="Neraca (Balance Sheet)" 
          description="Posisi aset, kewajiban, dan ekuitas perusahaan."
          icon={FileText}
          onClick={() => setSelectedReport("BS")}
        />
        <ReportCard 
          title="Neraca Saldo" 
          description="Daftar seluruh saldo akun sebelum penyesuaian."
          icon={Printer}
          onClick={() => setSelectedReport("TB")}
        />
        <ReportCard 
          title="Arus Kas" 
          description="Laporan pergerakan kas masuk dan keluar (Metode Langsung)."
          icon={Download}
          onClick={() => setSelectedReport("CF")}
        />
      </div>

      <div className="card p-12 text-center text-slate-400">
        <Calculator className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>Pilih salah satu laporan di atas untuk melihat detail data.</p>
      </div>
    </div>
  );
};

const ReportCard: React.FC<{ title: string; description: string; icon: any; onClick: () => void }> = ({ title, description, icon: Icon, onClick }) => (
  <div 
    onClick={onClick}
    className="card p-6 md:p-8 hover:border-indigo-400 hover:shadow-xl transition-all group cursor-pointer border-transparent ring-1 ring-slate-100"
  >
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all duration-300">
      <Icon className="w-6 h-6 text-slate-400 group-hover:text-white" />
    </div>
    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
    <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
      Lihat Laporan <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </div>
);

const ProfitLossReport: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const revenues = accounts.filter(a => a.type === AccountType.REVENUE);
  const expenses = accounts.filter(a => a.type === AccountType.EXPENSE);
  
  const totalRevenue = revenues.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalExpense = expenses.reduce((sum, a) => sum + a.currentBalance, 0);
  const netProfit = totalRevenue - totalExpense;

  const handleExport = () => {
    const rows = [
      ["Kategori", "Akun", "Saldo"],
      ["PENDAPATAN", "", ""],
      ...revenues.map(a => ["", a.name, a.currentBalance]),
      ["Total Pendapatan", "", totalRevenue],
      ["", "", ""],
      ["BEBAN", "", ""],
      ...expenses.map(a => ["", a.name, a.currentBalance]),
      ["Total Beban", "", totalExpense],
      ["", "", ""],
      ["LABA BERSIH", "", netProfit]
    ];
    
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laba_Rugi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Laporan Laba Rugi</h3>
          <p className="text-slate-500">Periode: Berjalan</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          {/* Revenues */}
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pendapatan</h4>
            <div className="space-y-3">
              {revenues.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Belum ada pendapatan tercatat.</p>
              ) : (
                revenues.map(acc => (
                  <div key={acc.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{acc.name}</span>
                    <span className="font-mono text-slate-900 font-medium">Rp {acc.currentBalance.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold">
                <span className="text-slate-900 uppercase text-xs tracking-wider">Total Pendapatan</span>
                <span className="text-indigo-600">Rp {totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Expenses */}
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Beban</h4>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Belum ada beban tercatat.</p>
              ) : (
                expenses.map(acc => (
                  <div key={acc.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{acc.name}</span>
                    <span className="font-mono text-slate-900 font-medium">Rp {acc.currentBalance.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold">
                <span className="text-slate-900 uppercase text-xs tracking-wider">Total Beban</span>
                <span className="text-rose-600">Rp {totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Net Profit */}
          <section className="pt-6 border-t-2 border-slate-900 bg-slate-50 -mx-6 md:-mx-8 px-6 md:px-8 py-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-200">
              <span className="text-lg font-bold text-slate-900">LABA (RUGI) BERSIH</span>
              <span className={cn(
                "text-2xl font-mono font-bold",
                netProfit >= 0 ? "text-indigo-600" : "text-rose-600"
              )}>
                Rp {netProfit.toLocaleString()}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const BalanceSheetReport: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const assets = accounts.filter(a => a.type === AccountType.ASSET);
  const liabilities = accounts.filter(a => a.type === AccountType.LIABILITY);
  const equity = accounts.filter(a => a.type === AccountType.EQUITY);
  const revenues = accounts.filter(a => a.type === AccountType.REVENUE);
  const expenses = accounts.filter(a => a.type === AccountType.EXPENSE);
  
  const totalRevenue = revenues.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalExpense = expenses.reduce((sum, a) => sum + a.currentBalance, 0);
  const currentEarnings = totalRevenue - totalExpense;

  const totalAssets = assets.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalEquity = equity.reduce((sum, a) => sum + a.currentBalance, 0) + currentEarnings;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Neraca (Balance Sheet)</h3>
          <p className="text-slate-500">Posisi Keuangan per Hari Ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Assets */}
        <div className="card p-6 md:p-8 space-y-6 self-start">
          <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b pb-3">AKTIVA (Aset)</h4>
          <div className="space-y-4">
            {assets.map(acc => (
              <div key={acc.id} className="flex justify-between text-sm items-center hover:bg-slate-50 p-2 -mx-2 rounded transition-colors">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-slate-400">{acc.code}</span>
                  <span className="text-slate-700 font-medium">{acc.name}</span>
                </div>
                <span className="font-mono text-slate-900 font-bold">Rp {acc.currentBalance.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-4 border-t-2 border-indigo-100 flex justify-between font-extrabold text-indigo-600">
              <span className="uppercase text-xs tracking-wider">TOTAL AKTIVA</span>
              <span className="text-lg">Rp {totalAssets.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Liab & Equity */}
        <div className="space-y-8">
          <div className="card p-6 md:p-8 space-y-6">
            <h4 className="text-sm font-bold text-rose-600 uppercase tracking-widest border-b pb-3">KEWAJIBAN (Pasiva)</h4>
            <div className="space-y-4">
              {liabilities.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Tidak ada kewajiban.</p>
              ) : (
                liabilities.map(acc => (
                  <div key={acc.id} className="flex justify-between text-sm items-center">
                    <span className="text-slate-700 font-medium">{acc.name}</span>
                    <span className="font-mono text-slate-900 font-bold">Rp {acc.currentBalance.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="pt-4 border-t border-rose-100 flex justify-between font-bold text-rose-600">
                <span className="uppercase text-xs tracking-wider">Total Kewajiban</span>
                <span>Rp {totalLiabilities.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 md:p-8 space-y-6">
            <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest border-b pb-3">EKUITAS (Modal)</h4>
            <div className="space-y-4">
              {equity.map(acc => (
                <div key={acc.id} className="flex justify-between text-sm items-center">
                  <span className="text-slate-700 font-medium">{acc.name}</span>
                  <span className="font-mono text-slate-900 font-bold">Rp {acc.currentBalance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm items-center italic text-indigo-600">
                <span className="font-medium">Laba Tahun Berjalan</span>
                <span className="font-mono font-bold">Rp {currentEarnings.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t-2 border-emerald-100 flex justify-between font-extrabold text-emerald-600">
                <span className="uppercase text-xs tracking-wider">TOTAL PASIVA</span>
                <span className="text-lg">Rp {(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrialBalanceReport: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const totalDebit = accounts.reduce((sum, acc) => {
    // Assets & Expenses usually have Debit balance
    if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE) {
      return sum + Math.max(0, acc.currentBalance);
    }
    return sum + (acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0);
  }, 0);

  const totalCredit = accounts.reduce((sum, acc) => {
    // Liab, Equity, Revenue usually have Credit balance
    if (acc.type === AccountType.LIABILITY || acc.type === AccountType.EQUITY || acc.type === AccountType.REVENUE) {
      return sum + Math.max(0, acc.currentBalance);
    }
    return sum + (acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-2xl font-bold text-slate-900">Neraca Saldo</h3>
        <p className="text-slate-500">Saldo Akhir Seluruh Akun</p>
      </header>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Kode</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Nama Akun</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right">Debit</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right">Kredit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map(acc => {
                const isDebitNature = acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE;
                const debit = isDebitNature ? Math.max(0, acc.currentBalance) : (acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0);
                const credit = !isDebitNature ? Math.max(0, acc.currentBalance) : (acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0);

                return (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-indigo-600 font-bold">{acc.code}</td>
                    <td className="py-4 px-6 text-sm text-slate-900 font-medium">{acc.name}</td>
                    <td className="py-4 px-6 text-sm text-right font-mono text-slate-900">
                      {debit > 0 ? debit.toLocaleString() : "-"}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-mono text-slate-900">
                      {credit > 0 ? credit.toLocaleString() : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold">
              <tr>
                <td colSpan={2} className="py-4 px-6 text-sm uppercase tracking-widest">Total Neraca Saldo</td>
                <td className="py-4 px-6 text-right font-mono text-lg">Rp {totalDebit.toLocaleString()}</td>
                <td className="py-4 px-6 text-right font-mono text-lg">Rp {totalCredit.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const CashFlowReport: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  // Simple Direct Method simulation based on current balances
  const cashAccounts = accounts.filter(a => a.code.startsWith('11'));
  const operatingInflow = accounts.filter(a => a.type === AccountType.REVENUE);
  const operatingOutflow = accounts.filter(a => a.type === AccountType.EXPENSE);
  
  const totalInflow = operatingInflow.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalOutflow = operatingOutflow.reduce((sum, a) => sum + a.currentBalance, 0);
  const netOperatingCash = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-2xl font-bold text-slate-900">Laporan Arus Kas</h3>
        <p className="text-slate-500">Metode Langsung (Estimasi dari Saldo Akun)</p>
      </header>

      <div className="card overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h4 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Aktivitas Operasi</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Penerimaan dari Pelanggan</span>
                <span className="font-mono text-emerald-600 font-bold">+ Rp {totalInflow.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Pembayaran kepada Pemasok & Karyawan</span>
                <span className="font-mono text-rose-600 font-bold">- Rp {totalOutflow.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold">
                <span className="text-slate-900">Kas Bersih dari Aktivitas Operasi</span>
                <span className={cn(netOperatingCash >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  Rp {netOperatingCash.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Aktivitas Investasi & Pendanaan</h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-400 italic">Tidak ada aktivitas investasi atau pendanaan yang tercatat pada periode ini.</p>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold">
                <span className="text-slate-900">Kas Bersih dari Aktivitas Lainnya</span>
                <span className="text-slate-900">Rp 0</span>
              </div>
            </div>
          </section>

          <section className="bg-indigo-50 -mx-6 md:-mx-8 p-6 md:p-8 mt-8 border-t border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Kenaikan (Penurunan) Kas Bersih</span>
              <span className={cn("text-xl font-mono font-bold", netOperatingCash >= 0 ? "text-emerald-600" : "text-rose-600")}>
                Rp {netOperatingCash.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-indigo-200">
              <span className="text-lg font-bold text-indigo-900">SALDO KAS AKHIR PERIODE</span>
              <span className="text-2xl font-mono font-bold text-indigo-700">
                Rp {cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0).toLocaleString()}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
