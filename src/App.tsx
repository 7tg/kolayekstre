import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import TransactionChart from './components/TransactionChart';
import StatsPanel from './components/StatsPanel';
import IndexedDBManager from './utils/indexedDB';
import { Transaction, ParseResult } from './types';
import './App.css';

type TabType = 'stats' | 'chart' | 'table';

interface ParsedResult extends ParseResult {
  filename: string;
  fileSize: number;
  parsedAt: Date;
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbManager] = useState<IndexedDBManager>(() => new IndexedDBManager());
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const allTransactions = await dbManager.getAllTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleTransactionsLoaded = async (parsedData: ParsedResult) => {
    try {
      const result = await dbManager.addTransactions(parsedData.transactions, parsedData.bankType);
      
      if (result.added > 0) {
        await loadTransactions();
        alert(`${result.added} yeni işlem eklendi. ${result.duplicates} işlem zaten mevcut olduğu için atlandı.`);
      } else {
        alert('Tüm işlemler zaten mevcut. Yeni işlem eklenmedi.');
      }
    } catch (error) {
      console.error('Error saving transactions:', error);
      alert('İşlemler kaydedilirken bir hata oluştu.');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      try {
        await dbManager.clearAllData();
        setTransactions([]);
        alert('Tüm veriler silindi.');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Veriler silinirken bir hata oluştu.');
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏦 Kolay Ekstre</h1>
        <p>Banka ekstrelerinizi kolayca yükleyin ve analiz edin</p>
      </header>

      <main className="main-content">
        <FileUpload 
          onTransactionsLoaded={handleTransactionsLoaded}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {transactions.length > 0 && (
          <>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                📊 İstatistikler
              </button>
              <button 
                className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
                onClick={() => setActiveTab('chart')}
              >
                📈 Grafik
              </button>
              <button 
                className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                onClick={() => setActiveTab('table')}
              >
                📋 Tablo
              </button>
              <button 
                className="tab danger"
                onClick={handleClearData}
              >
                🗑️ Temizle
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'stats' && <StatsPanel transactions={transactions} />}
              {activeTab === 'chart' && <TransactionChart transactions={transactions} />}
              {activeTab === 'table' && <TransactionTable transactions={transactions} />}
            </div>
          </>
        )}

        {transactions.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>Henüz veri yok</h3>
            <p>Başlamak için bir banka ekstresi yükleyin</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;