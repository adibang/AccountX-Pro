import { Account, AccountType } from "./types";

export const INITIAL_COA: any[] = [
  // ASSETS (1000)
  { id: "1101", code: "1101", name: "Kas Utama", type: AccountType.ASSET, initialBalance: 0, currentBalance: 0 },
  { id: "1102", code: "1102", name: "Bank BCA", type: AccountType.ASSET, initialBalance: 0, currentBalance: 0 },
  { id: "1201", code: "1201", name: "Piutang Usaha", type: AccountType.ASSET, initialBalance: 0, currentBalance: 0 },
  { id: "1301", code: "1301", name: "Persediaan Barang Dagang", type: AccountType.ASSET, initialBalance: 0, currentBalance: 0 },
  { id: "1501", code: "1501", name: "Aset Tetap - Kendaraan", type: AccountType.ASSET, initialBalance: 0, currentBalance: 0 },
  { id: "1502", code: "1502", name: "Akumulasi Penyusutan Kendaraan", type: AccountType.ASSET, initialBalance: 0, currentBalance: 0 },

  // LIABILITIES (2000)
  { id: "2101", code: "2101", name: "Hutang Usaha", type: AccountType.LIABILITY, initialBalance: 0, currentBalance: 0 },
  { id: "2102", code: "2102", name: "Hutang Bank Short-term", type: AccountType.LIABILITY, initialBalance: 0, currentBalance: 0 },

  // EQUITY (3000)
  { id: "3101", code: "3101", name: "Modal Pemilik", type: AccountType.EQUITY, initialBalance: 0, currentBalance: 0 },
  { id: "3201", code: "3201", name: "Laba Ditahan", type: AccountType.EQUITY, initialBalance: 0, currentBalance: 0 },

  // REVENUE (4000)
  { id: "4101", code: "4101", name: "Pendapatan Penjualan", type: AccountType.REVENUE, initialBalance: 0, currentBalance: 0 },
  { id: "4201", code: "4201", name: "Pendapatan Lain-lain", type: AccountType.REVENUE, initialBalance: 0, currentBalance: 0 },

  // EXPENSES (5000)
  { id: "5101", code: "5101", name: "Beban Gaji", type: AccountType.EXPENSE, initialBalance: 0, currentBalance: 0 },
  { id: "5201", code: "5201", name: "Beban Sewa", type: AccountType.EXPENSE, initialBalance: 0, currentBalance: 0 },
  { id: "5301", code: "5301", name: "Beban Listrik, Air & Telepon", type: AccountType.EXPENSE, initialBalance: 0, currentBalance: 0 },
  { id: "5401", code: "5401", name: "Beban Penyusutan", type: AccountType.EXPENSE, initialBalance: 0, currentBalance: 0 },
  { id: "5501", code: "5501", name: "Beban Operasional Lainnya", type: AccountType.EXPENSE, initialBalance: 0, currentBalance: 0 },
];
