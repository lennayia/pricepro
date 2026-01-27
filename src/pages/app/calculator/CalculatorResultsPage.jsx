import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';

const CalculatorResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Žádná data k zobrazení
        </Typography>
        <Button
          component={Link}
          to="/app/kalkulacka"
          variant="contained"
        >
          Přejít na kalkulačku
        </Button>
      </Box>
    );
  }

  const { minimumHourly, recommendedHourly, premiumHourly, minimumMonthly, monthlyBillableHours } = data;

  const formatCurrency = (value) =>
    value.toLocaleString('cs-CZ', { maximumFractionDigits: 0 });

  const arguments_for_higher_price = [
    'Váš čas je omezený - nemůžete pracovat víc hodin',
    'Podceňování vede k vyhoření a frustraci',
    'Klienti, kteří platí více, si vás více váží',
    'Vyšší cena = méně klientů, ale lepší zakázky',
    'Můžete si dovolit investovat do sebe a svého byznysu',
  ];

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/app/kalkulacka')}
        sx={{ mb: 2 }}
      >
        Upravit zadání
      </Button>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Vaše hodinovka</Typography>
        <Typography color="text.secondary">
          Na základě vašich údajů jsme vypočítali tři cenové hladiny.
        </Typography>
      </Stack>

      {/* Price Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'error.main',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <WarningIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="error.main" sx={{ mb: 1 }}>
                Minimální cena
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}
              >
                {formatCurrency(minimumHourly)} Kč
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pod tuhle NIKDY nejděte
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Tato cena vám pokryje pouze základní náklady. Nic vám nezbude na rozvoj ani nečekané výdaje.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'success.main',
              transform: { md: 'scale(1.05)' },
              zIndex: 1,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Doporučená cena
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}
              >
                {formatCurrency(recommendedHourly)} Kč
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vaše ideální hodinovka
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Tato cena odráží vaši reálnou hodnotu na trhu včetně zkušeností a poptávky.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'warning.main',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <StarIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>
                Prémiová cena
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}
              >
                {formatCurrency(premiumHourly)} Kč
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Až budete mít čekačku
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Tuto cenu si můžete říct, když máte plno a klienti na vás čekají.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Shrnutí výpočtu
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Minimální měsíční příjem
              </Typography>
              <Typography variant="h6">
                {formatCurrency(minimumMonthly)} Kč
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Fakturovatelné hodiny měsíčně
              </Typography>
              <Typography variant="h6">{monthlyBillableHours} hodin</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Arguments */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Proč si říct vyšší cenu?
          </Typography>
          <List>
            {arguments_for_higher_price.map((arg, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={arg} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          mb: 4,
        }}
      >
        <CardContent sx={{ py: 4, textAlign: 'center' }}>
          <TipIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Víte, že spoustu toho času můžete ušetřit?
          </Typography>
          <Typography sx={{ mb: 3, opacity: 0.9 }}>
            Automatické odpovědi, fakturace, plánování obsahu... To všechno si můžete vytvořit sami – bez programování.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="https://vibecodingpro.cz/mentoring"
            target="_blank"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Zjistit víc o Vibecoding mentoringu
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/app/kalkulacka')}
        >
          Upravit zadání
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/app')}
        >
          Zpět na dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default CalculatorResultsPage;
