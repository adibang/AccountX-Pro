// js/accounting-service.js
import { dbCloud } from './firebase-config.js';
import { 
    collection, doc, getDocs, getDoc, setDoc, addDoc, 
    query, where, orderBy, serverTimestamp, runTransaction 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const ACCOUNTS_COL = 'accounts';
const LEDGER_COL = 'ledger';

const DEFAULT_COA = [
    { code: '1-1001', name: 'Kas Utama', category: 'Assets', type: 'debit' },
    { code: '1-1002', name: 'Bank', category: 'Assets', type: 'debit' },
    { code: '1-1003', name: 'Piutang Usaha', category: 'Assets', type: 'debit' },
    { code: '1-1201', name: 'Persediaan Barang Dagang', category: 'Assets', type: 'debit' },
    { code: '2-1001', name: 'Hutang Usaha', category: 'Liabilities', type: 'credit' },
    { code: '3-1001', name: 'Modal Pemilik', category: 'Equity', type: 'credit' },
    { code: '3-2001', name: 'Laba Ditahan', category: 'Equity', type: 'credit' },
    { code: '4-1001', name: 'Pendapatan Penjualan', category: 'Revenue', type: 'credit' },
    { code: '5-1101', name: 'Harga Pokok Penjualan (HPP)', category: 'Expenses', type: 'debit' },
    { code: '5-1201', name: 'Beban Gaji', category: 'Expenses', type: 'debit' },
    { code: '5-1202', name: 'Beban Sewa', category: 'Expenses', type: 'debit' },
    { code: '5-1203', name: 'Beban Listrik & Air', category: 'Expenses', type: 'debit' },
    { code: '5-1299', name: 'Beban Lain-lain', category: 'Expenses', type: 'debit' }
];

export async function initializeCOA() {
    const snap = await getDocs(collection(dbCloud, ACCOUNTS_COL));
    if (snap.empty) {
        console.log('Initializing Chart of Accounts...');
        for (const account of DEFAULT_COA) {
            await setDoc(doc(dbCloud, ACCOUNTS_COL, account.code), {
                ...account,
                balance: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    }
}

/**
 * Post a journal entry to the ledger.
 * @param {Object} entry { date, description, referenceId, referenceType, items: [{accountCode, debit, credit}] }
 */
export async function postJournalEntry(entry) {
    try {
        await runTransaction(dbCloud, async (transaction) => {
            const ledgerRef = doc(collection(dbCloud, LEDGER_COL));
            const timestamp = entry.date || serverTimestamp();
            
            // 1. Save ledger document
            transaction.set(ledgerRef, {
                ...entry,
                date: timestamp,
                createdAt: serverTimestamp()
            });

            // 2. Update account balances
            for (const item of entry.items) {
                const accountRef = doc(dbCloud, ACCOUNTS_COL, item.accountCode);
                const accountSnap = await transaction.get(accountRef);
                
                if (!accountSnap.exists()) {
                    throw new Error(`Account code ${item.accountCode} not found`);
                }

                const accountData = accountSnap.data();
                let balanceChange = 0;

                if (accountData.type === 'debit') {
                    balanceChange = (item.debit || 0) - (item.credit || 0);
                } else {
                    balanceChange = (item.credit || 0) - (item.debit || 0);
                }

                transaction.update(accountRef, {
                    balance: (accountData.balance || 0) + balanceChange,
                    updatedAt: serverTimestamp()
                });
            }
        });
        return true;
    } catch (error) {
        console.error('Error posting journal entry:', error);
        throw error;
    }
}

// Helper to post a Sales transaction
export async function postSalesTransaction(salesId, total, cogs, paymentMethods, outstanding) {
    const items = [];
    
    // Revenue (Credit)
    items.push({ accountCode: '4-1001', debit: 0, credit: total });

    // Payment collected (Debit)
    paymentMethods.forEach(method => {
        const code = method.method === 'cash' ? '1-1001' : '1-1002';
        items.push({ accountCode: code, debit: method.amount, credit: 0 });
    });

    // Accounts Receivable (Debit)
    if (outstanding > 0) {
        items.push({ accountCode: '1-1003', debit: outstanding, credit: 0 });
    }

    // COGS and Inventory (Debit COGS, Credit Inventory)
    if (cogs > 0) {
        items.push({ accountCode: '5-1101', debit: cogs, credit: 0 });
        items.push({ accountCode: '1-1201', debit: 0, credit: cogs });
    }

    await postJournalEntry({
        description: `Penjualan #${salesId.slice(-6)}`,
        referenceId: salesId,
        referenceType: 'sales',
        items
    });
}

// Helper to post a Purchase transaction
export async function postPurchaseTransaction(purchaseId, total, paymentAmount, outstanding) {
    const items = [];

    // Inventory (Debit)
    items.push({ accountCode: '1-1201', debit: total, credit: 0 });

    // Cash/Bank (Credit)
    if (paymentAmount > 0) {
        // Assume cash for now or map based on settings
        items.push({ accountCode: '1-1001', debit: 0, credit: paymentAmount });
    }

    // Accounts Payable (Credit)
    if (outstanding > 0) {
        items.push({ accountCode: '2-1001', debit: 0, credit: outstanding });
    }

    await postJournalEntry({
        description: `Pembelian #${purchaseId.slice(-6)}`,
        referenceId: purchaseId,
        referenceType: 'purchase',
        items
    });
}
