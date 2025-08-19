import { Container, Paper, Box } from '@mui/material';
import StatsPanel from '../components/StatsPanel';
import { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

export default function Dashboard({ transactions }: DashboardProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          <StatsPanel transactions={transactions} />
        </Box>
      </Paper>
    </Container>
  );
}