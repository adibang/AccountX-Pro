import React, { useState, useEffect } from "react";
import { Users, UserPlus, Search, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { cn } from "../lib/utils";

type ContactType = "customers" | "suppliers";

export const Contacts: React.FC = () => {
  const [activeType, setActiveType] = useState<ContactType>("customers");
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchContacts();
  }, [activeType]);

  const fetchContacts = async () => {
    setLoading(true);
    const data = await firebaseService.getContacts(activeType);
    setContacts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await firebaseService.addContact(activeType, { name, email, phone, address });
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setShowForm(false);
    fetchContacts();
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Manajemen Kontak</h2>
          <p className="text-sm text-slate-500">Kelola daftar pelanggan dan pemasok Anda.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Tambah {activeType === "customers" ? "Pelanggan" : "Pemasok"}
        </button>
      </header>

      <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveType("customers")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeType === "customers" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Pelanggan
        </button>
        <button 
          onClick={() => setActiveType("suppliers")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeType === "suppliers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Pemasok
        </button>
      </div>

      {showForm && (
        <div className="card p-6 border-indigo-200 bg-indigo-50/30 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Input Data Baru</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
              <input 
                required
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
                placeholder="Contoh: PT. Maju Jaya"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="email@perusahaan.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. Telepon</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full"
                placeholder="0812..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="input-field w-full"
                placeholder="Jl. Merdeka No. 123"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Batal
              </button>
              <button type="submit" className="btn-primary px-8">
                Simpan Kontak
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama atau email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full pl-12 py-3"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>Memuat daftar kontak...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.length === 0 ? (
            <div className="col-span-full card p-12 text-center text-slate-400 italic">
              Tidak ada data ditemukan.
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="card p-6 flex flex-col hover:border-indigo-200 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{contact.name}</h4>
                    <span className="text-xs font-bold text-slate-400 uppercase">{activeType === "customers" ? "Customer" : "Supplier"}</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3 h-3" /> {contact.email}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3 h-3" /> {contact.phone}
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> 
                      <span className="line-clamp-1 text-xs">{contact.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
