import React from "react";
import { FileText, Download, Printer, Calculator } from "lucide-react";

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Laporan Keuangan</h2>
        <p className="text-slate-500">Hasil otomatis dari seluruh transaksi yang tercatat.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Laporan Laba Rugi" 
          description="Ringkasan pendapatan dan beban untuk periode tertentu."
          icon={Calculator}
        />
        <ReportCard 
          title="Neraca (Balance Sheet)" 
          description="Posisi aset, kewajiban, dan ekuitas perusahaan."
          icon={FileText}
        />
        <ReportCard 
          title="Laporan Arus Kas" 
          description="Rangkuman uang masuk dan keluar (Metode Langsung)."
          icon={Download}
        />
        <ReportCard 
          title="Neraca Saldo" 
          description="Daftar seluruh saldo akun sebelum penyesuaian."
          icon={Printer}
        />
      </div>

      <div className="card p-12 text-center text-slate-400">
        <Calculator className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>Pilih salah satu laporan di atas untuk melihat detail data.</p>
      </div>
    </div>
  );
};

const ReportCard: React.FC<{ title: string; description: string; icon: any }> = ({ title, description, icon: Icon }) => (
  <div className="card p-6 hover:border-indigo-200 transition-all group cursor-pointer">
    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
      <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
    </div>
    <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);
