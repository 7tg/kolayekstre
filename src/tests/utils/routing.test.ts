import { describe, it, expect, vi } from 'vitest';
import { getLocalizedPath, getRouteKeyFromPath, getAllLocalizedPaths, navigateToRoute } from '../../utils/routing';

// Mock i18next TFunction
const createMockT = (language: 'en' | 'tr') => {
  const translations = {
    en: {
      'routes.upload': 'upload',
      'routes.dashboard': 'dashboard',
      'routes.chart': 'chart',
      'routes.transactions': 'transactions'
    },
    tr: {
      'routes.upload': 'yukle',
      'routes.dashboard': 'panel',
      'routes.chart': 'grafik',
      'routes.transactions': 'islemler'
    }
  };

  return (key: string) => translations[language][key as keyof typeof translations['en']] || key;
};

describe('Routing Utilities', () => {
  describe('getLocalizedPath', () => {
    it('should return localized path for English', () => {
      const t = createMockT('en');
      expect(getLocalizedPath('upload', t)).toBe('/upload');
      expect(getLocalizedPath('dashboard', t)).toBe('/dashboard');
      expect(getLocalizedPath('chart', t)).toBe('/chart');
      expect(getLocalizedPath('transactions', t)).toBe('/transactions');
    });

    it('should return localized path for Turkish', () => {
      const t = createMockT('tr');
      expect(getLocalizedPath('upload', t)).toBe('/yukle');
      expect(getLocalizedPath('dashboard', t)).toBe('/panel');
      expect(getLocalizedPath('chart', t)).toBe('/grafik');
      expect(getLocalizedPath('transactions', t)).toBe('/islemler');
    });

    it('should return fallback path for unknown route', () => {
      const t = createMockT('en');
      expect(getLocalizedPath('unknown', t)).toBe('/unknown');
    });
  });

  describe('getRouteKeyFromPath', () => {
    it('should return route key from English path', () => {
      const t = createMockT('en');
      expect(getRouteKeyFromPath('/upload', t)).toBe('upload');
      expect(getRouteKeyFromPath('/dashboard', t)).toBe('dashboard');
      expect(getRouteKeyFromPath('/chart', t)).toBe('chart');
      expect(getRouteKeyFromPath('/transactions', t)).toBe('transactions');
    });

    it('should return route key from Turkish path', () => {
      const t = createMockT('tr');
      expect(getRouteKeyFromPath('/yukle', t)).toBe('upload');
      expect(getRouteKeyFromPath('/panel', t)).toBe('dashboard');
      expect(getRouteKeyFromPath('/grafik', t)).toBe('chart');
      expect(getRouteKeyFromPath('/islemler', t)).toBe('transactions');
    });

    it('should return dashboard for root path', () => {
      const t = createMockT('en');
      expect(getRouteKeyFromPath('/', t)).toBe('dashboard');
      expect(getRouteKeyFromPath('', t)).toBe('dashboard');
    });

    it('should return upload for unknown path', () => {
      const t = createMockT('en');
      expect(getRouteKeyFromPath('/unknown', t)).toBe('upload');
    });
  });

  describe('getAllLocalizedPaths', () => {
    it('should return all localized paths for English', () => {
      const t = createMockT('en');
      const paths = getAllLocalizedPaths(t);
      expect(paths).toEqual({
        upload: '/upload',
        dashboard: '/dashboard',
        chart: '/chart',
        transactions: '/transactions'
      });
    });

    it('should return all localized paths for Turkish', () => {
      const t = createMockT('tr');
      const paths = getAllLocalizedPaths(t);
      expect(paths).toEqual({
        upload: '/yukle',
        dashboard: '/panel',
        chart: '/grafik',
        transactions: '/islemler'
      });
    });
  });

  describe('navigateToRoute', () => {
    it('should navigate to correct localized path', () => {
      const t = createMockT('en');
      const mockNavigate = vi.fn();
      
      navigateToRoute('dashboard', t, mockNavigate);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to Turkish localized path', () => {
      const t = createMockT('tr');
      const mockNavigate = vi.fn();
      
      navigateToRoute('dashboard', t, mockNavigate);
      expect(mockNavigate).toHaveBeenCalledWith('/panel');
    });
  });
});