import { describe, test, expect, beforeEach } from 'vitest'
import * as XLSX from 'xlsx'
import { EnparaParser } from '../../parsers/banks/EnparaParser'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('EnparaParser', () => {
  let parser

  beforeEach(() => {
    parser = new EnparaParser()
  })

  describe('constructor', () => {
    test('should initialize with correct bank type', () => {
      expect(parser.bankType).toBe('enpara')
    })
  })

  describe('static methods', () => {
    test('canParse should detect Enpara files', () => {
      expect(EnparaParser.canParse('enpara_ekstre.xls')).toBe(true)
      expect(EnparaParser.canParse('enpara.com_hesap.xlsx')).toBe(true)
      expect(EnparaParser.canParse('QNB_statement.xls')).toBe(true)
      expect(EnparaParser.canParse('enparacom_movements.xlsx')).toBe(true)
      expect(EnparaParser.canParse('other_bank.xlsx')).toBe(false)
    })

    test('getDisplayName should return correct name', () => {
      expect(EnparaParser.getDisplayName()).toBe('Enpara.com')
    })
  })

  describe('IBAN extraction', () => {
    test('should extract IBAN from document header with spaces', () => {
      const mockData = [
        [null, null, "Enpara.comVadesiz TL Hesap Hareketleri"],
        [null, "Hesap adı", null, null, null, null, null, null, ""],
        [null, "Hesap tipi", null, null, null, null, null, null, "Vadesiz TL"],
        [null, "IBAN", null, null, null, null, null, null, "TR71 0011 1000 0000 0083 9266 37"],
        [null, "Tarih", null, null, null, null, "Hareket tipi", null, null, "Açıklama", null, null, "İşlem Tutarı (TL)", null, "Bakiye (TL)"],
        [null, null, null, "19.08.2025", null, null, "Gelen Transfer", null, null, "Test Transaction", null, null, 1000, null, 5000]
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.iban).toBe('TR710011100000000083926637')
      expect(result.transactions[0].iban).toBe('TR710011100000000083926637')
    })

    test('should extract IBAN without spaces', () => {
      const mockData = [
        [null, null, "Enpara.comVadesiz TL Hesap Hareketleri"],
        [null, "IBAN", null, null, null, null, null, null, "TR710011100000000083926637"],
        [null, "Tarih", null, null, null, null, "Hareket tipi", null, null, "Açıklama", null, null, "İşlem Tutarı (TL)", null, "Bakiye (TL)"],
        [null, null, null, "19.08.2025", null, null, "Gelen Transfer", null, null, "Test Transaction", null, null, 1000, null, 5000]
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.iban).toBe('TR710011100000000083926637')
    })

    test('should return error when IBAN is missing', () => {
      const mockData = [
        [null, null, "Enpara.comVadesiz TL Hesap Hareketleri"],
        [null, "Hesap tipi", null, null, null, null, null, null, "Vadesiz TL"],
        [null, "Tarih", null, null, null, null, "Hareket tipi", null, null, "Açıklama", null, null, "İşlem Tutarı (TL)", null, "Bakiye (TL)"],
        [null, null, null, "19.08.2025", null, null, "Gelen Transfer", null, null, "Test Transaction", null, null, 1000, null, 5000]
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.iban).toBe('UNKNOWN')
      expect(result.errors).toContain('Unable to extract IBAN from Enpara bank statement. IBAN is required for processing.')
      expect(result.transactions).toHaveLength(0)
    })
  })

  describe('date parsing', () => {
    test('should parse DD.MM.YYYY format', () => {
      const date = parser.parseEnparaDate('19.08.2025')
      expect(date).toBeInstanceOf(Date)
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(7) // August is month 7 (0-indexed)
      expect(date.getDate()).toBe(19)
    })

    test('should parse YYYYMMDD format', () => {
      const date = parser.parseEnparaDate('20250819')
      expect(date).toBeInstanceOf(Date)
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(7) // August is month 7 (0-indexed)
      expect(date.getDate()).toBe(19)
    })

    test('should return null for invalid dates', () => {
      expect(parser.parseEnparaDate(null)).toBeNull()
      expect(parser.parseEnparaDate('')).toBeNull()
      expect(parser.parseEnparaDate('invalid')).toBeNull()
    })
  })

  describe('parse with mock data', () => {
    test('should parse mock Enpara data correctly', () => {
      const mockData = [
        [null, null, "Enpara.comVadesiz TL Hesap Hareketleri"],
        [null, "Hesap adı", null, null, null, null, null, null, ""],
        [null, "Hesap tipi", null, null, null, null, null, null, "Vadesiz TL"],
        [null, "IBAN", null, null, null, null, null, null, "TR71 0011 1000 0000 0083 9266 37"],
        [null, "Başlangıç tarihi", null, null, null, null, null, null, "20250501"],
        [null, "Bitiş tarihi", null, null, null, null, null, null, "20250819"],
        [null, "Hareket tipi", null, null, null, null, null, null, "Tümü"],
        [null, "İşlem tutarı"],
        [null, "Açıklamada aranan kelime"],
        [null, "Tarih", null, null, null, null, "Hareket tipi", null, null, "Açıklama", null, null, "İşlem Tutarı (TL)", null, "Bakiye (TL)"],
        [null, null, null, "19.08.2025", null, null, "Gelen Transfer", null, null, "BARBAROS GÖREN, BARBAROS GÖREN tarafından aktarılan", null, null, 5025, null, 31414.95],
        [null, null, null, "18.08.2025", null, null, "Giden Transfer", null, null, "Barbaros Gören, Bireysel Ödeme, EFT (FAST) sorgu no: 1048670453", null, null, -2, null, 26483.15],
        [null, null, null, "18.08.2025", null, null, "Encard Harcaması", null, null, "797967000286285-aliexpress London GB, 1067.98 TRY", null, null, -1067.98, null, 29346.97],
        [null, null, null, "17.08.2025", null, null, "ATM Para Çekme", null, null, "QNB ATM KARTAL", null, null, -500, null, 27500.00]
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Enpara.com hesap hareketleriniz'], Sheets: { 'Enpara.com hesap hareketleriniz': worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.bankType).toBe('enpara')
      expect(result.iban).toBe('TR710011100000000083926637')
      expect(result.transactions).toHaveLength(4)
      
      const transactions = result.transactions
      
      // Incoming transfer
      expect(transactions[0].description).toBe('Gelen Transfer: BARBAROS GÖREN, BARBAROS GÖREN tarafından aktarılan')
      expect(transactions[0].amount).toBe(5025)
      expect(transactions[0].type).toBe('income')
      expect(transactions[0].balance).toBe(31414.95)
      expect(transactions[0].date.getDate()).toBe(19)
      expect(transactions[0].date.getMonth()).toBe(7) // August
      expect(transactions[0].iban).toBe('TR710011100000000083926637')
      
      // Outgoing transfer
      expect(transactions[1].description).toBe('Giden Transfer: Barbaros Gören, Bireysel Ödeme, EFT (FAST) sorgu no: 1048670453')
      expect(transactions[1].amount).toBe(-2)
      expect(transactions[1].type).toBe('expense')
      expect(transactions[1].balance).toBe(26483.15)
      
      // Card expense
      expect(transactions[2].description).toBe('Encard Harcaması: 797967000286285-aliexpress London GB, 1067.98 TRY')
      expect(transactions[2].amount).toBe(-1067.98)
      expect(transactions[2].type).toBe('expense')
      expect(transactions[2].balance).toBe(29346.97)
      
      // ATM withdrawal
      expect(transactions[3].description).toBe('ATM Para Çekme: QNB ATM KARTAL')
      expect(transactions[3].amount).toBe(-500)
      expect(transactions[3].type).toBe('expense')
      expect(transactions[3].balance).toBe(27500)
    })

    test('should handle file with no header row', () => {
      const mockData = [
        ['Random Data', 'No Headers'],
        ['More Data', 'Still No Headers']
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      expect(result.errors).toContain('Unable to extract IBAN from Enpara bank statement. IBAN is required for processing.')
      expect(result.transactions).toHaveLength(0)
    })

    test('should handle empty file', () => {
      const mockData = []
      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      expect(result.errors).toContain('Unable to extract IBAN from Enpara bank statement. IBAN is required for processing.')
      expect(result.transactions).toHaveLength(0)
    })

    test('should filter out invalid transaction rows', () => {
      const mockData = [
        [null, "IBAN", null, null, null, null, null, null, "TR710011100000000083926637"],
        [null, "Tarih", null, null, null, null, "Hareket tipi", null, null, "Açıklama", null, null, "İşlem Tutarı (TL)", null, "Bakiye (TL)"],
        [null, null, null, "19.08.2025", null, null, "Gelen Transfer", null, null, "Valid Transaction", null, null, 1000, null, 5000],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], // Empty row
        [null, null, null, "20.08.2025", null, null, "Another Transfer", null, null, "Another Valid", null, null, 2000, null, 7000]
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(mockData)
      const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } }
      
      const result = parser.parse(workbook)
      
      expect(result.transactions).toHaveLength(2) // Only valid transactions
      expect(result.transactions[0].description).toBe('Gelen Transfer: Valid Transaction')
      expect(result.transactions[1].description).toBe('Another Transfer: Another Valid')
    })
  })

  describe('parse with real XLS file', () => {
    test('should parse actual Enpara XLS file', () => {
      const xlsPath = join(__dirname, '../bank_statements/enpara/1.xls')
      
      let fileBuffer
      try {
        fileBuffer = readFileSync(xlsPath)
      } catch (error) {
        console.warn('Test XLS file not found, skipping real file test')
        return
      }
      
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const result = parser.parse(workbook)
      
      expect(result).toHaveProperty('bankType', 'enpara')
      expect(result).toHaveProperty('transactions')
      expect(result).toHaveProperty('iban')
      
      expect(Array.isArray(result.transactions)).toBe(true)
      
      // Should have found an IBAN
      expect(result.iban).toMatch(/^TR\d{24}$/)
      
      if (result.transactions.length > 0) {
        const transaction = result.transactions[0]
        
        expect(transaction).toHaveProperty('id')
        expect(transaction).toHaveProperty('date')
        expect(transaction).toHaveProperty('description')
        expect(transaction).toHaveProperty('amount')
        expect(transaction).toHaveProperty('type')
        expect(transaction).toHaveProperty('rawData')
        expect(transaction).toHaveProperty('iban')
        
        expect(typeof transaction.id).toBe('string')
        expect(transaction.date).toBeInstanceOf(Date)
        expect(typeof transaction.description).toBe('string')
        expect(typeof transaction.amount).toBe('number')
        expect(['income', 'expense', 'unknown']).toContain(transaction.type)
        expect(Array.isArray(transaction.rawData)).toBe(true)
        expect(transaction.iban).toMatch(/^TR\d{24}$/)
        
        console.log(`Parsed ${result.transactions.length} transactions from real XLS file`)
        console.log('Sample transaction:', {
          date: transaction.date && !isNaN(transaction.date.getTime()) ? transaction.date.toISOString().split('T')[0] : 'Invalid Date',
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          iban: transaction.iban
        })
      }
    })
  })
})