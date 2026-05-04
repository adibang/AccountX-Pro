import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  TrendingDown,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2
} from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { InventoryItem } from "../types";
import { cn } from "../lib/utils";

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    unit: "Pcs",
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const data = await firebaseService.getInventory();
    setItems(data);
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await firebaseService.addInventoryItem(newItem);
    setShowAddModal(false);
    fetchInventory();
    setNewItem({ sku: "", name: "", unit: "Pcs", costPrice: 0, sellingPrice: 0, quantity: 0 });
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantity < 10);
  const totalStockValue = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Memuat inventaris...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen Inventaris</h2>
          <p className="text-sm text-slate-500">Pantau stok barang dan nilai persediaan Anda.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary py-2.5 px-6 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Tambah Barang
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-indigo-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{items.length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Jenis Barang</div>
        </div>

        <div className="card p-6 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">Rp {totalStockValue.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nilai Persediaan (HPP)</div>
        </div>

        <div className="card p-6 border-l-4 border-rose-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            {lowStockItems.length > 0 && (
              <span className="px-2 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">
                {lowStockItems.length} PERLU STOK
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900">{lowStockItems.length} Baris</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stok Menipis (&lt; 10)</div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari SKU atau nama barang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">SKU / Nama</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Satuan</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Harga Beli</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Harga Jual</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Stok</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data barang.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-mono text-[10px] text-indigo-600 font-bold">{item.sku}</div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{item.unit}</td>
                    <td className="py-4 px-6 text-sm text-right font-mono text-slate-600">
                      {item.costPrice.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-mono text-emerald-600 font-bold">
                      {item.sellingPrice.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        item.quantity < 10 
                          ? "bg-rose-100 text-rose-600" 
                          : "bg-emerald-100 text-emerald-600"
                      )}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-mono text-slate-900 font-bold">
                      {(item.quantity * item.costPrice).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Tambah Barang Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45 w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">SKU / Kode</label>
                  <input 
                    type="text" 
                    required 
                    value={newItem.sku}
                    onChange={e => setNewItem({...newItem, sku: e.target.value})}
                    placeholder="Contoh: BRG-001"
                    className="input-field" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Satuan</label>
                  <select 
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    className="input-field"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Unit">Unit</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Nama Barang</label>
                <input 
                  type="text" 
                  required 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Masukkan nama barang lengkap"
                  className="input-field" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Harga Beli</label>
                  <input 
                    type="number" 
                    required 
                    value={newItem.costPrice}
                    onChange={e => setNewItem({...newItem, costPrice: Number(e.target.value)})}
                    className="input-field" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Harga Jual</label>
                  <input 
                    type="number" 
                    required 
                    value={newItem.sellingPrice}
                    onChange={e => setNewItem({...newItem, sellingPrice: Number(e.target.value)})}
                    className="input-field" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Stok Awal</label>
                <input 
                  type="number" 
                  required 
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  className="input-field" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
