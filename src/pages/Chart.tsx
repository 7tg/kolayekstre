import { Container, Paper, Box } from '@mui/material';
import TransactionChart from '../components/TransactionChart';
import { Transaction } from '../types';

interface ChartProps {
  transactions: Transaction[];
}

export default function Chart({ transactions }: ChartProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          <TransactionChart transactions={transactions} />
        </Box>
      </Paper>
    </Container>
  );
}