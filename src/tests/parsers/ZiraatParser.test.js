import { describe, test, expect, beforeEach } from 'vitest'
import * as XLSX from 'xlsx'
import { ZiraatParser } from '../../parsers/banks/ZiraatParser.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('ZiraatParser', () => {
  let parser

  beforeEach(() => {
    parser = new ZiraatParser()
  })

  describe('constructor', () => {
    test('should initialize with correct bank type', () => {
      expect(parser.bankType).toBe('ziraat')
      expect(parser.headerKeywords).toContain('tarih')
      expect(parser.headerKeywords).toContain('açıklama')
      expect(parser.headerKeywords).toContain('tutar')
    })
  })

  describe('static methods', () => {
    test('canParse should detect Ziraat files', () => {
      expect(ZiraatParser.canParse('ziraat_ekstre.xlsx')).toBe(true)
      expect(ZiraatParser.canParse('ZB_hesap_ekstre.xlsx')).toBe(true)
      expect(ZiraatParser.canParse('ziraat bank statement.xlsx')).toBe(true)
      expect(ZiraatParser.canParse('other_bank.xlsx')).toBe(false)
    })

    test('getDisplayName should return correct name', () => {
      expect(ZiraatParser.getDisplayName()).toBe('Ziraat Bankası')
    })
  })

  describe('column detection methods', () => {
    test('isDateColumn should detect date columns', () => {
      expect(parser.isDateColumn('tarih')).toBe(true)
      expect(parser.isDateColumn('işlem tarihi')).toBe(true)
      expect(parser.isDateColumn('date')).toBe(true)
      expect(parser.isDateColumn('açıklama')).toBe(false)
    })

    test('isDescriptionColumn should detect description columns', () => {
      expect(parser.isDescriptionColumn('açıklama')).toBe(true)
      expect(parser.isDescriptionColumn('işlem açıklama')).toBe(true)
      expect(parser.isDescriptionColumn('description')).toBe(true)
      expect(parser.isDescriptionColumn('tarih')).toBe(false)
    })

    test('isAmountColumn should detect amount columns', () => {
      expect(parser.isAmountColumn('tutar')).toBe(true)
      expect(parser.isAmountColumn('miktar')).toBe(true)
      expect(parser.isAmountColumn('amount')).toBe(true)
      expect(parser.isAmountColumn('bakiye')).toBe(false) // Should not match balance
    })

    test('isBalanceColumn should detect balance columns', () => {
      expect(parser.isBalanceColumn('bakiye')).toBe(true)
      expect(parser.isBalanceColumn('balance')).toBe(true)
      expect(parser.isBalanceColumn('kalan bakiye')).toBe(true)
      expect(parser.isBalanceColumn('tutar')).toBe(false)
    })

    test('isDebitColumn should detect debit columns', () => {
      expect(parser.isDebitColumn('borç')).toBe(true)
      expect(parser.isDebitColumn('debit')).toBe(true)
      expect(parser.isDebitColumn('gider')).toBe(true)
      expect(parser.isDebitColumn('alacak')).toBe(false)
    })

    test('isCreditColumn should detect credit columns', () => {
      expect(parser.isCreditColumn('alacak')).toBe(true)
      expect(parser.isCreditColumn('credit')).toBe(true)
      expect(parser.isCreditColumn('gelir')).toBe(true)
      expect(parser.isCreditColumn('borç')).toBe(false)
    })
  })

  describe('parseZiraatTransaction', () => {
    test('should parse basic transaction correctly', () => {
      const headers = ['tarih', 'açıklama', 'tutar', 'bakiye']
      const row = ['01/01/2023', 'Test işlem', '1.000,50', '5.000,00']
      
      const transaction = parser.parseZiraatTransaction(row, headers)
      
      expect(transaction.description).toBe('Test işlem')
      expect(transaction.amount).toBe(1000.5)
      expect(transaction.balance).toBe(5000)
      expect(transaction.type).toBe('credit') // Positive amount
      expect(transaction.date).toBeInstanceOf(Date)
    })

    test('should handle debit/credit columns', () => {
      const headers = ['tarih', 'açıklama', 'borç', 'alacak', 'bakiye']
      const debitRow = ['01/01/2023', 'Ödeme', '500,00', '', '4.500,00']
      const creditRow = ['02/01/2023', 'Yatırım', '', '1.000,00', '5.500,00']
      
      const debitTransaction = parser.parseZiraatTransaction(debitRow, headers)
      const creditTransaction = parser.parseZiraatTransaction(creditRow, headers)
      
      expect(debitTransaction.type).toBe('debit')
      expect(debitTransaction.amount).toBe(-500)
      
      expect(creditTransaction.type).toBe('credit')
      expect(creditTransaction.amount).toBe(1000)
    })

    test('should generate consistent IDs for same data', () => {
      const headers = ['tarih', 'açıklama', 'tutar']
      const row = ['01/01/2023', 'Test', '100,00']
      
      const transaction1 = parser.parseZiraatTransaction(row, headers)
      const transaction2 = parser.parseZiraatTransaction(row, headers)
      
      expect(transaction1.id).toBe(transaction2.id)
    })
  })

  describe('parse with real XLSX file', () => {
    test('should parse actual Ziraat XLSX file', () => {
      const xlsxPath = join(__dirname, '../bank_statements/ziraat/1.xlsx')
      
      let fileBuffer
      try {
        fileBuffer = readFileSync(xlsxPath)
      } catch (error) {
        console.warn('Test XLSX file not found, skipping real file test')
        return
      }
      
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const result = parser.parse(workbook)
      
      expect(result).toHaveProperty('bankType', 'ziraat')
      expect(result).toHaveProperty('transactions')
      expect(result).toHaveProperty('totalRows')
      expect(result).toHaveProperty('headerRow')
      expect(result).toHaveProperty('headers')
      
      expect(Array.isArray(result.transactions)).toBe(true)
      expect(typeof result.totalRows).toBe('number')
      expect(typeof result.headerRow).toBe('number')
      expect(Array.isArray(result.headers)).toBe(true)
      
      if (result.transactions.length > 0) {
        const transaction = result.transactions[0]
        
        expect(transaction).toHaveProperty('id')
        expect(transaction).toHaveProperty('date')
        expect(transaction).toHaveProperty('description')
        expect(transaction).toHaveProperty('amount')
        expect(transaction).toHaveProperty('type')
        expect(transaction).toHaveProperty('rawData')
        
        expect(typeof transaction.id).toBe('string')
        expect(transaction.date).toBeInstanceOf(Date)
        expect(typeof transaction.description).toBe('string')
        expect(typeof transaction.amount).toBe('number')
        expect(['credit', 'debit', 'unknown']).toContain(transaction.type)
        expect(Array.isArray(transaction.rawData)).toBe(true)
      }
    })
  })

  describe('parse with mock data', () => {
    test('should parse mock Ziraat data correctly', () => {
      const mockData = [
        ['Ziraat Bankası Hesap Ekstresi'],
        ['Hesap No: 12345678'],
        [''],
        ['Tarih', 'İşlem Açıklama', 'Borç', 'Alacak', 'Bakiye'],
        ['01.01.2023', 'Maaş Yatırımı', '', '5.000,00', '5.000,00'],
        ['02.01.2023', 'Market Alışverişi', '150,75', '', '4.849,25'],
        ['03.01.2023', 'ATM Para Çekme', '500,00', '', '4.349,25'],
        ['04.01.2023', 'EFT Gelen', '', '1.200,00', '5.549,25']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.bankType).toBe('ziraat')
      expect(result.transactions).toHaveLength(4)
      expect(result.headerRow).toBe(3)
      
      const transactions = result.transactions
      
      // Salary deposit
      expect(transactions[0].description).toBe('Maaş Yatırımı')
      expect(transactions[0].amount).toBe(5000)
      expect(transactions[0].type).toBe('credit')
      expect(transactions[0].balance).toBe(5000)
      
      // Market shopping
      expect(transactions[1].description).toBe('Market Alışverişi')
      expect(transactions[1].amount).toBe(-150.75)
      expect(transactions[1].type).toBe('debit')
      expect(transactions[1].balance).toBe(4849.25)
      
      // ATM withdrawal
      expect(transactions[2].description).toBe('ATM Para Çekme')
      expect(transactions[2].amount).toBe(-500)
      expect(transactions[2].type).toBe('debit')
      expect(transactions[2].balance).toBe(4349.25)
      
      // EFT incoming
      expect(transactions[3].description).toBe('EFT Gelen')
      expect(transactions[3].amount).toBe(1200)
      expect(transactions[3].type).toBe('credit')
      expect(transactions[3].balance).toBe(5549.25)
    })

    test('should handle file with no header row', () => {
      const mockData = [
        ['Random Data', 'No Headers'],
        ['More Data', 'Still No Headers']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      expect(() => parser.parse(workbook)).toThrow('Unable to find header row in Ziraat bank statement')
    })

    test('should handle empty file', () => {
      const mockData = []
      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      expect(() => parser.parse(workbook)).toThrow('Unable to find header row in Ziraat bank statement')
    })

    test('should filter out invalid transaction rows', () => {
      const mockData = [
        ['Tarih', 'Açıklama', 'Tutar', 'Bakiye'],
        ['01.01.2023', 'Valid Transaction', '100,00', '1.000,00'],
        ['', '', '', ''], // Empty row
        [null, null, null, null], // Null row
        ['02.01.2023', 'Another Valid', '200,00', '1.200,00']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.transactions).toHaveLength(2) // Only valid transactions
      expect(result.transactions[0].description).toBe('Valid Transaction')
      expect(result.transactions[1].description).toBe('Another Valid')
    })
  })
})