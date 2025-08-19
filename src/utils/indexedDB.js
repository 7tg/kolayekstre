const DB_NAME = 'BankStatementsDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
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

  async addTransactions(transactions, bankType) {
    if (!this.db) await this.init();

    const existingIds = await this.getAllTransactionIds();
    const newTransactions = transactions.filter(t => !existingIds.has(t.id));

    if (newTransactions.length === 0) {
      return { added: 0, duplicates: transactions.length };
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
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

  async getAllTransactionIds() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(new Set(request.result));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllTransactions(filters = {}) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;
        
        if (filters.bankType) {
          results = results.filter(t => t.bankType === filters.bankType);
        }
        
        if (filters.dateFrom) {
          results = results.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
          results = results.filter(t => new Date(t.date) <= new Date(filters.dateTo));
        }
        
        if (filters.minAmount !== undefined) {
          results = results.filter(t => t.amount >= filters.minAmount);
        }
        
        if (filters.maxAmount !== undefined) {
          results = results.filter(t => t.amount <= filters.maxAmount);
        }
        
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getTransactionsByDateRange(startDate, endDate) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('date');
      
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStats() {
    const transactions = await this.getAllTransactions();
    
    const stats = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      bankTypes: new Set(),
      dateRange: {
        earliest: null,
        latest: null
      }
    };

    transactions.forEach(t => {
      if (t.amount > 0) {
        stats.totalIncome += t.amount;
      } else {
        stats.totalExpenses += Math.abs(t.amount);
      }
      
      stats.bankTypes.add(t.bankType);
      
      const date = new Date(t.date);
      if (!stats.dateRange.earliest || date < stats.dateRange.earliest) {
        stats.dateRange.earliest = date;
      }
      if (!stats.dateRange.latest || date > stats.dateRange.latest) {
        stats.dateRange.latest = date;
      }
    });

    stats.bankTypes = Array.from(stats.bankTypes);
    
    return stats;
  }
}

export default IndexedDBManager;