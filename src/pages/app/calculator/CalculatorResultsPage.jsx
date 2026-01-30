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
            // Calculation B fields
            dignityMinimumHourly: latest.dignity_minimum_hourly,
            dignityRecommendedHourly: latest.dignity_recommended_hourly,
            dignityPremiumHourly: latest.dignity_premium_hourly,
            dignityMonthlyEarnings: latest.dignity_monthly_earnings,
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

  const {
    minimumHourly,
    recommendedHourly,
    premiumHourly,
    minimumMonthly,
    monthlyBillableHours,
    // Calculation B fields
    dignityMinimumHourly,
    dignityRecommendedHourly,
    dignityPremiumHourly,
    dignityMonthlyEarnings,
  } = data;

  const formatCurrency = (value) =>
    value?.toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) || '0';

  // Check if we have Calculation B data
  const hasCalculationB = dignityRecommendedHourly && dignityRecommendedHourly > 0;

  // Calculate difference between the two calculations
  const getDifference = () => {
    if (!hasCalculationB) return null;
    const diff = dignityRecommendedHourly - recommendedHourly;
    const percentDiff = (diff / recommendedHourly) * 100;
    return { diff, percentDiff };
  };

  const difference = getDifference();

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
          {hasCalculationB
            ? 'Porovnání dvou přístupů k cenotvorbě – od nákladů a od důstojné mzdy.'
            : 'Na základě vašich údajů jsme vypočítali tři cenové hladiny.'}
        </Typography>
      </Stack>

      {/* Comparison Info Card */}
      {hasCalculationB && difference && (
        <Card
          sx={{
            bgcolor: Math.abs(difference.percentDiff) < 20
              ? INFO_CARD_STYLES[theme.palette.mode].bgcolor
              : 'warning.lighter',
            border: INFO_CARD_STYLES[theme.palette.mode].border,
            mb: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Lightbulb size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
              <Box>
                <Typography fontWeight={600} sx={{ mb: 1 }}>
                  {Math.abs(difference.percentDiff) < 20
                    ? '✓ Výpočty se shodují – vaše cena je validní!'
                    : '⚠️ Velký rozdíl mezi výpočty'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.abs(difference.percentDiff) < 20
                    ? `Oba přístupy k cenotvorbě vedou k podobnému výsledku (rozdíl ${Math.abs(difference.percentDiff).toFixed(1)}%). To znamená, že vaše cena je správně nastavená a odpovídá jak vašim nákladům, tak důstojné hodnotě vaší práce.`
                    : difference.diff > 0
                    ? `Výpočet z důstojné mzdy je o ${Math.abs(difference.percentDiff).toFixed(0)}% vyšší. Váš celkový pracovní čas (včetně nefakturovatelné práce) si zaslouží vyšší ohodnocení. Zvažte navýšení ceny.`
                    : `Výpočet z nákladů je o ${Math.abs(difference.percentDiff).toFixed(0)}% vyšší. Vaše náklady jsou vysoké vzhledem k počtu odpracovaných hodin. Zvažte optimalizaci nákladů nebo navýšení fakturovatelných hodin.`}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Price Cards - Two Column Comparison */}
      {hasCalculationB ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Column 1: Calculation A (From Costs) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <CardContent>
                <Typography variant="h6" color="primary" sx={{ mb: 2, textAlign: 'center' }}>
                  Výpočet A: Od nákladů
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Co MUSÍTE vydělat pro pokrytí nákladů
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Minimum */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <AlertTriangle size={32} color={COLORS.error.main} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Minimální cena
                  </Typography>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(minimumHourly)} Kč
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pod tuhle NIKDY nejděte
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Recommended */}
                <Box sx={{ mb: 3, textAlign: 'center', bgcolor: 'success.lighter', borderRadius: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <CheckCircle size={40} color={COLORS.success.main} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Doporučená cena
                  </Typography>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(recommendedHourly)} Kč
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vaše ideální hodinovka
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Premium */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Star size={32} color={COLORS.warning.main} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Prémiová cena
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(premiumHourly)} Kč
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Až budete mít čekačku
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  💡 Tento výpočet vychází z vašich nákladů na život a podnikání, fakturovatelných hodin a tržních koeficientů.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Column 2: Calculation B (From Dignity Wage) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'secondary.main',
              }}
            >
              <CardContent>
                <Typography variant="h6" color="secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Výpočet B: Od důstojné mzdy
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Co si ZASLOUŽÍTE za všechen čas
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Minimum */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <AlertTriangle size={32} color={COLORS.error.main} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Minimální cena
                  </Typography>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(dignityMinimumHourly)} Kč
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pro pokrytí důstojné mzdy
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Recommended */}
                <Box sx={{ mb: 3, textAlign: 'center', bgcolor: 'secondary.lighter', borderRadius: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <CheckCircle size={40} color={theme.palette.secondary.main} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Doporučená cena
                  </Typography>
                  <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(dignityRecommendedHourly)} Kč
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    S tržními koeficienty
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Premium */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Star size={32} color={COLORS.warning.main} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Prémiová cena
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(dignityPremiumHourly)} Kč
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Až budete mít čekačku
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  💡 Tento výpočet vychází z důstojné hodinové mzdy, celkového času stráveného prací (včetně nefakturovatelné) a fakturovatelných hodin.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* Original three-card layout for backwards compatibility */
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
      )}

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
