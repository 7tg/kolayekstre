import { Transaction } from '../types';

interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  requiresClear: boolean;
}

export function validateTransactionSchema(transaction: any): SchemaValidationResult {
  const errors: string[] = [];
  let requiresClear = false;

  // Check for required fields
  if (!transaction.hasOwnProperty('iban')) {
    errors.push('Transaction missing required field: iban');
    requiresClear = true;
  }

  if (transaction.iban === null || transaction.iban === undefined) {
    errors.push('Transaction has null or undefined IBAN');
    requiresClear = true;
  }

  // Check other required fields
  const requiredFields = ['id', 'date', 'description', 'amount', 'balance', 'type', 'rawData'];
  
  for (const field of requiredFields) {
    if (!transaction.hasOwnProperty(field)) {
      errors.push(`Transaction missing required field: ${field}`);
      requiresClear = true;
    }
  }

  // Validate field types if they exist
  if (transaction.iban && typeof transaction.iban !== 'string') {
    errors.push('Transaction IBAN must be a string');
    requiresClear = true;
  }

  if (transaction.type && !['income', 'expense', 'unknown'].includes(transaction.type)) {
    errors.push(`Invalid transaction type: ${transaction.type}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    requiresClear
  };
}

export function validateStoredData(data: any[]): SchemaValidationResult {
  const errors: string[] = [];
  let requiresClear = false;

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Stored data is not an array'],
      requiresClear: true
    };
  }

  for (let i = 0; i < data.length; i++) {
    const validation = validateTransactionSchema(data[i]);
    if (!validation.isValid) {
      errors.push(`Transaction at index ${i}: ${validation.errors.join(', ')}`);
      if (validation.requiresClear) {
        requiresClear = true;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    requiresClear
  };
}

export function migrateTransaction(transaction: any): Transaction | null {
  // If transaction doesn't have IBAN, we can't migrate it
  if (!transaction.iban && !transaction.accountNumber) {
    return null;
  }

  // Attempt to create a valid transaction
  try {
    const migrated: Transaction = {
      id: transaction.id || generateTransactionId(transaction),
      date: transaction.date ? new Date(transaction.date) : null,
      description: transaction.description || '',
      amount: Number(transaction.amount) || 0,
      balance: Number(transaction.balance) || 0,
      type: transaction.type || 'unknown',
      rawData: transaction.rawData || [],
      iban: transaction.iban || `Account: ${transaction.accountNumber}`,
      bankType: transaction.bankType
    };

    return migrated;
  } catch (error) {
    return null;
  }
}

function generateTransactionId(transaction: any): string {
  const data = JSON.stringify({
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    balance: transaction.balance
  });
  
  // Simple hash function for ID generation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

export function clearInvalidData(): void {
  // Clear localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('transaction') || key.includes('iban')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Clear sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('transaction') || key.includes('iban')) {
        sessionStorage.removeItem(key);
      }
    });
  }
}