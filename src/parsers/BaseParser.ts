import { Transaction, ParseResult, BankParser } from '../types';

export abstract class BaseParser implements BankParser {
  public bankType: string = 'unknown';

  constructor() {}

  abstract parse(workbook: any): ParseResult;

  parseDate(value: any): Date | null {
    if (!value) return null;
    
    try {
      if (typeof value === 'number') {
        return new Date((value - 25569) * 86400 * 1000);
      }
      
      const dateStr = value.toString().trim();
      
      // Handle Turkish date format DD.MM.YYYY or DD/MM/YYYY first
      const turkishDatePattern = /^(\d{1,2})[\.\\/](\d{1,2})[\.\\/](\d{4})$/;
      const turkishMatch = dateStr.match(turkishDatePattern);
      
      if (turkishMatch) {
        const [, day, month, year] = turkishMatch;
        // Create date with explicit UTC to avoid timezone issues
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Try standard date parsing as fallback
      let date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        // Try splitting by common separators
        const parts = dateStr.split(/[\/\-\.]/);
        if (parts.length === 3) {
          // Assume DD/MM/YYYY or DD.MM.YYYY format for Turkish dates
          if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
            date = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])));
          } else {
            // Standard YYYY-MM-DD format
            date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
          }
        }
      }
      
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  }

  parseAmount(value: any): number {
    if (!value) return 0;
    
    let str = value.toString();
    
    // Handle parentheses for negative amounts
    const isNegativeParens = str.includes('(') && str.includes(')');
    
    // Remove non-numeric characters except comma, dot, and minus
    str = str.replace(/[^\d,.-]/g, '');
    
    if (!str || str === '-') return 0;
    
    // Handle Turkish number format (1.234,56)
    if (str.includes('.') && str.includes(',')) {
      const lastComma = str.lastIndexOf(',');
      const lastDot = str.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Turkish format: 1.234,56
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // US format: 1,234.56
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      // Only comma, assume Turkish decimal separator
      str = str.replace(',', '.');
    }
    
    let num = parseFloat(str);
    if (isNaN(num)) return 0;
    
    // Apply parentheses negative sign
    if (isNegativeParens && num > 0) {
      num = -num;
    }
    
    return num;
  }

  generateRowId(row: any[]): string {
    const rowStr = row.join('|');
    let hash = 0;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  isValidTransactionRow(row: any[]): boolean {
    if (!row || row.length === 0) return false;
    return row.some(cell => 
      cell !== null && cell !== undefined && cell !== ''
    );
  }

  findHeaderRow(data: any[][], keywords: string[] = ['tarih', 'açıklama', 'tutar', 'date', 'description', 'amount']): number {
    let bestMatch = -1;
    let maxMatches = 0;
    
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const row = data[i];
      if (!row || row.length < 3) continue; // Need at least 3 columns for a valid header
      
      let matches = 0;
      const cellsWithKeywords: { cell: string; keywords: string[] }[] = [];
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell) continue;
        
        const cellStr = cell.toString().toLowerCase().trim();
        const matchedKeywords = keywords.filter(keyword => cellStr.includes(keyword));
        
        if (matchedKeywords.length > 0) {
          matches += matchedKeywords.length;
          cellsWithKeywords.push({ cell: cellStr, keywords: matchedKeywords });
        }
      }
      
      // A good header row should have multiple keyword matches and be relatively complete
      if (matches >= 3 && matches > maxMatches) {
        maxMatches = matches;
        bestMatch = i;
      }
    }
    
    return bestMatch;
  }

  createBaseTransaction(row: any[]): Transaction {
    return {
      id: this.generateRowId(row),
      date: null,
      description: '',
      amount: 0,
      balance: 0,
      type: 'unknown',
      rawData: row,
      iban: 'UNKNOWN'
    };
  }
}

export default BaseParser;