import * as XLSX from 'xlsx';
import { ZiraatParser } from './banks/ZiraatParser';
import { EnparaParser } from './banks/EnparaParser';
import { ParseResult, Transaction, BankParser } from '../types';

interface BankInfo {
  type: string;
  name: string;
  canAutoDetect: boolean;
}

interface ParsedResult extends ParseResult {
  filename: string;
  fileSize: number;
  parsedAt: Date;
}

export class BankStatementParser {
  private parsers: Map<string, new () => BankParser>;

  constructor() {
    this.parsers = new Map();
    this.registerParser('ziraat', ZiraatParser);
    this.registerParser('enpara', EnparaParser);
  }

  registerParser(bankType: string, ParserClass: new () => BankParser): void {
    this.parsers.set(bankType, ParserClass);
  }

  async parseFile(file: File, bankType: string | null = null): Promise<ParsedResult> {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    
    let parser: BankParser;
    
    if (bankType && bankType !== 'auto') {
      const ParserClass = this.parsers.get(bankType);
      if (!ParserClass) {
        throw new Error(`Unsupported bank type: ${bankType}`);
      }
      parser = new ParserClass();
    } else {
      const detectedParser = this.detectBankType(file);
      if (!detectedParser) {
        throw new Error('Unable to detect bank type. Please select bank type manually.');
      }
      parser = detectedParser;
    }

    try {
      const result = parser.parse(workbook);
      
      // Check for parsing errors first
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors.join('; '));
      }
      
      if (!result.transactions || result.transactions.length === 0) {
        throw new Error('No valid transactions found in the file');
      }

      return {
        ...result,
        fileName: file.name,
        filename: file.name,
        fileSize: file.size,
        parsedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Error parsing ${parser.bankType} bank statement: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private detectBankType(file: File): BankParser | null {
    const fileName = file.name.toLowerCase();
    
    for (const [, ParserClass] of this.parsers) {
      const ParserWithStatic = ParserClass as any;
      if (ParserWithStatic.canParse && ParserWithStatic.canParse(fileName)) {
        return new ParserClass();
      }
    }

    return null;
  }

  getSupportedBanks(): BankInfo[] {
    const banks: BankInfo[] = [];
    for (const [type, ParserClass] of this.parsers) {
      const ParserWithStatic = ParserClass as any;
      banks.push({
        type,
        name: ParserWithStatic.getDisplayName ? ParserWithStatic.getDisplayName() : type,
        canAutoDetect: typeof ParserWithStatic.canParse === 'function'
      });
    }
    return banks;
  }

  static validateTransaction(transaction: Transaction): boolean {
    if (!transaction) return false;
    
    return (
      typeof transaction.id === 'string' &&
      transaction.date instanceof Date &&
      !isNaN(transaction.date.getTime()) &&
      typeof transaction.description === 'string' &&
      typeof transaction.amount === 'number' &&
      ['income', 'expense', 'unknown'].includes(transaction.type) &&
      typeof transaction.iban === 'string' &&
      transaction.iban.length > 0
    );
  }
}

export default BankStatementParser;