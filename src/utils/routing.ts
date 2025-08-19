import { TFunction } from 'i18next';

export interface RouteConfig {
  key: string;
  path: string;
  translationKey: string;
}

export const routes: RouteConfig[] = [
  { key: 'upload', path: 'upload', translationKey: 'routes.upload' },
  { key: 'dashboard', path: 'dashboard', translationKey: 'routes.dashboard' },
  { key: 'chart', path: 'chart', translationKey: 'routes.chart' },
  { key: 'transactions', path: 'transactions', translationKey: 'routes.transactions' },
];

export const getLocalizedPath = (routeKey: string, t: TFunction): string => {
  const route = routes.find(r => r.key === routeKey);
  if (!route) return `/${routeKey}`;
  
  const localizedPath = t(route.translationKey);
  return `/${localizedPath}`;
};

export const getRouteKeyFromPath = (pathname: string, t: TFunction): string => {
  // Remove leading slash
  const path = pathname.replace('/', '');
  
  // Handle root path
  if (path === '') return 'dashboard';
  
  // Find route by localized path
  for (const route of routes) {
    const localizedPath = t(route.translationKey);
    if (path === localizedPath) {
      return route.key;
    }
  }
  
  // Fallback to English paths
  const route = routes.find(r => r.path === path);
  return route?.key || 'upload';
};

export const getAllLocalizedPaths = (t: TFunction): Record<string, string> => {
  const paths: Record<string, string> = {};
  routes.forEach(route => {
    paths[route.key] = getLocalizedPath(route.key, t);
  });
  return paths;
};

export const navigateToRoute = (routeKey: string, t: TFunction, navigate: (path: string) => void) => {
  const path = getLocalizedPath(routeKey, t);
  navigate(path);
};