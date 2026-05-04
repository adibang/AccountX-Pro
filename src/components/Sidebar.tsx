import React from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Receipt, 
  Users, 
  Package, 
  FileBox, 
  Settings, 
  ArrowLeftRight,
  TrendingUp,
  CreditCard,
  LogOut
} from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "journal", label: "Jurnal Umum", icon: BookOpen },
  { id: "ledger", label: "Buku Besar", icon: Receipt },
  { id: "reports", label: "Laporan", icon: TrendingUp },
  { id: "ar-ap", label: "Piutang & Hutang", icon: CreditCard },
  { id: "inventory", label: "Inventaris", icon: Package },
  { id: "assets", label: "Aset Tetap", icon: FileBox },
  { id: "masterdata", label: "Master Data", icon: Users },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            A
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">AccounX Pro</h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-white"
              )} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-all text-slate-400"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
