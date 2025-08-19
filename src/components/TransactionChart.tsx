import { useMemo } from 'react';
import { Transaction } from '../types';

interface TransactionChartProps {
  transactions: Transaction[];
}

interface MonthlyData {
  income: number;
  expense: number;
  net: number;
}

export default function TransactionChart({ transactions }: TransactionChartProps) {
  const chartData = useMemo((): [string, MonthlyData][] => {
    const monthlyData: Record<string, MonthlyData> = {};
    
    transactions.forEach(transaction => {
      if (transaction.date) {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0, net: 0 };
        }
        
        if (transaction.amount > 0) {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += Math.abs(transaction.amount);
        }
        
        monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expense;
      }
    });

    const sortedEntries = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
    return sortedEntries;
  }, [transactions]);

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(([_, data]) => 
      Math.max(data.income, data.expense)
    ), 1000);
  }, [chartData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="transaction-chart">
      <h3>Aylık Gelir-Gider Özeti</h3>
      
      {chartData.length === 0 ? (
        <div className="no-chart-data">
          <p>Grafik için yeterli veri bulunmuyor.</p>
        </div>
      ) : (
        <div className="chart-container">
          <div className="chart-bars">
            {chartData.map(([monthKey, data]) => (
              <div key={monthKey} className="bar-group">
                <div className="month-label">{formatMonth(monthKey)}</div>
                
                <div className="bars">
                  <div 
                    className="bar income-bar" 
                    style={{ height: `${(data.income / maxValue) * 200}px` }}
                    title={`Gelir: ${formatCurrency(data.income)}`}
                  >
                    <span className="bar-value">{formatCurrency(data.income)}</span>
                  </div>
                  
                  <div 
                    className="bar expense-bar" 
                    style={{ height: `${(data.expense / maxValue) * 200}px` }}
                    title={`Gider: ${formatCurrency(data.expense)}`}
                  >
                    <span className="bar-value">{formatCurrency(data.expense)}</span>
                  </div>
                </div>
                
                <div className={`net-amount ${data.net >= 0 ? 'positive' : 'negative'}`}>
                  Net: {formatCurrency(data.net)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color income"></div>
              <span>Gelir</span>
            </div>
            <div className="legend-item">
              <div className="legend-color expense"></div>
              <span>Gider</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}