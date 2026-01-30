import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ArrowLeft, CheckCircle, AlertTriangle, Star, Lightbulb } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { ResponsiveButton } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { getLatestCalculatorResult } from '../../../services/calculatorResults';
import { COLORS, GRADIENTS, INFO_CARD_STYLES } from '../../../constants/colors';
import PassiveIncomeInsight from '../../../components/calculator/PassiveIncomeInsight';

const CalculatorResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState(location.state);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  // Load latest calculation if not passed via state
  useEffect(() => {
    const loadLatestCalculation = async () => {
      if (data || !user) return;

      try {
        setLoading(true);
        const latest = await getLatestCalculatorResult(user.id);

        if (latest) {
          setData({
            minimumHourly: latest.minimum_hourly,
            recommendedHourly: latest.recommended_hourly,
            premiumHourly: latest.premium_hourly,
            minimumMonthly: latest.minimum_monthly,
            monthlyBillableHours: latest.inputs?.monthlyBillableHours || 0,
          });
        } else {
          setError('no_data');
        }
      } catch (err) {
        console.error('Error loading calculation:', err);
        setError('error');
      } finally {
        setLoading(false);
      }
    };

    loadLatestCalculation();
  }, [user, data]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          Načítám...
        </Typography>
      </Box>
    );
  }

  if (!data || error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Žádná data k zobrazení
        </Typography>
        <ResponsiveButton
          component={Link}
          to="/app/kalkulacka"
          variant="contained"
        >
          Přejít na kalkulačku
        </ResponsiveButton>
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
      <ResponsiveButton
        startIcon={<ArrowLeft size={20} />}
        onClick={() => navigate('/app/kalkulacka')}
        sx={{ mb: 2 }}
      >
        Upravit zadání
      </ResponsiveButton>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Vaše hodinovka</Typography>
        <Typography color="text.secondary">
          Na základě vašich údajů jsme vypočítali tři cenové hladiny.
        </Typography>
      </Stack>

      {/* Price Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'error.main',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <AlertTriangle size={48} color={COLORS.error.main} />
              </Box>
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

        <Grid size={{ xs: 12, md: 4 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CheckCircle size={48} color={COLORS.success.main} />
              </Box>
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

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'warning.main',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Star size={48} color={COLORS.warning.main} />
              </Box>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Minimální měsíční příjem
              </Typography>
              <Typography variant="h6">
                {formatCurrency(minimumMonthly)} Kč
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                  <CheckCircle size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                </ListItemIcon>
                <ListItemText primary={arg} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Passive Income Insight */}
      <PassiveIncomeInsight
        minimumMonthly={minimumMonthly}
        recommendedHourly={recommendedHourly}
      />

      {/* CTA */}
      <Card
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(13, 221, 13, 0.15) 0%, rgba(13, 221, 13, 0.05) 100%)'
            : GRADIENTS.primary,
          border: theme.palette.mode === 'dark'
            ? '2px solid rgba(13, 221, 13, 0.3)'
            : 'none',
          color: 'white',
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(13, 221, 13, 0.3)'
              : '0 8px 24px rgba(205, 127, 50, 0.4)',
          },
        }}
      >
        <CardContent sx={{ py: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                p: 2,
                display: 'inline-flex',
              }}
            >
              <Lightbulb size={48} color="rgba(255, 255, 255, 0.95)" />
            </Box>
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Víte, že spoustu toho času můžete ušetřit?
          </Typography>
          <Typography sx={{ mb: 3, opacity: 0.95 }}>
            Automatické odpovědi, fakturace, plánování obsahu... To všechno si můžete vytvořit sami – bez programování.
          </Typography>
          <ResponsiveButton
            variant="contained"
            size="large"
            component="a"
            href="https://vibecodingpro.cz/#pricing-section"
            target="_blank"
            sx={{
              bgcolor: 'white',
              color: theme.palette.mode === 'dark' ? '#0DDD0D' : 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'scale(1.05)',
              },
            }}
          >
            Zjistit víc o Vibecoding mentoringu
          </ResponsiveButton>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <ResponsiveButton
          variant="outlined"
          onClick={() => navigate('/app/kalkulacka')}
        >
          Upravit zadání
        </ResponsiveButton>
        <ResponsiveButton
          variant="contained"
          onClick={() => navigate('/app')}
        >
          Zpět na dashboard
        </ResponsiveButton>
      </Box>
    </Box>
  );
};

export default CalculatorResultsPage;
