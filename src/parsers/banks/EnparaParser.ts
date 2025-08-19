import * as XLSX from 'xlsx';
import { BaseParser } from '../BaseParser';
import { ParseResult, Transaction } from '../../types';

export class EnparaParser extends BaseParser {
  constructor() {
    super();
    this.bankType = 'enpara';
  }

  parse(workbook: XLSX.WorkBook): ParseResult {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const transactions: Transaction[] = [];
    const errors: string[] = [];
    
    // Extract IBAN from the document
    const iban = this.extractIBAN(data);
    
    // IBAN is required - if not found, return error
    if (!iban) {
      const error = 'Unable to extract IBAN from Enpara bank statement. IBAN is required for processing.';
      errors.push(error);
      return {
        bankType: this.bankType,
        transactions: [],
        fileName: '',
        errors,
        iban: 'UNKNOWN'
      };
    }

    // Find header row for transactions
    let headerRowIndex = this.findEnparaHeaderRow(data);
    
    if (headerRowIndex === -1) {
      const error = 'Unable to find header row in Enpara bank statement. Expected columns: Tarih, Hareket tipi, Açıklama, İşlem Tutarı, Bakiye';
      errors.push(error);
      return {
        bankType: this.bankType,
        transactions: [],
        fileName: '',
        errors,
        iban
      };
    }

    // Headers are not used in Enpara parsing since we use fixed column positions
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (this.isValidEnparaTransactionRow(row)) {
        try {
          const transaction = this.parseEnparaTransaction(row);
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

  private findEnparaHeaderRow(data: any[][]): number {
    // Look for the row that contains "Tarih", "Hareket tipi", "Açıklama", "İşlem Tutarı", "Bakiye"
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const row = data[i];
      if (!row) continue;
      
      const rowStr = row.join(' ').toLowerCase();
      // Turkish-specific normalization
      const normalizedRowStr = rowStr
        .replace(/[İı]/g, 'i')
        .replace(/[Ğğ]/g, 'g')
        .replace(/[Üü]/g, 'u')
        .replace(/[Şş]/g, 's')
        .replace(/[Öö]/g, 'o')
        .replace(/[Çç]/g, 'c');
      
      if (normalizedRowStr.includes('tarih') && 
          normalizedRowStr.includes('hareket tipi') && 
          normalizedRowStr.includes('aciklama') && 
          (normalizedRowStr.includes('islem tutari') || normalizedRowStr.includes('tutar')) && 
          normalizedRowStr.includes('bakiye')) {
        return i;
      }
    }
    return -1;
  }

  private isValidEnparaTransactionRow(row: any[]): boolean {
    if (!row || row.length < 10) return false;
    
    // Check if row has date, description, and amount
    // In Enpara format: [null, null, null, "19.08.2025", null, null, "Encard Harcaması", null, null, "description", null, null, -1067.98, null, 29346.97]
    const date = row[3]; // Date is at index 3
    const transactionType = row[6]; // Transaction type at index 6
    const description = row[9]; // Description at index 9
    const amount = row[12]; // Amount at index 12
    const balance = row[14]; // Balance at index 14
    
    return date && 
           transactionType && 
           description && 
           (typeof amount === 'number' || (typeof amount === 'string' && amount.trim() !== '')) &&
           (typeof balance === 'number' || (typeof balance === 'string' && balance.trim() !== ''));
  }

  private parseEnparaTransaction(row: any[]): Transaction {
    const transaction = this.createBaseTransaction(row);

    // Enpara specific column positions based on the file structure
    const date = row[3]; // Date is at index 3
    const transactionType = row[6]; // Transaction type at index 6
    const description = row[9]; // Description at index 9
    const amount = row[12]; // Amount at index 12
    const balance = row[14]; // Balance at index 14

    // Parse date
    if (date) {
      transaction.date = this.parseEnparaDate(date);
    }

    // Parse description - combine transaction type and description
    let fullDescription = '';
    if (transactionType) {
      fullDescription += transactionType.toString().trim();
    }
    if (description) {
      if (fullDescription) fullDescription += ': ';
      fullDescription += description.toString().trim();
    }
    transaction.description = fullDescription;

    // Parse amount
    if (amount !== null && amount !== undefined) {
      transaction.amount = typeof amount === 'number' ? amount : this.parseAmount(amount);
    }

    // Parse balance
    if (balance !== null && balance !== undefined) {
      transaction.balance = typeof balance === 'number' ? balance : this.parseAmount(balance);
    }

    // Determine transaction type based on amount
    if (transaction.amount > 0) {
      transaction.type = 'income';
    } else if (transaction.amount < 0) {
      transaction.type = 'expense';
    } else {
      transaction.type = 'unknown';
    }

    return transaction;
  }

  public parseEnparaDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    try {
      const dateStr = dateValue.toString().trim();
      
      // Try different date formats
      // Format: "19.08.2025" (DD.MM.YYYY)
      if (dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        const [day, month, year] = dateStr.split('.');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Format: "20250819" (YYYYMMDD)
      if (dateStr.match(/^\d{8}$/)) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Fallback to base parser
      return this.parseDate(dateValue);
    } catch (error) {
      return null;
    }
  }

  private extractIBAN(data: any[][]): string | undefined {
    // Check first 10 rows for IBAN information
    const rowsToCheck = Math.min(10, data.length);
    
    for (let i = 0; i < rowsToCheck; i++) {
      const row = data[i];
      if (!row) continue;
      
      // Look for "IBAN" label and the IBAN value in the same row
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell) continue;
        
        const cellStr = cell.toString().trim();
        
        // Check if this cell contains "IBAN" label
        if (cellStr.toUpperCase() === 'IBAN') {
          // Check the rest of the row for IBAN value
          for (let k = j + 1; k < row.length; k++) {
            if (row[k]) {
              const ibanCandidate = row[k].toString().trim().replace(/\s/g, '');
              // Check if it's a valid Turkish IBAN
              if (ibanCandidate.match(/^TR\d{24}$/)) {
                return ibanCandidate;
              }
            }
          }
        }
        
        // Also check for IBAN value with spaces (e.g., "TR71 0011 1000 0000 0083 9266 37")
        if (cellStr.match(/^TR\d{2}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{2}$/)) {
          return cellStr.replace(/\s/g, '');
        }
        
        // Check for any IBAN-like pattern with spaces that should be 26 characters when cleaned
        const cleanedForCheck = cellStr.replace(/\s/g, '');
        if (cleanedForCheck.match(/^TR\d{24}$/)) {
          return cleanedForCheck;
        }
        
        // Check for simple IBAN format
        const cleanedCell = cellStr.replace(/\s/g, '');
        if (cleanedCell.match(/^TR\d{24}$/)) {
          return cleanedCell;
        }
      }
    }
    
    return undefined;
  }

  static canParse(filename: string): boolean {
    const name = filename.toLowerCase();
    return name.includes('enpara') || 
           name.includes('enparacom') ||
           name.includes('enpara.com') ||
           name.includes('qnb');
  }

  static getDisplayName(): string {
    return 'Enpara.com';
  }
}

export default EnparaParser;