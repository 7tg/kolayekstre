import { Transaction } from '../types';

const DB_NAME = 'BankStatementsDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

interface AddTransactionResult {
  added: number;
  duplicates: number;
  errors?: number;
}

interface DBFilters {
  bankType?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

interface DBStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  bankTypes: string[];
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  constructor() {}

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('bankType', 'bankType', { unique: false });
          store.createIndex('amount', 'amount', { unique: false });
          store.createIndex('description', 'description', { unique: false });
        }
      };
    });
  }

  async addTransactions(transactions: Transaction[], bankType: string): Promise<AddTransactionResult> {
    if (!this.db) await this.init();

    const existingIds = await this.getAllTransactionIds();
    const newTransactions = transactions.filter(t => !existingIds.has(t.id));

    if (newTransactions.length === 0) {
      return { added: 0, duplicates: transactions.length };
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      let addedCount = 0;
      let errorCount = 0;

      newTransactions.forEach(transactionData => {
        const enhancedTransaction = {
          ...transactionData,
          bankType,
          uploadedAt: new Date(),
        };

        const request = store.add(enhancedTransaction);
        
        request.onsuccess = () => {
          addedCount++;
          if (addedCount + errorCount === newTransactions.length) {
            resolve({
              added: addedCount,
              duplicates: transactions.length - newTransactions.length,
              errors: errorCount
            });
          }
        };

        request.onerror = () => {
          errorCount++;
          if (addedCount + errorCount === newTransactions.length) {
            resolve({
              added: addedCount,
              duplicates: transactions.length - newTransactions.length,
              errors: errorCount
            });
          }
        };
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAllTransactionIds(): Promise<Set<string>> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(new Set(request.result as string[]));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllTransactions(filters: DBFilters = {}): Promise<Transaction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results: Transaction[] = request.result;
        
        if (filters.bankType) {
          results = results.filter(t => t.bankType === filters.bankType);
        }
        
        if (filters.dateFrom) {
          results = results.filter(t => new Date(t.date!) >= new Date(filters.dateFrom!));
        }
        
        if (filters.dateTo) {
          results = results.filter(t => new Date(t.date!) <= new Date(filters.dateTo!));
        }
        
        if (filters.minAmount !== undefined) {
          results = results.filter(t => t.amount >= filters.minAmount!);
        }
        
        if (filters.maxAmount !== undefined) {
          results = results.filter(t => t.amount <= filters.maxAmount!);
        }
        
        results.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
        
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('date');
      
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<DBStats> {
    const transactions = await this.getAllTransactions();
    
    const stats: DBStats = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      bankTypes: [],
      dateRange: {
        earliest: null,
        latest: null
      }
    };

    const bankTypesSet = new Set<string>();

    transactions.forEach(t => {
      if (t.amount > 0) {
        stats.totalIncome += t.amount;
      } else {
        stats.totalExpenses += Math.abs(t.amount);
      }
      
      if (t.bankType) {
        bankTypesSet.add(t.bankType);
      }
      
      if (t.date) {
        const date = new Date(t.date);
        if (!stats.dateRange.earliest || date < stats.dateRange.earliest) {
          stats.dateRange.earliest = date;
        }
        if (!stats.dateRange.latest || date > stats.dateRange.latest) {
          stats.dateRange.latest = date;
        }
      }
    });

    stats.bankTypes = Array.from(bankTypesSet);
    
    return stats;
  }
}

export default IndexedDBManager;