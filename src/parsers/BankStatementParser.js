import * as XLSX from 'xlsx';
import { ZiraatParser } from './banks/ZiraatParser.js';

export class BankStatementParser {
  constructor() {
    this.parsers = new Map();
    this.registerParser('ziraat', ZiraatParser);
  }

  registerParser(bankType, ParserClass) {
    this.parsers.set(bankType, ParserClass);
  }

  async parseFile(file, bankType = null) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    
    let parser;
    
    if (bankType && bankType !== 'auto') {
      const ParserClass = this.parsers.get(bankType);
      if (!ParserClass) {
        throw new Error(`Unsupported bank type: ${bankType}`);
      }
      parser = new ParserClass();
    } else {
      parser = this.detectBankType(file);
      if (!parser) {
        throw new Error('Unable to detect bank type. Please select bank type manually.');
      }
    }

    try {
      const result = parser.parse(workbook);
      
      if (!result.transactions || result.transactions.length === 0) {
        throw new Error('No valid transactions found in the file');
      }

      return {
        ...result,
        filename: file.name,
        fileSize: file.size,
        parsedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Error parsing ${parser.bankType} bank statement: ${error.message}`);
    }
  }

  detectBankType(file) {
    const fileName = file.name.toLowerCase();
    
    for (const [bankType, ParserClass] of this.parsers) {
      if (ParserClass.canParse && ParserClass.canParse(fileName)) {
        return new ParserClass();
      }
    }

    return null;
  }

  getSupportedBanks() {
    const banks = [];
    for (const [bankType, ParserClass] of this.parsers) {
      banks.push({
        type: bankType,
        name: ParserClass.getDisplayName ? ParserClass.getDisplayName() : bankType,
        canAutoDetect: typeof ParserClass.canParse === 'function'
      });
    }
    return banks;
  }

  static validateTransaction(transaction) {
    if (!transaction) return false;
    
    return (
      typeof transaction.id === 'string' &&
      transaction.date instanceof Date &&
      !isNaN(transaction.date.getTime()) &&
      typeof transaction.description === 'string' &&
      typeof transaction.amount === 'number' &&
      ['credit', 'debit', 'unknown'].includes(transaction.type)
    );
  }
}

export default BankStatementParser;