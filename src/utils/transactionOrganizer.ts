import { Transaction, TransactionsByIBAN, StatsSummary } from '../types';

export function organizeTransactionsByIBAN(transactions: Transaction[]): TransactionsByIBAN {
  const organized: TransactionsByIBAN = {};

  transactions.forEach(transaction => {
    const iban = transaction.iban || 'UNKNOWN';
    
    if (!organized[iban]) {
      organized[iban] = {
        iban,
        transactions: [],
        bankType: transaction.bankType || 'unknown',
        stats: undefined
      };
    }
    
    organized[iban].transactions.push(transaction);
  });

  // Calculate stats for each IBAN
  Object.keys(organized).forEach(iban => {
    organized[iban].stats = calculateStats(organized[iban].transactions);
  });

  return organized;
}

export function calculateStats(transactions: Transaction[]): StatsSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  transactions.forEach(transaction => {
    if (transaction.amount > 0) {
      totalIncome += transaction.amount;
    } else {
      totalExpense += Math.abs(transaction.amount);
    }

    if (transaction.date) {
      if (!minDate || transaction.date < minDate) {
        minDate = transaction.date;
      }
      if (!maxDate || transaction.date > maxDate) {
        maxDate = transaction.date;
      }
    }
  });

  const transactionCount = transactions.length;
  const netAmount = totalIncome - totalExpense;
  const avgTransaction = transactionCount > 0 ? netAmount / transactionCount : 0;

  return {
    totalIncome,
    totalExpense,
    netAmount,
    transactionCount,
    avgTransaction,
    dateRange: {
      start: minDate,
      end: maxDate
    }
  };
}

export function mergeTransactionsByIBAN(
  existing: TransactionsByIBAN, 
  newTransactions: Transaction[]
): TransactionsByIBAN {
  const result = { ...existing };
  
  newTransactions.forEach(transaction => {
    const iban = transaction.iban || 'UNKNOWN';
    
    if (!result[iban]) {
      result[iban] = {
        iban,
        transactions: [],
        bankType: transaction.bankType || 'unknown',
        stats: undefined
      };
    }
    
    // Check for duplicates based on transaction id
    const isDuplicate = result[iban].transactions.some(t => t.id === transaction.id);
    
    if (!isDuplicate) {
      result[iban].transactions.push(transaction);
    }
  });
  
  // Recalculate stats for affected IBANs
  Object.keys(result).forEach(iban => {
    result[iban].stats = calculateStats(result[iban].transactions);
  });
  
  return result;
}