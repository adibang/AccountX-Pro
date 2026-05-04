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
  // USERS
  async getUserProfile(userId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  async createUserProfile(userId: string, data: any) {
    try {
      await setDoc(doc(db, 'users', userId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  // ACCOUNTS
  async getAccounts(): Promise<Account[]> {
    const path = 'accounts';
    try {
      const q = query(collection(db, path), orderBy('code', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Account));
    } catch (error) {
      // If accounts don't exist yet, we might get an error if the collection hasn't been created
      // Return empty array to allow seeding
      return [];
    }
  },

  async seedInitialAccounts(accounts: Account[]) {
    try {
      for (const acc of accounts) {
        await setDoc(doc(db, 'accounts', acc.id), acc);
      }
      console.log("Successfully seeded initial accounts.");
    } catch (error) {
       console.error("Error seeding accounts:", error);
       handleFirestoreError(error, OperationType.WRITE, 'accounts');
    }
  },

  async addAccount(account: Account) {
    try {
      await setDoc(doc(db, 'accounts', account.id), account);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'accounts');
    }
  },

  // JOURNAL ENTRIES
  async saveJournalEntry(entry: Omit<JournalEntry, 'id'>, transactions: Transaction[]) {
    const path = 'journal_entries';
    try {
      await runTransaction(db, async (txn) => {
        const entryRef = doc(collection(db, path));
        
        // 1. Create Entry doc with transactions as a field
        txn.set(entryRef, {
          ...entry,
          createdAt: Timestamp.now(),
          createdBy: auth.currentUser?.uid || 'system'
        });

        // 2. Update Account Balances
        for (const t of transactions) {
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
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    const path = 'journal_entries';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // CONTACTS (Customers & Suppliers)
  async getContacts(type: 'customers' | 'suppliers') {
    try {
      const snapshot = await getDocs(collection(db, type));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, type);
      return [];
    }
  },

  async addContact(type: 'customers' | 'suppliers', data: any) {
    try {
      await addDoc(collection(db, type), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, type);
    }
  }
};
