import { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from '../Navigation/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClearData: () => void;
  hasTransactions: boolean;
}

const DRAWER_WIDTH = 280;

export default function MainLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  onClearData, 
  hasTransactions 
}: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onClearData={onClearData}
        hasTransactions={hasTransactions}
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          pl: isMobile ? 0 : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}