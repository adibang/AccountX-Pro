import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, expense: 2400 },
  { name: "Feb", revenue: 3000, expense: 1398 },
  { name: "Mar", revenue: 2000, expense: 9800 },
  { name: "Apr", revenue: 2780, expense: 3908 },
  { name: "May", revenue: 1890, expense: 4800 },
  { name: "Jun", revenue: 2390, expense: 3800 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Finansial</h2>
        <p className="text-slate-500">Ringkasan performa keuangan bisnis Anda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendapatan" 
          value="Rp 45.231.000" 
          change="+12.5%" 
          isPositive={true} 
          icon={TrendingUp} 
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard 
          title="Total Beban" 
          value="Rp 12.450.000" 
          change="+3.4%" 
          isPositive={false} 
          icon={TrendingDown} 
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <StatCard 
          title="Laba Bersih" 
          value="Rp 32.781.000" 
          change="+18.2%" 
          isPositive={true} 
          icon={DollarSign} 
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard 
          title="Saldo Kas" 
          value="Rp 128.450.000" 
          change="+2.1%" 
          isPositive={true} 
          icon={Wallet} 
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Tren Pendapatan vs Beban</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Arus Kas Masuk</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#e0e7ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, color, bgColor }) => (
  <div className="card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-lg", bgColor)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div className={cn(
        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
    </div>
  </div>
);

function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(" ");
}
