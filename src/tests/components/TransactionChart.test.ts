import { describe, it, expect } from 'vitest';
import { Transaction } from '../../types';

// Mock data for testing chart functionality
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2025-01-15'),
    description: 'Income transaction',
    amount: 1000,
    balance: 1000,
    type: 'income',
    rawData: [],
    bankType: 'test'
  },
  {
    id: '2',
    date: new Date('2025-01-20'),
    description: 'Expense transaction',
    amount: -500,
    balance: 500,
    type: 'expense',
    rawData: [],
    bankType: 'test'
  },
  {
    id: '3',
    date: new Date('2025-02-10'),
    description: 'Another income',
    amount: 2000,
    balance: 2500,
    type: 'income',
    rawData: [],
    bankType: 'test'
  },
  {
    id: '4',
    date: new Date('2025-02-15'),
    description: 'Another expense',
    amount: -800,
    balance: 1700,
    type: 'expense',
    rawData: [],
    bankType: 'test'
  }
];

// Helper function to process chart data (extracted from component logic)
function processChartData(transactions: Transaction[]) {
  const monthlyData: Record<string, { income: number; expense: number; net: number }> = {};
  
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
  
  return {
    months: sortedEntries.map(([monthKey]) => monthKey),
    income: sortedEntries.map(([_, data]) => data.income),
    expense: sortedEntries.map(([_, data]) => data.expense),
    net: sortedEntries.map(([_, data]) => data.net),
  };
}

describe('TransactionChart Data Processing', () => {
  it('should correctly process monthly chart data', () => {
    const chartData = processChartData(mockTransactions);
    
    expect(chartData.months).toEqual(['2025-01', '2025-02']);
    expect(chartData.income).toEqual([1000, 2000]);
    expect(chartData.expense).toEqual([500, 800]);
    expect(chartData.net).toEqual([500, 1200]);
  });

  it('should handle empty transactions', () => {
    const chartData = processChartData([]);
    
    expect(chartData.months).toEqual([]);
    expect(chartData.income).toEqual([]);
    expect(chartData.expense).toEqual([]);
    expect(chartData.net).toEqual([]);
  });

  it('should handle transactions with null dates', () => {
    const transactionsWithNullDates = [
      ...mockTransactions,
      {
        id: '5',
        date: null,
        description: 'Transaction with null date',
        amount: 1000,
        balance: 1000,
        type: 'income' as const,
        rawData: [],
        bankType: 'test'
      }
    ];
    
    const chartData = processChartData(transactionsWithNullDates);
    
    // Should still process the valid transactions correctly
    expect(chartData.months).toEqual(['2025-01', '2025-02']);
    expect(chartData.income).toEqual([1000, 2000]);
  });

  it('should correctly sort months chronologically', () => {
    const unsortedTransactions = [
      {
        id: '1',
        date: new Date('2025-03-15'),
        description: 'March transaction',
        amount: 1000,
        balance: 1000,
        type: 'income' as const,
        rawData: [],
        bankType: 'test'
      },
      {
        id: '2',
        date: new Date('2025-01-15'),
        description: 'January transaction',
        amount: 500,
        balance: 500,
        type: 'income' as const,
        rawData: [],
        bankType: 'test'
      },
      {
        id: '3',
        date: new Date('2025-02-15'),
        description: 'February transaction',
        amount: 800,
        balance: 800,
        type: 'income' as const,
        rawData: [],
        bankType: 'test'
      }
    ];
    
    const chartData = processChartData(unsortedTransactions);
    
    expect(chartData.months).toEqual(['2025-01', '2025-02', '2025-03']);
    expect(chartData.income).toEqual([500, 800, 1000]);
  });
});