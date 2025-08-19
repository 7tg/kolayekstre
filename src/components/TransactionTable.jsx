import { useState, useMemo } from 'react';

export default function TransactionTable({ transactions }) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('all');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterType === 'income') {
      filtered = transactions.filter(t => t.amount > 0);
    } else if (filterType === 'expense') {
      filtered = transactions.filter(t => t.amount < 0);
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [transactions, sortField, sortDirection, filterType]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

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
    <div className="transaction-table-container">
      <div className="table-controls">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tüm İşlemler</option>
          <option value="income">Gelen</option>
          <option value="expense">Giden</option>
        </select>
        <span className="transaction-count">
          {filteredAndSortedTransactions.length} işlem
        </span>
      </div>

      <div className="table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>
                Tarih {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('description')}>
                Açıklama {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('amount')}>
                Tutar {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('balance')}>
                Bakiye {sortField === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Banka</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map((transaction) => (
              <tr key={transaction.id} className={transaction.amount >= 0 ? 'income' : 'expense'}>
                <td>{formatDate(transaction.date)}</td>
                <td title={transaction.description}>{transaction.description}</td>
                <td className={transaction.amount >= 0 ? 'amount-positive' : 'amount-negative'}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td>{formatCurrency(transaction.balance)}</td>
                <td className="bank-type">{transaction.bankType}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedTransactions.length === 0 && (
          <div className="no-data">
            <p>Henüz işlem bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}