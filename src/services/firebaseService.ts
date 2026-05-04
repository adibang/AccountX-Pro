import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc,
  getDocFromServer,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Account, JournalEntry, Transaction, OperationType } from '../types';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Firestore Error [${operationType}] on path [${path}]:`, errorMessage);
  throw new Error(`Firestore ${operationType} failed: ${errorMessage}`);
}

// CRITICAL: Test Connection
export async function testConnection() {
  try {
    const testDoc = doc(db, 'system_info', 'connection_test');
    await getDocFromServer(testDoc);
    console.log("Firebase connection established.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

export const firebaseService = {
  // ACCOUNTS
  async getAccounts(): Promise<Account[]> {
    const path = 'accounts';
    try {
      const q = query(collection(db, path), orderBy('code', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async seedInitialAccounts(accounts: Account[]) {
    try {
      for (const acc of accounts) {
        await setDoc(doc(db, 'accounts', acc.id), acc);
      }
    } catch (error) {
       console.error("Error seeding accounts:", error);
    }
  },

  // JOURNAL ENTRIES
  async saveJournalEntry(entry: Omit<JournalEntry, 'id'>, transactions: Transaction[]) {
    const path = 'journal_entries';
    try {
      await runTransaction(db, async (txn) => {
        const entryRef = doc(collection(db, path));
        
        // 1. Create Entry doc
        txn.set(entryRef, {
          ...entry,
          createdAt: Timestamp.now(),
          createdBy: auth.currentUser?.uid || 'system'
        });

        // 2. Add sub-collection transactions
        for (const t of transactions) {
          const tRef = doc(collection(entryRef, 'transactions'));
          txn.set(tRef, t);

          // 3. Update Account Balances
          const accRef = doc(db, 'accounts', t.accountId);
          const accSnap = await txn.get(accRef);
          if (accSnap.exists()) {
            const currentBalance = accSnap.data().currentBalance || 0;
            // Balance logic: Debit increases Assets/Expenses, Credit increases Liabilities/Equity/Revenue
            // Simplification: Standard summation for this demo
            const diff = t.debit - t.credit;
            txn.update(accRef, { currentBalance: currentBalance + diff });
          }
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  listenEntries(callback: (entries: JournalEntry[]) => void) {
    const q = query(collection(db, 'journal_entries'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      callback(entries);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'journal_entries');
    });
  }
};
