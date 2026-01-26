import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
} from '@mui/material';
import {
  History as HistoryIcon,
  Calculate as CalculatorIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
  // TODO: Load history from Supabase
  const historyItems = [];

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Historie výpočtů</Typography>
        <Typography color="text.secondary">
          Zde najdeš přehled svých předchozích výpočtů hodinovky.
        </Typography>
      </Stack>

      {historyItems.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              py: 8,
              textAlign: 'center',
            }}
          >
            <HistoryIcon
              sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Zatím nemáš žádné výpočty
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Až si spočítáš svou hodinovku, najdeš zde historii svých výpočtů.
            </Typography>
            <Button
              component={Link}
              to="/pricepro/app/kalkulacka"
              variant="contained"
              startIcon={<CalculatorIcon />}
            >
              Spočítat hodinovku
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {historyItems.map((item, index) => (
            <Card key={index}>
              <CardContent>
                {/* TODO: Render history items */}
                <Typography>Historie položka {index + 1}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default HistoryPage;
