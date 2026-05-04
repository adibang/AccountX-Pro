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
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    
    const path = 'accounts';
    try {
      const q = query(
        collection(db, path), 
        where('userId', '==', userId),
        orderBy('code', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Account));
    } catch (error) {
      return [];
    }
  },

  async seedInitialAccounts(accounts: Account[]) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      for (const acc of accounts) {
        const accountWithUser = { ...acc, userId };
        await setDoc(doc(db, 'accounts', `${userId}_${acc.id}`), accountWithUser);
      }
      console.log("Successfully seeded initial accounts for user:", userId);
    } catch (error) {
       console.error("Error seeding accounts:", error);
       handleFirestoreError(error, OperationType.WRITE, 'accounts');
    }
  },

  async addAccount(account: Account) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User must be logged in to add an account");

    try {
      const accountWithUser = { ...account, userId };
      await setDoc(doc(db, 'accounts', `${userId}_${account.id}`), accountWithUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'accounts');
    }
  },

  // JOURNAL ENTRIES
  async saveJournalEntry(entry: Omit<JournalEntry, 'id'>, transactions: Transaction[]) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User must be logged in to save entry");

    const path = 'journal_entries';
    try {
      await runTransaction(db, async (txn) => {
        const entryRef = doc(collection(db, path));
        
        // 1. Create Entry doc with transactions as a field
        txn.set(entryRef, {
          ...entry,
          userId,
          createdAt: Timestamp.now(),
          createdBy: userId
        });

        // 2. Update Account Balances
        for (const t of transactions) {
          const accRef = doc(db, 'accounts', `${userId}_${t.accountId}`);
          const accSnap = await txn.get(accRef);
          if (accSnap.exists()) {
            const currentBalance = accSnap.data().currentBalance || 0;
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
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const q = query(
      collection(db, 'journal_entries'), 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      callback(entries);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'journal_entries');
    });
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const path = 'journal_entries';
    try {
      const q = query(
        collection(db, path), 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // CONTACTS (Customers & Suppliers)
  async getContacts(type: 'customers' | 'suppliers') {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(collection(db, type), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, type);
      return [];
    }
  },

  async addContact(type: 'customers' | 'suppliers', data: any) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User must be logged in");

    try {
      await addDoc(collection(db, type), { ...data, userId });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, type);
    }
  },

  // INVENTORY
  async getInventory(): Promise<InventoryItem[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(collection(db, 'inventory'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
      return [];
    }
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id'>) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User must be logged in");

    try {
      await addDoc(collection(db, 'inventory'), { ...item, userId });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inventory');
    }
  },

  async updateInventoryQuantity(itemId: string, newQuantity: number) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User must be logged in");

    try {
      const itemRef = doc(db, 'inventory', itemId);
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inventory');
    }
  },

  // ACTIVITY LOG
  async logActivity(action: string, detail: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      await addDoc(collection(db, 'activity_logs'), {
        userId,
        action,
        detail,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  },

  async getActivityLogs(): Promise<any[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(
        collection(db, 'activity_logs'), 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      return [];
    }
  }
};
