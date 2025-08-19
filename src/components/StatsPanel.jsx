import { useMemo } from 'react';

export default function StatsPanel({ transactions }) {
  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        averageTransaction: 0,
        dateRange: null,
        bankTypes: []
      };
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const bankTypes = new Set();
    let earliestDate = null;
    let latestDate = null;

    transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += Math.abs(transaction.amount);
      }
      
      bankTypes.add(transaction.bankType);
      
      const date = new Date(transaction.date);
      if (!earliestDate || date < earliestDate) {
        earliestDate = date;
      }
      if (!latestDate || date > latestDate) {
        latestDate = date;
      }
    });

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      averageTransaction: transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length : 0,
      dateRange: earliestDate && latestDate ? { earliest: earliestDate, latest: latestDate } : null,
      bankTypes: Array.from(bankTypes)
    };
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <div className="stats-panel">
      <h3>Özet İstatistikler</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Toplam İşlem</div>
            <div className="stat-value">{stats.totalTransactions.toLocaleString('tr-TR')}</div>
          </div>
        </div>

        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Toplam Gelir</div>
            <div className="stat-value">{formatCurrency(stats.totalIncome)}</div>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">Toplam Gider</div>
            <div className="stat-value">{formatCurrency(stats.totalExpenses)}</div>
          </div>
        </div>

        <div className={`stat-card ${stats.netAmount >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">{stats.netAmount >= 0 ? '📈' : '📉'}</div>
          <div className="stat-content">
            <div className="stat-label">Net Tutar</div>
            <div className="stat-value">{formatCurrency(stats.netAmount)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Ortalama İşlem</div>
            <div className="stat-value">{formatCurrency(stats.averageTransaction)}</div>
          </div>
        </div>

        {stats.dateRange && (
          <div className="stat-card wide">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-label">Tarih Aralığı</div>
              <div className="stat-value">
                {formatDate(stats.dateRange.earliest)} - {formatDate(stats.dateRange.latest)}
              </div>
            </div>
          </div>
        )}

        {stats.bankTypes.length > 0 && (
          <div className="stat-card wide">
            <div className="stat-icon">🏦</div>
            <div className="stat-content">
              <div className="stat-label">Bankalar</div>
              <div className="stat-value">
                {stats.bankTypes.join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}