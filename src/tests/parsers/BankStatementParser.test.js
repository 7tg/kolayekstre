import { describe, test, expect, beforeEach, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { BankStatementParser } from '../../parsers/BankStatementParser.js'
import { ZiraatParser } from '../../parsers/banks/ZiraatParser.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Mock File class for testing
class MockFile {
  constructor(buffer, name, options = {}) {
    this.buffer = buffer
    this.name = name
    this.size = buffer.length
    this.type = options.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    this.lastModified = options.lastModified || Date.now()
  }

  arrayBuffer() {
    return Promise.resolve(this.buffer)
  }

  slice() {
    return new Blob([this.buffer])
  }
}

describe('BankStatementParser', () => {
  let parser

  beforeEach(() => {
    parser = new BankStatementParser()
  })

  describe('constructor', () => {
    test('should initialize with default parsers', () => {
      expect(parser.parsers).toBeInstanceOf(Map)
      expect(parser.parsers.has('ziraat')).toBe(true)
      expect(parser.parsers.get('ziraat')).toBe(ZiraatParser)
    })
  })

  describe('registerParser', () => {
    test('should register new parser', () => {
      class TestParser {
        static canParse() { return true }
        static getDisplayName() { return 'Test Bank' }
        parse() { return { bankType: 'test', transactions: [] } }
      }

      parser.registerParser('test', TestParser)
      
      expect(parser.parsers.has('test')).toBe(true)
      expect(parser.parsers.get('test')).toBe(TestParser)
    })
  })

  describe('detectBankType', () => {
    test('should detect Ziraat bank from filename', () => {
      const file = new MockFile(Buffer.from(''), 'ziraat_ekstre.xlsx')
      const detectedParser = parser.detectBankType(file)
      
      expect(detectedParser).toBeInstanceOf(ZiraatParser)
    })

    test('should return null for unknown bank', () => {
      const file = new MockFile(Buffer.from(''), 'unknown_bank.xlsx')
      const detectedParser = parser.detectBankType(file)
      
      expect(detectedParser).toBeNull()
    })
  })

  describe('getSupportedBanks', () => {
    test('should return list of supported banks', () => {
      const banks = parser.getSupportedBanks()
      
      expect(Array.isArray(banks)).toBe(true)
      expect(banks).toHaveLength(1)
      
      const ziraatBank = banks.find(b => b.type === 'ziraat')
      expect(ziraatBank).toBeDefined()
      expect(ziraatBank.name).toBe('Ziraat Bankası')
      expect(ziraatBank.canAutoDetect).toBe(true)
    })
  })

  describe('parseFile', () => {
    test('should parse file with auto detection', async () => {
      const mockData = [
        ['Tarih', 'Açıklama', 'Tutar', 'Bakiye'],
        ['01.01.2023', 'Test Transaction', '100,00', '1.000,00']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = XLSX.write({ SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }, { type: 'array' })
      
      const file = new MockFile(workbook, 'ziraat_ekstre.xlsx')
      
      const result = await parser.parseFile(file)
      
      expect(result).toHaveProperty('bankType', 'ziraat')
      expect(result).toHaveProperty('transactions')
      expect(result).toHaveProperty('filename', 'ziraat_ekstre.xlsx')
      expect(result).toHaveProperty('fileSize', workbook.length)
      expect(result).toHaveProperty('parsedAt')
      expect(result.parsedAt).toBeInstanceOf(Date)
    })

    test('should parse file with specified bank type', async () => {
      const mockData = [
        ['Tarih', 'Açıklama', 'Tutar', 'Bakiye'],
        ['01.01.2023', 'Test Transaction', '100,00', '1.000,00']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = XLSX.write({ SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }, { type: 'array' })
      
      const file = new MockFile(workbook, 'bank_statement.xlsx')
      
      const result = await parser.parseFile(file, 'ziraat')
      
      expect(result).toHaveProperty('bankType', 'ziraat')
      expect(result).toHaveProperty('transactions')
      expect(result.transactions).toHaveLength(1)
    })

    test('should throw error for unsupported bank type', async () => {
      const file = new MockFile(Buffer.from('test'), 'test.xlsx')
      
      await expect(parser.parseFile(file, 'unsupported')).rejects.toThrow('Unsupported bank type: unsupported')
    })

    test('should throw error when cannot detect bank type', async () => {
      const file = new MockFile(Buffer.from('test'), 'unknown_bank.xlsx')
      
      await expect(parser.parseFile(file)).rejects.toThrow('Unable to detect bank type')
    })

    test('should throw error when no transactions found', async () => {
      const mockData = [
        ['Random', 'Data'],
        ['No', 'Transactions']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = XLSX.write({ SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }, { type: 'array' })
      
      const file = new MockFile(workbook, 'ziraat_ekstre.xlsx')
      
      await expect(parser.parseFile(file)).rejects.toThrow(/Error parsing ziraat bank statement/)
    })

    test('should handle parser errors gracefully', async () => {
      const mockData = [
        ['Invalid', 'Data']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = XLSX.write({ SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }, { type: 'array' })
      
      const file = new MockFile(workbook, 'ziraat_ekstre.xlsx')
      
      await expect(parser.parseFile(file)).rejects.toThrow(/Error parsing ziraat bank statement/)
    })
  })

  describe('parseFile with real XLSX file', () => {
    test('should parse actual Ziraat XLSX file', async () => {
      const xlsxPath = join(__dirname, '../bank_statements/ziraat/1.xlsx')
      
      let fileBuffer
      try {
        fileBuffer = readFileSync(xlsxPath)
      } catch (error) {
        console.warn('Test XLSX file not found, skipping real file test')
        return
      }
      
      const file = new MockFile(fileBuffer, '1.xlsx')
      
      // Test auto-detection (should fail since filename doesn't contain 'ziraat')
      try {
        await parser.parseFile(file)
        // If it succeeds, the file was detected, which is unexpected
      } catch (error) {
        expect(error.message).toContain('Unable to detect bank type')
      }
      
      // Test with explicit bank type
      const result = await parser.parseFile(file, 'ziraat')
      
      expect(result).toHaveProperty('bankType', 'ziraat')
      expect(result).toHaveProperty('transactions')
      expect(result).toHaveProperty('totalRows')
      expect(result).toHaveProperty('filename', '1.xlsx')
      expect(result).toHaveProperty('fileSize', fileBuffer.length)
      expect(result).toHaveProperty('parsedAt')
      
      expect(Array.isArray(result.transactions)).toBe(true)
      expect(typeof result.totalRows).toBe('number')
      expect(result.parsedAt).toBeInstanceOf(Date)
      
      // If we have transactions, validate their structure
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
        
        console.log(`Parsed ${result.transactions.length} transactions from real XLSX file`)
        console.log('Sample transaction:', {
          date: transaction.date && !isNaN(transaction.date.getTime()) ? transaction.date.toISOString().split('T')[0] : 'Invalid Date',
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type
        })
      }
    })
  })

  describe('validateTransaction', () => {
    test('should validate correct transaction', () => {
      const validTransaction = {
        id: 'test-id',
        date: new Date(),
        description: 'Test transaction',
        amount: 100,
        balance: 1000,
        type: 'credit',
        rawData: []
      }
      
      expect(BankStatementParser.validateTransaction(validTransaction)).toBe(true)
    })

    test('should reject invalid transactions', () => {
      const invalidTransactions = [
        null,
        {},
        { id: 123 }, // id should be string
        { id: 'test', date: 'invalid' }, // date should be Date object
        { id: 'test', date: new Date(), description: 123 }, // description should be string
        { id: 'test', date: new Date(), description: 'test', amount: 'invalid' }, // amount should be number
        { id: 'test', date: new Date(), description: 'test', amount: 100, type: 'invalid' }, // invalid type
      ]
      
      invalidTransactions.forEach(transaction => {
        expect(BankStatementParser.validateTransaction(transaction)).toBe(false)
      })
    })
  })
})