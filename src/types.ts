export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export enum AccountType {
  ASSET = "ASET",
  LIABILITY = "KEWAJIBAN",
  EQUITY = "EKUITAS",
  REVENUE = "PENDAPATAN",
  EXPENSE = "BEBAN",
}

export interface Account {
  id: string;
  userId: string;
  code: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO format
  referenceCode: string;
  description: string;
  transactions: Transaction[];
  createdAt: string;
  createdBy: string;
}

export interface Transaction {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Supplier {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
}

export interface FixedAsset {
  id: string;
  name: string;
  acquisitionDate: string;
  cost: number;
  salvageValue: number;
  usefulLife: number; // in years
  depreciationMethod: "straight-line" | "double-declining";
}

export interface User {
  uid: string;
  email: string | null;
  role: "admin" | "staff";
  displayName: string | null;
}
