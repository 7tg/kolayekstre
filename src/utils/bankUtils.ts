/**
 * Utility functions for bank-related operations
 */

export interface BankInfo {
  type: string;
  displayName: string;
  shortName: string;
}

export const SUPPORTED_BANKS: BankInfo[] = [
  {
    type: 'ziraat',
    displayName: 'Ziraat Bankası',
    shortName: 'Ziraat'
  },
  {
    type: 'enpara',
    displayName: 'Enpara.com',
    shortName: 'Enpara'
  }
];

/**
 * Get display name for a bank type
 * @param bankType The internal bank type identifier
 * @returns The user-friendly display name
 */
export function getBankDisplayName(bankType: string): string {
  const bank = SUPPORTED_BANKS.find(b => b.type === bankType);
  return bank?.displayName || bankType;
}

/**
 * Get short name for a bank type (for limited space displays)
 * @param bankType The internal bank type identifier
 * @returns The short display name
 */
export function getBankShortName(bankType: string): string {
  const bank = SUPPORTED_BANKS.find(b => b.type === bankType);
  return bank?.shortName || bankType;
}

/**
 * Get bank info for a bank type
 * @param bankType The internal bank type identifier
 * @returns The bank info object or undefined
 */
export function getBankInfo(bankType: string): BankInfo | undefined {
  return SUPPORTED_BANKS.find(b => b.type === bankType);
}

/**
 * Get all supported bank types
 * @returns Array of supported bank types
 */
export function getSupportedBankTypes(): string[] {
  return SUPPORTED_BANKS.map(b => b.type);
}

/**
 * Check if a bank type is supported
 * @param bankType The bank type to check
 * @returns True if the bank type is supported
 */
export function isSupportedBankType(bankType: string): boolean {
  return SUPPORTED_BANKS.some(b => b.type === bankType);
}