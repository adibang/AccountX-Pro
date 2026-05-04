import React, { useState } from "react";
import { Settings as SettingsIcon, Building, Mail, Phone, Globe, Save, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

export const Settings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "PT. Accounting Digital Indonesia",
    email: "finance@accounting-digital.id",
    phone: "+62 812 3456 7890",
    address: "Sudirman Central Business District, Jakarta",
    website: "www.accounting-digital.id",
    currency: "IDR",
    fiscalYearStart: "Januari"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Pengaturan Perusahaan</h2>
        <p className="text-sm text-slate-500">Sesuaikan identitas dan parameter keuangan bisnis Anda.</p>
      </header>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">Perubahan berhasil disimpan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" /> Profil Bisnis
            </h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Perusahaan</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Finance</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">No. Telepon Kantor</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alamat Lengkap</label>
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field w-full resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          <div className="card p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-indigo-600" /> Parameter Keuangan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mata Uang Dasar</label>
                <select className="input-field w-full">
                  <option value="IDR">Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Awal Tahun Fiskal</label>
                <select className="input-field w-full">
                  <option>Januari</option>
                  <option>Juli</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-indigo-50 border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">Logo Perusahaan</h4>
            <div className="w-32 h-32 bg-white rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-300 mb-4 cursor-pointer hover:border-indigo-400 transition-colors">
              <Building className="w-10 h-10 mb-2" />
              <span className="text-[10px] font-bold uppercase">Upload Logo</span>
            </div>
            <p className="text-xs text-slate-500">Disarankan ukuran 512x512px. Format PNG atau JPG.</p>
          </div>

          <div className="card p-6">
            <h4 className="font-bold text-slate-900 mb-4">Informasi Sistem</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Versi Aplikasi</span>
                <span className="font-mono text-slate-900">v2.4.0-pro</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status Server</span>
                <span className="text-emerald-500 font-bold uppercase">Online</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Penyimpanan Terpakai</span>
                <span className="text-slate-900">12.4 MB / 1 GB</span>
              </div>
            </div>
            <button className="btn-secondary w-full mt-6 text-xs bg-slate-100">Cek Pembaruan</button>
          </div>
        </div>
      </div>
    </div>
  );
};
