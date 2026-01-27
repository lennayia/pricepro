import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
} from '@mui/material';
import {
  AccessTime as TrackerIcon,
  Calculate as CalculatorIcon,
  History as HistoryIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const dashboardItems = [
  {
    title: 'Tracker času',
    description: 'Sledujte svůj čas po dobu 7 dní a zjistěte, kam vám uniká.',
    icon: <TrackerIcon sx={{ fontSize: 48 }} />,
    path: '/app/tracker',
    color: '#6366F1',
  },
  {
    title: 'Cenová kalkulačka',
    description: 'Vypočítejte si svou minimální, doporučenou a prémiovou hodinovku.',
    icon: <CalculatorIcon sx={{ fontSize: 48 }} />,
    path: '/app/kalkulacka',
    color: '#EC4899',
  },
  {
    title: 'Historie',
    description: 'Podívejte se na své předchozí výpočty a sledujte svůj pokrok.',
    icon: <HistoryIcon sx={{ fontSize: 48 }} />,
    path: '/app/historie',
    color: '#10B981',
  },
];

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">
          Ahoj!
        </Typography>
        <Typography color="text.secondary">
          Vítejte v PricePro. Vyberte si, co chcete dnes udělat.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {dashboardItems.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={item.path}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: item.color,
                      fontWeight: 500,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, mr: 0.5 }}>
                      Pokračovat
                    </Typography>
                    <ArrowIcon fontSize="small" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Tip pro začátek
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>
            Doporučujeme začít s <strong>Trackerem času</strong>. Po 7 dnech
            sledování budete přesně vědět, kolik času vám zabírají různé činnosti.
            Tyto údaje pak můžete použít v kalkulačce pro přesnější výpočet
            hodinovky.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
