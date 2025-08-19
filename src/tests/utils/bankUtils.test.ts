import { describe, test, expect } from 'vitest';
import {
  getBankDisplayName,
  getBankShortName,
  getBankInfo,
  getSupportedBankTypes,
  isSupportedBankType,
  SUPPORTED_BANKS
} from '../../utils/bankUtils';

describe('bankUtils', () => {
  describe('getBankDisplayName', () => {
    test('should return correct display name for supported banks', () => {
      expect(getBankDisplayName('ziraat')).toBe('Ziraat Bankası');
      expect(getBankDisplayName('enpara')).toBe('Enpara.com');
    });

    test('should return original value for unsupported banks', () => {
      expect(getBankDisplayName('unknown')).toBe('unknown');
      expect(getBankDisplayName('test')).toBe('test');
    });
  });

  describe('getBankShortName', () => {
    test('should return correct short name for supported banks', () => {
      expect(getBankShortName('ziraat')).toBe('Ziraat');
      expect(getBankShortName('enpara')).toBe('Enpara');
    });

    test('should return original value for unsupported banks', () => {
      expect(getBankShortName('unknown')).toBe('unknown');
      expect(getBankShortName('test')).toBe('test');
    });
  });

  describe('getBankInfo', () => {
    test('should return bank info for supported banks', () => {
      const ziraatInfo = getBankInfo('ziraat');
      expect(ziraatInfo).toEqual({
        type: 'ziraat',
        displayName: 'Ziraat Bankası',
        shortName: 'Ziraat'
      });

      const enparaInfo = getBankInfo('enpara');
      expect(enparaInfo).toEqual({
        type: 'enpara',
        displayName: 'Enpara.com',
        shortName: 'Enpara'
      });
    });

    test('should return undefined for unsupported banks', () => {
      expect(getBankInfo('unknown')).toBeUndefined();
      expect(getBankInfo('test')).toBeUndefined();
    });
  });

  describe('getSupportedBankTypes', () => {
    test('should return all supported bank types', () => {
      const supportedTypes = getSupportedBankTypes();
      expect(supportedTypes).toEqual(['ziraat', 'enpara']);
      expect(supportedTypes).toHaveLength(2);
    });
  });

  describe('isSupportedBankType', () => {
    test('should return true for supported banks', () => {
      expect(isSupportedBankType('ziraat')).toBe(true);
      expect(isSupportedBankType('enpara')).toBe(true);
    });

    test('should return false for unsupported banks', () => {
      expect(isSupportedBankType('unknown')).toBe(false);
      expect(isSupportedBankType('test')).toBe(false);
      expect(isSupportedBankType('')).toBe(false);
    });
  });

  describe('SUPPORTED_BANKS', () => {
    test('should contain expected banks', () => {
      expect(SUPPORTED_BANKS).toHaveLength(2);
      
      const bankTypes = SUPPORTED_BANKS.map(b => b.type);
      expect(bankTypes).toContain('ziraat');
      expect(bankTypes).toContain('enpara');
      
      // Verify each bank has required properties
      SUPPORTED_BANKS.forEach(bank => {
        expect(bank).toHaveProperty('type');
        expect(bank).toHaveProperty('displayName');
        expect(bank).toHaveProperty('shortName');
        expect(typeof bank.type).toBe('string');
        expect(typeof bank.displayName).toBe('string');
        expect(typeof bank.shortName).toBe('string');
        expect(bank.type.length).toBeGreaterThan(0);
        expect(bank.displayName.length).toBeGreaterThan(0);
        expect(bank.shortName.length).toBeGreaterThan(0);
      });
    });
  });
});