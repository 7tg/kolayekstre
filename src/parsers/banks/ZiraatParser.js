import * as XLSX from 'xlsx';
import { BaseParser } from '../BaseParser.js';

export class ZiraatParser extends BaseParser {
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

  parse(workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const transactions = [];
    let headerRowIndex = this.findHeaderRow(data, this.headerKeywords);

    if (headerRowIndex === -1) {
      throw new Error('Unable to find header row in Ziraat bank statement. Expected columns: Tarih, Açıklama, Tutar');
    }

    const headers = data[headerRowIndex].map(h => h?.toString().trim().toLowerCase());
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (this.isValidTransactionRow(row)) {
        const transaction = this.parseZiraatTransaction(row, headers);
        if (transaction.date) {
          transactions.push(transaction);
        }
      }
    }

    return {
      bankType: this.bankType,
      transactions,
      totalRows: transactions.length,
      headerRow: headerRowIndex,
      headers: headers
    };
  }

  parseZiraatTransaction(row, headers) {
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
          transaction.type = 'debit';
          transaction.amount = -Math.abs(amount);
        }
      } else if (this.isCreditColumn(header)) {
        const amount = this.parseAmount(value);
        if (amount > 0) {
          transaction.type = 'credit';
          transaction.amount = Math.abs(amount);
        }
      }
    }

    if (transaction.type === 'unknown' && transaction.amount !== 0) {
      transaction.type = transaction.amount > 0 ? 'credit' : 'debit';
    }

    return transaction;
  }

  isDateColumn(header) {
    return ['tarih', 'işlem tarihi', 'date', 'tarih/saat'].some(keyword => 
      header.includes(keyword)
    );
  }

  isDescriptionColumn(header) {
    return ['açıklama', 'işlem açıklama', 'description', 'memo', 'detay'].some(keyword => 
      header.includes(keyword)
    );
  }

  isAmountColumn(header) {
    return ['tutar', 'miktar', 'amount', 'işlem tutarı', 'i̇şlem tutari'].some(keyword => 
      header.includes(keyword)
    ) && !this.isBalanceColumn(header);
  }

  isBalanceColumn(header) {
    return ['bakiye', 'balance', 'kalan bakiye'].some(keyword => 
      header.includes(keyword)
    );
  }

  isDebitColumn(header) {
    return ['borç', 'debit', 'gider', 'çıkış', 'ödeme'].some(keyword => 
      header.includes(keyword)
    );
  }

  isCreditColumn(header) {
    return ['alacak', 'credit', 'gelir', 'giriş', 'para yatırma'].some(keyword => 
      header.includes(keyword)
    );
  }

  static canParse(filename) {
    const name = filename.toLowerCase();
    return name.includes('ziraat') || 
           name.includes('zb') ||
           name.includes('ziraat bank');
  }

  static getDisplayName() {
    return 'Ziraat Bankası';
  }
}

export default ZiraatParser;