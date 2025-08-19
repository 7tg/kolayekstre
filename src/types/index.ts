export interface Transaction {
  id: string;
  date: Date | null;
  description: string;
  amount: number;
  balance: number;
  type: 'income' | 'expense' | 'unknown';
  rawData: any[];
  bankType?: string;
  iban: string;
}

export interface ParseResult {
  transactions: Transaction[];
  bankType: string;
  fileName: string;
  errors: string[];
  iban: string;
}

export interface BankParser {
  bankType: string;
  parse(workbook: any): ParseResult;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface StatsSummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  avgTransaction: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface FilterOptions {
  type: 'all' | 'income' | 'expense';
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface TransactionsByIBAN {
  [iban: string]: {
    iban: string;
    transactions: Transaction[];
    bankType: string;
    stats?: StatsSummary;
  };
}

export interface FileUploadProps {
  onFileProcessed: (result: ParseResult) => void;
  onError: (error: string) => void;
}

export interface TransactionTableProps {
  transactions: Transaction[];
}

export interface TransactionChartProps {
  transactions: Transaction[];
}

export interface StatsPanelProps {
  transactions: Transaction[];
}