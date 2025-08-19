import { describe, test, expect } from 'vitest'
import { BaseParser } from '../../parsers/BaseParser.js'

describe('BaseParser', () => {
  const parser = new BaseParser()

  describe('parseDate', () => {
    test('should parse Excel date number correctly', () => {
      const excelDate = 44927 // 2023-01-01
      const result = parser.parseDate(excelDate)
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023) // Excel dates start from 1900
    })

    test('should parse date string correctly', () => {
      const result = parser.parseDate('2023-01-01')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
    })

    test('should parse date with slashes', () => {
      const result = parser.parseDate('01/06/2023')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      // Note: Date constructor interprets this as MM/DD/YYYY format
    })

    test('should return null for invalid dates', () => {
      expect(parser.parseDate(null)).toBeNull()
      expect(parser.parseDate('')).toBeNull()
      expect(parser.parseDate('invalid')).toBeNull()
    })
  })

  describe('parseAmount', () => {
    test('should parse Turkish formatted numbers', () => {
      expect(parser.parseAmount('1.234,56')).toBe(1234.56)
      expect(parser.parseAmount('1,234.56')).toBe(1234.56) // US format handled correctly now
    })

    test('should handle currency symbols', () => {
      expect(parser.parseAmount('₺1.234,56')).toBe(1234.56)
      expect(parser.parseAmount('1.234,56 TL')).toBe(1234.56)
      expect(parser.parseAmount('TL 1.234,56')).toBe(1234.56)
    })

    test('should handle negative amounts', () => {
      expect(parser.parseAmount('-1.234,56')).toBe(-1234.56)
      expect(parser.parseAmount('(1.234,56)')).toBe(-1234.56) // Parentheses now handled
    })

    test('should return 0 for invalid amounts', () => {
      expect(parser.parseAmount(null)).toBe(0)
      expect(parser.parseAmount('')).toBe(0)
      expect(parser.parseAmount('invalid')).toBe(0)
    })
  })

  describe('generateRowId', () => {
    test('should generate consistent hash for same row', () => {
      const row = ['2023-01-01', 'Test transaction', '100,00']
      const id1 = parser.generateRowId(row)
      const id2 = parser.generateRowId(row)
      expect(id1).toBe(id2)
    })

    test('should generate different hashes for different rows', () => {
      const row1 = ['2023-01-01', 'Test transaction 1', '100,00']
      const row2 = ['2023-01-01', 'Test transaction 2', '100,00']
      const id1 = parser.generateRowId(row1)
      const id2 = parser.generateRowId(row2)
      expect(id1).not.toBe(id2)
    })
  })

  describe('isValidTransactionRow', () => {
    test('should return true for valid rows', () => {
      expect(parser.isValidTransactionRow(['2023-01-01', 'Test', '100'])).toBe(true)
      expect(parser.isValidTransactionRow(['', 'Test', '100'])).toBe(true)
    })

    test('should return false for invalid rows', () => {
      expect(parser.isValidTransactionRow(null)).toBe(false)
      expect(parser.isValidTransactionRow([])).toBe(false)
      expect(parser.isValidTransactionRow([null, null, null])).toBe(false)
      expect(parser.isValidTransactionRow(['', '', ''])).toBe(false)
    })
  })

  describe('findHeaderRow', () => {
    test('should find header row with Turkish keywords', () => {
      const data = [
        ['Başlık', 'Bilgi'],
        ['Tarih', 'Açıklama', 'Tutar'],
        ['01/01/2023', 'İşlem', '100,00']
      ]
      expect(parser.findHeaderRow(data)).toBe(1)
    })

    test('should find header row with English keywords', () => {
      const data = [
        ['Header', 'Info'],
        ['Date', 'Description', 'Amount'],
        ['01/01/2023', 'Transaction', '100.00']
      ]
      expect(parser.findHeaderRow(data)).toBe(1)
    })

    test('should return -1 when no header found', () => {
      const data = [
        ['Col1', 'Col2', 'Col3'],
        ['Data1', 'Data2', 'Data3']
      ]
      expect(parser.findHeaderRow(data)).toBe(-1)
    })
  })

  describe('createBaseTransaction', () => {
    test('should create transaction with required fields', () => {
      const row = ['2023-01-01', 'Test transaction', '100,00']
      const transaction = parser.createBaseTransaction(row)
      
      expect(transaction).toHaveProperty('id')
      expect(transaction).toHaveProperty('date', null)
      expect(transaction).toHaveProperty('description', '')
      expect(transaction).toHaveProperty('amount', 0)
      expect(transaction).toHaveProperty('balance', 0)
      expect(transaction).toHaveProperty('type', 'unknown')
      expect(transaction).toHaveProperty('rawData', row)
      expect(typeof transaction.id).toBe('string')
    })
  })

  describe('abstract methods', () => {
    test('parse method should throw error when not implemented', () => {
      expect(() => parser.parse({})).toThrow('parse() method must be implemented by subclasses')
    })
  })
})