import * as XLSX from 'xlsx';
import { BaseParser } from '../BaseParser';
import { ParseResult, Transaction } from '../../types';

export class ZiraatParser extends BaseParser {
  private headerKeywords: string[];

  constructor() {
    super();
    this.bankType = 'ziraat';
    this.headerKeywords = [
      'tarih', 'işlem tarihi', 'date',
      'açıklama', 'işlem açıklama', 'description', 'memo',
      'tutar', 'miktar', 'amount', 'işlem tutarı',
      'bakiye', 'balance',
      'borç', 'debit', 'gider',
      'alacak', 'credit', 'gelir',
      'fiş no', 'fiş'
    ];
  }

  parse(workbook: XLSX.WorkBook): ParseResult {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const transactions: Transaction[] = [];
    const errors: string[] = [];
    let headerRowIndex = this.findHeaderRow(data, this.headerKeywords);
    
    // Extract IBAN from the document
    const iban = this.extractIBAN(data);
    
    // IBAN is required - if not found, return error
    if (!iban) {
      const error = 'Unable to extract IBAN from Ziraat bank statement. IBAN is required for processing.';
      errors.push(error);
      return {
        bankType: this.bankType,
        transactions: [],
        fileName: '',
        errors,
        iban: 'UNKNOWN'
      };
    }

    if (headerRowIndex === -1) {
      const error = 'Unable to find header row in Ziraat bank statement. Expected columns: Tarih, Açıklama, Tutar';
      errors.push(error);
      return {
        bankType: this.bankType,
        transactions: [],
        fileName: '',
        errors,
        iban
      };
    }

    const headers = data[headerRowIndex].map((h: any) => h?.toString().trim().toLowerCase());
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (this.isValidTransactionRow(row)) {
        try {
          const transaction = this.parseZiraatTransaction(row, headers);
          if (transaction.date) {
            transaction.bankType = this.bankType;
            transaction.iban = iban;
            transactions.push(transaction);
          }
        } catch (error) {
          errors.push(`Error parsing row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    return {
      bankType: this.bankType,
      transactions,
      fileName: '',
      errors,
      iban
    };
  }

  private parseZiraatTransaction(row: any[], headers: string[]): Transaction {
    const transaction = this.createBaseTransaction(row);

    for (let i = 0; i < headers.length && i < row.length; i++) {
      const header = headers[i];
      const value = row[i];

      if (!header || value === null || value === undefined) continue;

      if (this.isDateColumn(header)) {
        transaction.date = this.parseDate(value);
      } else if (this.isDescriptionColumn(header)) {
        transaction.description = value?.toString().trim() || '';
      } else if (this.isAmountColumn(header)) {
        transaction.amount = this.parseAmount(value);
      } else if (this.isBalanceColumn(header)) {
        transaction.balance = this.parseAmount(value);
      } else if (this.isDebitColumn(header)) {
        const amount = this.parseAmount(value);
        if (amount > 0) {
          transaction.type = 'expense';
          transaction.amount = -Math.abs(amount);
        }
      } else if (this.isCreditColumn(header)) {
        const amount = this.parseAmount(value);
        if (amount > 0) {
          transaction.type = 'income';
          transaction.amount = Math.abs(amount);
        }
      }
    }

    if (transaction.type === 'unknown' && transaction.amount !== 0) {
      transaction.type = transaction.amount > 0 ? 'income' : 'expense';
    }

    return transaction;
  }

  private isDateColumn(header: string): boolean {
    return ['tarih', 'işlem tarihi', 'date', 'tarih/saat'].some(keyword => 
      header.includes(keyword)
    );
  }

  private isDescriptionColumn(header: string): boolean {
    return ['açıklama', 'işlem açıklama', 'description', 'memo', 'detay'].some(keyword => 
      header.includes(keyword)
    );
  }

  private isAmountColumn(header: string): boolean {
    return ['tutar', 'miktar', 'amount', 'işlem tutarı', 'i̇şlem tutari'].some(keyword => 
      header.includes(keyword)
    ) && !this.isBalanceColumn(header);
  }

  private isBalanceColumn(header: string): boolean {
    return ['bakiye', 'balance', 'kalan bakiye'].some(keyword => 
      header.includes(keyword)
    );
  }

  private isDebitColumn(header: string): boolean {
    return ['borç', 'debit', 'gider', 'çıkış', 'ödeme'].some(keyword => 
      header.includes(keyword)
    );
  }

  private isCreditColumn(header: string): boolean {
    return ['alacak', 'credit', 'gelir', 'giriş', 'para yatırma'].some(keyword => 
      header.includes(keyword)
    );
  }

  private extractIBAN(data: any[][]): string | undefined {
    // Check first 15 rows for IBAN information
    const rowsToCheck = Math.min(15, data.length);
    
    for (let i = 0; i < rowsToCheck; i++) {
      const row = data[i];
      if (!row) continue;
      
      // Check if this row contains "IBAN" label in one column
      // and the actual IBAN value in another column
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell) continue;
        
        const cellStr = cell.toString().trim();
        
        // Check if this cell contains "IBAN" label
        if (cellStr.toUpperCase() === 'IBAN' || cellStr.match(/^IBAN\s*$/i)) {
          // Check the next non-empty cells for the IBAN value
          for (let k = j + 1; k < row.length; k++) {
            if (row[k]) {
              const ibanCandidate = row[k].toString().trim();
              // Check if it's a valid Turkish IBAN
              if (ibanCandidate.match(/^TR\d{24}$/)) {
                return ibanCandidate;
              }
            }
          }
        }
        
        // Also check for inline IBAN patterns (e.g., "IBAN: TR...")
        if (cellStr.includes('IBAN')) {
          const match = cellStr.match(/IBAN\s*[:]\s*(TR\d{24})/i);
          if (match && match[1]) {
            return match[1];
          }
        }
        
        // Check if the cell itself is just an IBAN
        const cleanedCell = cellStr.replace(/\s/g, '');
        if (cleanedCell.match(/^TR\d{24}$/)) {
          return cleanedCell;
        }
      }
    }
    
    // If no IBAN found, look for regular account numbers
    // Ziraat Bank account numbers are typically shown as "Hesap No: XXXXXXXX"
    for (let i = 0; i < rowsToCheck; i++) {
      const row = data[i];
      if (!row) continue;
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell) continue;
        
        const cellStr = cell.toString().trim();
        
        // Check for "Hesap No" label
        if (cellStr.match(/Hesap\s*No/i)) {
          // Check next cells for account number
          for (let k = j + 1; k < row.length; k++) {
            if (row[k]) {
              const accountCandidate = row[k].toString().trim();
              if (accountCandidate.match(/^\d+$/)) {
                return `Account: ${accountCandidate}`;
              }
            }
          }
          
          // Also check inline format
          const accountMatch = cellStr.match(/Hesap\s*No\s*[:]\s*(\d+)/i);
          if (accountMatch && accountMatch[1]) {
            return `Account: ${accountMatch[1]}`;
          }
        }
      }
    }
    
    return undefined;
  }

  static canParse(filename: string): boolean {
    const name = filename.toLowerCase();
    return name.includes('ziraat') || 
           name.includes('zb') ||
           name.includes('ziraat bank');
  }

  static getDisplayName(): string {
    return 'Ziraat Bankası';
  }
}

export default ZiraatParser;