import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Stack,
  InputAdornment,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { ArrowLeft, ArrowRight, Calculator, TrendingUp, TrendingDown, Home, Clock, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../contexts/AuthContext';
import { saveCalculatorResult, getCalculatorResults } from '../../../services/calculatorResults';
import { getTimeEntries } from '../../../services/timeEntries';
import { getBillableCategoryKeys } from '../../../services/categorySettings';
import { getWeekDates } from '../../../utils/dateHelpers';
import { calculateWeeklyBillableHours } from '../../../utils/billableHoursCalculator';
import { WORK_CATEGORY_KEYS } from '../../../constants/categories';
import { ResponsiveButton } from '../../../components/ui';
import { COLORS, INFO_CARD_STYLES, CARD_ICON_STYLES, WARNING_CARD_STYLES } from '../../../constants/colors';

const steps = [
  { label: 'Životní náklady', description: 'Kolik MUSÍTE vydělat?', icon: Home },
  { label: 'Reálný čas', description: 'Kolik hodin OPRAVDU fakturujete?', icon: Clock },
  { label: 'Tržní hodnota', description: 'Kolik DOOPRAVDY stojíte?', icon: BarChart3 },
];

const experienceOptions = [
  { value: '0-2', label: '0-2 roky', coefficient: 1.0 },
  { value: '3-5', label: '3-5 let', coefficient: 1.2 },
  { value: '6-10', label: '6-10 let', coefficient: 1.35 },
  { value: '10+', label: '10+ let', coefficient: 1.5 },
];

const specializationOptions = [
  { value: 'generalist', label: 'Generalista/Generalistka (širší záběr)', coefficient: 1.0 },
  { value: 'specialist', label: 'Specialista/Specialistka (úzké zaměření)', coefficient: 1.3 },
];

const portfolioOptions = [
  { value: 'none', label: 'Zatím žádné nebo málo', coefficient: 1.0 },
  { value: 'some', label: 'Mám nějaké reference', coefficient: 1.1 },
  { value: 'strong', label: 'Silné portfolio a výsledky', coefficient: 1.2 },
];

const demandOptions = [
  { value: 'low', label: 'Malá poptávka', coefficient: 1.0 },
  { value: 'medium', label: 'Střední poptávka', coefficient: 1.15 },
  { value: 'high', label: 'Velká poptávka', coefficient: 1.3 },
  { value: 'waiting', label: 'Mám čekačku', coefficient: 1.4 },
];

// 2026 wage constants
const WAGES_2026 = {
  minimal: { monthly: 22400, label: 'Minimální mzda', hourly: 133 }, // 22400 / 168h
  average_cz: { monthly: 48967, label: 'Průměrná mzda ČR', hourly: 291 }, // 48967 / 168h
  average_prague: { monthly: 65000, label: 'Průměrná mzda Praha', hourly: 387 }, // 65000 / 168h
};

const WAGE_FUND_HOURS = 160; // Standard monthly working hours for wage calculation
const OSVC_COEFFICIENT = 1.3; // 30% extra for taxes and contributions

const CalculatorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(location.state?.step || 0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [trackerDataLoaded, setTrackerDataLoaded] = useState(false);
  const [trackerDataError, setTrackerDataError] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

  // Layer 1: Living costs
  const [housingCosts, setHousingCosts] = useState('');
  const [livingCosts, setLivingCosts] = useState('');
  const [businessCosts, setBusinessCosts] = useState('');
  const [savings, setSavings] = useState('');

  // Layer 2: Real time
  const [weeklyHours, setWeeklyHours] = useState('');
  const [billableHours, setBillableHours] = useState('');
  const [weeksToTrack, setWeeksToTrack] = useState(1); // Number of weeks to calculate average from
  const [baseWage, setBaseWage] = useState('average_prague'); // Base wage selection for calculation B
  const [customWage, setCustomWage] = useState(''); // Custom hourly wage if selected

  // Layer 3: Market value
  const [experience, setExperience] = useState('0-2');
  const [specialization, setSpecialization] = useState('generalist');
  const [portfolio, setPortfolio] = useState('none');
  const [demand, setDemand] = useState('low');

  // Load previous calculations on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        const results = await getCalculatorResults(user.id);
        setHistory(results);

        // Pre-fill form with latest calculation
        if (results.length > 0) {
          const latest = results[0];
          if (latest.inputs) {
            setHousingCosts(latest.inputs.housingCosts || '');
            setLivingCosts(latest.inputs.livingCosts || '');
            setBusinessCosts(latest.inputs.businessCosts || '');
            setSavings(latest.inputs.savings || '');
            setWeeklyHours(latest.inputs.weeklyHours || '');
            setBillableHours(latest.inputs.billableHours || '');
            setWeeksToTrack(latest.inputs.weeksToTrack || 1);
            setBaseWage(latest.inputs.baseWage || 'average_prague');
            setCustomWage(latest.inputs.customWage || '');
            setExperience(latest.inputs.experience || '0-2');
            setSpecialization(latest.inputs.specialization || 'generalist');
            setPortfolio(latest.inputs.portfolio || 'none');
            setDemand(latest.inputs.demand || 'low');
          }
        }
      } catch (err) {
        console.error('Error loading calculator data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Load tracker data for Step 2
  useEffect(() => {
    const loadTrackerData = async () => {
      if (!user) return;

      try {
        // Get all entries
        const entries = await getTimeEntries(user.id);

        // Get dates for last N weeks
        let allWeekDates = [];
        for (let weekOffset = 0; weekOffset < weeksToTrack; weekOffset++) {
          const weekDates = getWeekDates(new Date(Date.now() - weekOffset * 7 * 24 * 60 * 60 * 1000));
          allWeekDates = allWeekDates.concat(weekDates);
        }

        const weekEntries = entries.filter(e => allWeekDates.includes(e.date));

        if (weekEntries.length === 0) {
          setTrackerDataError(true);
          return;
        }

        // Get user's billable categories (only 1:1 work, NOT scalable)
        const billableKeys = await getBillableCategoryKeys(user.id);

        // Calculate total billable hours across all weeks
        const totalBillable = calculateWeeklyBillableHours(weekEntries, billableKeys);

        // Calculate total work hours across all weeks
        const totalWork = WORK_CATEGORY_KEYS.reduce((sum, key) => {
          return sum + weekEntries.reduce((daySum, entry) => {
            return daySum + (parseFloat(entry[key]) || 0);
          }, 0);
        }, 0);

        // Calculate averages per week
        const avgBillablePerWeek = totalBillable / weeksToTrack;
        const avgWorkPerWeek = totalWork / weeksToTrack;

        // Pre-fill form only if not already filled from history
        if (!billableHours) {
          setBillableHours(avgBillablePerWeek.toFixed(1));
        }
        if (!weeklyHours) {
          setWeeklyHours(avgWorkPerWeek.toFixed(1));
        }

        setTrackerDataLoaded(true);
      } catch (err) {
        console.error('Error loading tracker data:', err);
        setTrackerDataError(true);
      }
    };

    loadTrackerData();
  }, [user, weeksToTrack]);

  // Handle navigation from menu (state-based step)
  useEffect(() => {
    if (location.state?.step !== undefined) {
      setActiveStep(location.state.step);
    }
  }, [location.state]);

  // Calculate minimum monthly income (Layer 1)
  const getMinimumMonthly = () => {
    const housing = parseFloat(housingCosts) || 0;
    const living = parseFloat(livingCosts) || 0;
    const business = parseFloat(businessCosts) || 0;
    const savingsAmount = parseFloat(savings) || 0;
    const subtotal = housing + living + business + savingsAmount;
    const taxes = subtotal * 0.15; // 15% for taxes
    return subtotal + taxes;
  };

  // Calculate billable hours per month (Layer 2)
  const getMonthlyBillableHours = () => {
    const billable = parseFloat(billableHours) || 0;
    return billable * 4; // 4 weeks per month
  };

  // Calculate minimum hourly rate
  const getMinimumHourly = () => {
    const monthlyMin = getMinimumMonthly();
    const monthlyBillable = getMonthlyBillableHours();
    if (monthlyBillable === 0) return 0;
    return monthlyMin / monthlyBillable;
  };

  // Calculate coefficients (Layer 3)
  const getCoefficients = () => {
    const expCoef = experienceOptions.find((o) => o.value === experience)?.coefficient || 1;
    const specCoef = specializationOptions.find((o) => o.value === specialization)?.coefficient || 1;
    const portCoef = portfolioOptions.find((o) => o.value === portfolio)?.coefficient || 1;
    const demandCoef = demandOptions.find((o) => o.value === demand)?.coefficient || 1;
    return expCoef * specCoef * portCoef * demandCoef;
  };

  // Calculate recommended hourly rate
  const getRecommendedHourly = () => {
    return getMinimumHourly() * getCoefficients();
  };

  // Calculate premium hourly rate
  const getPremiumHourly = () => {
    return getRecommendedHourly() * 1.3;
  };

  // ============================================
  // CALCULATION B: Dignity Wage Approach
  // ============================================

  // Get base hourly wage (from selected wage)
  const getBaseHourlyWage = () => {
    if (baseWage === 'custom') {
      return parseFloat(customWage) || 0;
    }
    return WAGES_2026[baseWage]?.hourly || 0;
  };

  // Calculate what you should earn monthly (dignity wage × total work hours)
  const getDignityMonthlyEarnings = () => {
    const baseHourly = getBaseHourlyWage();
    const hourlyWithOSVC = baseHourly * OSVC_COEFFICIENT; // +30% for OSVČ
    const totalMonthlyHours = (parseFloat(weeklyHours) || 0) * 4;
    return hourlyWithOSVC * totalMonthlyHours;
  };

  // Calculate minimum hourly rate needed to achieve dignity wage (Calculation B)
  const getDignityMinimumHourly = () => {
    const dignityEarnings = getDignityMonthlyEarnings();
    const monthlyBillable = getMonthlyBillableHours();
    if (monthlyBillable === 0) return 0;
    return dignityEarnings / monthlyBillable;
  };

  // Calculate recommended hourly rate with market coefficients (Calculation B)
  const getDignityRecommendedHourly = () => {
    return getDignityMinimumHourly() * getCoefficients();
  };

  // Calculate premium hourly rate (Calculation B)
  const getDignityPremiumHourly = () => {
    return getDignityRecommendedHourly() * 1.3;
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const resultData = {
        // Calculation A: From living costs
        minimumMonthly: getMinimumMonthly(),
        monthlyBillableHours: getMonthlyBillableHours(),
        minimumHourly: getMinimumHourly(),
        recommendedHourly: getRecommendedHourly(),
        premiumHourly: getPremiumHourly(),
        coefficients: getCoefficients(),
        // Calculation B: From dignity wage
        dignityMonthlyEarnings: getDignityMonthlyEarnings(),
        dignityMinimumHourly: getDignityMinimumHourly(),
        dignityRecommendedHourly: getDignityRecommendedHourly(),
        dignityPremiumHourly: getDignityPremiumHourly(),
        baseHourlyWage: getBaseHourlyWage(),
        inputs: {
          housingCosts,
          livingCosts,
          businessCosts,
          savings,
          weeklyHours,
          billableHours,
          weeksToTrack,
          baseWage,
          customWage,
          experience,
          specialization,
          portfolio,
          demand,
        },
      };

      // Save to Supabase
      const savedResult = await saveCalculatorResult(user.id, resultData);

      // Navigate to results page with data
      navigate('/app/kalkulacka/vysledky', {
        state: {
          ...resultData,
          id: savedResult.id,
          createdAt: savedResult.created_at,
        },
      });
    } catch (err) {
      console.error('Error saving calculator data:', err);
      setError(err.message || 'Nepodařilo se uložit výsledky. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Kolik MUSÍTE vydělat?</Typography>
      <Typography color="text.secondary">
        Zadejte své měsíční náklady. Tyto údaje potřebujeme pro výpočet vašeho životního minima.
      </Typography>

      <TextField
        label="Náklady na bydlení"
        helperText="Nájem/hypotéka, energie, internet"
        type="number"
        value={housingCosts}
        onChange={(e) => setHousingCosts(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">Kč/měsíc</InputAdornment>,
        }}
        fullWidth
      />

      <TextField
        label="Životní náklady"
        helperText="Jídlo, oblečení, doprava, zdraví"
        type="number"
        value={livingCosts}
        onChange={(e) => setLivingCosts(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">Kč/měsíc</InputAdornment>,
        }}
        fullWidth
      />

      <TextField
        label="Náklady na podnikání"
        helperText="Software, telefon, účetní, vzdělávání, marketing"
        type="number"
        value={businessCosts}
        onChange={(e) => setBusinessCosts(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">Kč/měsíc</InputAdornment>,
        }}
        fullWidth
      />

      <TextField
        label="Rezerva + spoření"
        helperText="Kolik si chcete měsíčně odkládat"
        type="number"
        value={savings}
        onChange={(e) => setSavings(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">Kč/měsíc</InputAdornment>,
        }}
        fullWidth
      />

      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
          mb: 2,
        }}
      >
        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            K vašim nákladům automaticky přičteme 15% na daně a odvody OSVČ.
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
        }}
      >
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Vaše minimální měsíční příjmy
          </Typography>
          <Typography variant="h4" color="primary">
            {getMinimumMonthly().toLocaleString('cs-CZ')} Kč
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderStep2 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Kolik hodin OPRAVDU fakturujete?</Typography>
      <Typography color="text.secondary">
        {trackerDataLoaded
          ? 'Data byla načtena z vašeho trackeru. Pokud chcete, můžete je upravit ručně.'
          : 'Zadejte svůj skutečný pracovní čas. Ne kolik byste chtěli pracovat, ale kolik reálně fakturujete klientům.'}
      </Typography>

      {/* Info about billable hours */}
      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
        }}
      >
        <CardContent>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            💼 Co jsou fakturovatelné hodiny?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Fakturovatelné hodiny = <strong>POUZE 1:1 práce pro klienty</strong> (konzultace, přípravy, rešerše, follow-upy, specifické vzdělávání pro daného klienta).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            📈 <strong>Škálovatelná práce</strong> (digiprodukty, kurzy) se <strong>NEPOČÍTÁ</strong> do hodinovky - ta generuje pasivní příjem.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🔧 <strong>Režie</strong> (administrativa, networking) se také nepočítá přímo - rozpouští se do hodinovky jako overhead náklady.
          </Typography>
        </CardContent>
      </Card>

      {/* Weeks to track selector */}
      <FormControl fullWidth>
        <InputLabel>Za kolik týdnů počítat průměr?</InputLabel>
        <Select
          value={weeksToTrack}
          onChange={(e) => {
            setWeeksToTrack(e.target.value);
            // Clear current values to trigger reload
            setBillableHours('');
            setWeeklyHours('');
            setTrackerDataLoaded(false);
          }}
          label="Za kolik týdnů počítat průměr?"
        >
          <MenuItem value={1}>1 týden (aktuální stav)</MenuItem>
          <MenuItem value={2}>2 týdny (přesnější)</MenuItem>
          <MenuItem value={3}>3 týdny (ještě přesnější)</MenuItem>
          <MenuItem value={4}>4 týdny (nejpřesnější - celý měsíc)</MenuItem>
        </Select>
      </FormControl>

      {/* Tracker data info card */}
      {trackerDataLoaded && !manualOverride && (
        <Card
          sx={{
            bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
            border: INFO_CARD_STYLES[theme.palette.mode].border,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Data z vašeho trackeru
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Celkový pracovní čas týdně:</Typography>
              <Typography fontWeight={600}>{weeklyHours}h</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Fakturovatelné hodiny týdně (1:1 práce):</Typography>
              <Typography fontWeight={600} color="primary">{billableHours}h</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Údaje jsou průměr z posledních {weeksToTrack} {weeksToTrack === 1 ? 'týdne' : weeksToTrack < 5 ? 'týdnů' : 'týdnů'}.{' '}
              <a
                href="/app/tracker"
                onClick={(e) => { e.preventDefault(); navigate('/app/tracker'); }}
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                Upravit data v trackeru
              </a>
              {' · '}
              <a
                href="/app/nastaveni/kategorie"
                onClick={(e) => { e.preventDefault(); navigate('/app/nastaveni/kategorie'); }}
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                Změnit fakturovatelné kategorie
              </a>
            </Typography>

            <Box sx={{ mt: 2 }}>
              <ResponsiveButton
                variant="outlined"
                size="small"
                onClick={() => setManualOverride(true)}
              >
                Upravit hodiny manuálně
              </ResponsiveButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Warning if no tracker data */}
      {!trackerDataLoaded && trackerDataError && (
        <Alert severity="warning">
          Nemáte žádná data v trackeru. Vyplňte prosím alespoň jeden týden pro automatické načtení.{' '}
          <a
            href="/app/tracker"
            onClick={(e) => { e.preventDefault(); navigate('/app/tracker'); }}
            style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}
          >
            Začít trackovat čas
          </a>
        </Alert>
      )}

      {/* Manual input fields */}
      {(manualOverride || !trackerDataLoaded) && (
        <>
          <TextField
            label="Celkový pracovní čas týdně"
            helperText="Kolik hodin týdně pracujete celkem (včetně administrativy apod.)"
            type="number"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">hod/týden</InputAdornment>,
            }}
            fullWidth
          />

          <TextField
            label="Fakturovatelné hodiny týdně (1:1 práce)"
            helperText="Pouze přímá práce pro klienty - konzultace, přípravy, rešerše. BEZ škálovatelné práce (digiprodukty) a režie!"
            type="number"
            value={billableHours}
            onChange={(e) => setBillableHours(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">hod/týden</InputAdornment>,
            }}
            fullWidth
          />

          {manualOverride && trackerDataLoaded && (
            <Box>
              <ResponsiveButton
                variant="text"
                size="small"
                onClick={() => setManualOverride(false)}
              >
                Zpět na data z trackeru
              </ResponsiveButton>
            </Box>
          )}
        </>
      )}

      {/* Base wage selection for Calculation B */}
      <Box sx={{ mt: 4 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
            Jakou minimální hodinovou mzdu očekáváte?
          </FormLabel>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Toto použijeme pro výpočet důstojné hodinovky (hrubá mzda zaměstnance pro porovnání)
          </Typography>
          <RadioGroup value={baseWage} onChange={(e) => setBaseWage(e.target.value)}>
            <FormControlLabel
              value="minimal"
              control={<Radio />}
              label={`Minimální mzda (${WAGES_2026.minimal.hourly} Kč/h)`}
            />
            <FormControlLabel
              value="average_cz"
              control={<Radio />}
              label={`Průměrná mzda ČR (${WAGES_2026.average_cz.hourly} Kč/h)`}
            />
            <FormControlLabel
              value="average_prague"
              control={<Radio />}
              label={`Průměrná mzda Praha (${WAGES_2026.average_prague.hourly} Kč/h) – doporučeno`}
            />
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label="Vlastní hodnota"
            />
          </RadioGroup>

          {baseWage === 'custom' && (
            <TextField
              label="Vlastní hodinová mzda"
              type="number"
              value={customWage}
              onChange={(e) => setCustomWage(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">Kč/h</InputAdornment>,
              }}
              sx={{ mt: 2 }}
              fullWidth
            />
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              ℹ️ Pro OSVČ počítáme +30% (odvody a daně)
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              → Vaše cílová hodinovka:{' '}
              {Math.round(
                (baseWage === 'custom'
                  ? parseFloat(customWage) || 0
                  : WAGES_2026[baseWage]?.hourly || 0) * OSVC_COEFFICIENT
              ).toLocaleString('cs-CZ')}{' '}
              Kč/h
            </Typography>
          </Alert>
        </FormControl>
      </Box>

      <Alert
        severity="warning"
        sx={{
          bgcolor: WARNING_CARD_STYLES[theme.palette.mode].bgcolor,
          border: WARNING_CARD_STYLES[theme.palette.mode].border,
          color: theme.palette.mode === 'dark' ? WARNING_CARD_STYLES.dark.iconColor : undefined,
          '& .MuiAlert-icon': {
            color: WARNING_CARD_STYLES[theme.palette.mode].iconColor,
          },
        }}
      >
        Většina podnikatelek přeceňuje své fakturovatelné hodiny. Buďte k sobě upřímní!
      </Alert>

      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
        }}
      >
        <CardContent>
          <Stack spacing={1}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Fakturovatelné hodiny měsíčně
              </Typography>
              <Typography variant="h5">
                {getMonthlyBillableHours().toLocaleString('cs-CZ')} hod
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Minimální hodinovka (pro přežití)
              </Typography>
              <Typography variant="h4" color="error.main">
                {getMinimumHourly().toLocaleString('cs-CZ', {
                  maximumFractionDigits: 0,
                })}{' '}
                Kč
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderStep3 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Kolik DOOPRAVDY stojíte?</Typography>
      <Typography color="text.secondary">
        Teď přidáme koeficienty, které odrážejí vaši tržní hodnotu.
      </Typography>

      <FormControl component="fieldset">
        <FormLabel component="legend">Roky zkušeností v oboru</FormLabel>
        <RadioGroup
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          {experienceOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={`${option.label} (×${option.coefficient})`}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset">
        <FormLabel component="legend">Specializace</FormLabel>
        <RadioGroup
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          {specializationOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={`${option.label} (×${option.coefficient})`}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset">
        <FormLabel component="legend">Reference a portfolio</FormLabel>
        <RadioGroup
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
        >
          {portfolioOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={`${option.label} (×${option.coefficient})`}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset">
        <FormLabel component="legend">Poptávka po tvých službách</FormLabel>
        <RadioGroup value={demand} onChange={(e) => setDemand(e.target.value)}>
          {demandOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={`${option.label} (×${option.coefficient})`}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
        }}
      >
        <CardContent>
          <Stack spacing={1}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Celkový koeficient
              </Typography>
              <Typography variant="h5">×{getCoefficients().toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Doporučená hodinovka
              </Typography>
              <Typography variant="h4" color="success.main">
                {getRecommendedHourly().toLocaleString('cs-CZ', {
                  maximumFractionDigits: 0,
                })}{' '}
                Kč
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (value) => {
    return value?.toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) || '0';
  };

  // Compare two calculations and find changes
  const getChanges = (current, previous) => {
    const changes = [];
    const fields = [
      { key: 'housingCosts', label: 'Náklady na bydlení' },
      { key: 'livingCosts', label: 'Životní náklady' },
      { key: 'businessCosts', label: 'Náklady na podnikání' },
      { key: 'savings', label: 'Rezerva + spoření' },
      { key: 'weeklyHours', label: 'Celkový pracovní čas týdně' },
      { key: 'billableHours', label: 'Fakturovatelné hodiny týdně' },
      { key: 'experience', label: 'Zkušenosti' },
      { key: 'specialization', label: 'Specializace' },
      { key: 'portfolio', label: 'Portfolio' },
      { key: 'demand', label: 'Poptávka' },
    ];

    fields.forEach(field => {
      const currentVal = current?.inputs?.[field.key];
      const previousVal = previous?.inputs?.[field.key];

      if (currentVal !== previousVal && previousVal !== undefined) {
        changes.push({
          field: field.label,
          previous: previousVal,
          current: currentVal,
          isNumeric: ['housingCosts', 'livingCosts', 'businessCosts', 'savings', 'weeklyHours', 'billableHours'].includes(field.key),
        });
      }
    });

    return changes;
  };

  // Prepare chart data
  const chartData = history.slice(0, 10).reverse().map(item => ({
    date: formatDate(item.created_at),
    'Minimální': Math.round(item.minimum_hourly),
    'Doporučená': Math.round(item.recommended_hourly),
    'Prémiová': Math.round(item.premium_hourly),
  }));

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Cenová kalkulačka</Typography>
        <Typography color="text.secondary">
          Zjistěte svou minimální, doporučenou a prémiovou hodinovku.
        </Typography>
        {history.length > 0 && (
          <Card
            sx={{
              bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
              border: INFO_CARD_STYLES[theme.palette.mode].border,
              mt: 2,
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Formulář je předvyplněn podle vaší poslední kalkulace. Můžete hodnoty upravit a uložit novou kalkulaci.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Custom Timeline Stepper */}
      <Box sx={{ mb: 4, px: { xs: 2, md: 4 } }}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isLast = index === steps.length - 1;

          return (
            <Box key={step.label} sx={{ display: 'flex', gap: 3, position: 'relative' }}>
              {/* Icon Circle */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCompleted || isActive ? 'primary.main' : CARD_ICON_STYLES[theme.palette.mode].bgcolor,
                    color: isCompleted || isActive ? 'white' : CARD_ICON_STYLES[theme.palette.mode].iconColor,
                    border: '3px solid',
                    borderColor: isCompleted || isActive ? 'primary.main' : CARD_ICON_STYLES[theme.palette.mode].bgcolor,
                    transition: 'all 0.3s',
                    zIndex: 1,
                  }}
                >
                  <Icon size={28} />
                </Box>
                {/* Vertical Line */}
                {!isLast && (
                  <Box
                    sx={{
                      width: 3,
                      height: 80,
                      bgcolor: isCompleted ? 'primary.main' : CARD_ICON_STYLES[theme.palette.mode].bgcolor,
                      transition: 'all 0.3s',
                    }}
                  />
                )}
              </Box>

              {/* Content */}
              <Box sx={{ pb: isLast ? 0 : 4, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isActive ? 'primary.main' : isCompleted ? 'text.primary' : 'text.secondary',
                    mb: 0.5,
                  }}
                >
                  {step.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: isActive ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* History Chart */}
      {history.length > 1 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Vývoj hodinovek v čase
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} Kč`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Minimální"
                  stroke={COLORS.error.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Doporučená"
                  stroke={COLORS.success.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Prémiová"
                  stroke={COLORS.warning.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History of Changes Table */}
      {history.length > 1 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Historie změn nákladů a parametrů
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Co se změnilo</TableCell>
                    <TableCell align="right">Předchozí hodnota</TableCell>
                    <TableCell align="right">Nová hodnota</TableCell>
                    <TableCell align="center">Změna</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.slice(1).map((item, index) => {
                    const previous = history[index];
                    const changes = getChanges(item, previous);

                    return changes.map((change, changeIndex) => (
                      <TableRow key={`${item.id}-${changeIndex}`}>
                        {changeIndex === 0 && (
                          <TableCell rowSpan={changes.length}>
                            {formatDate(item.created_at)}
                          </TableCell>
                        )}
                        <TableCell>{change.field}</TableCell>
                        <TableCell align="right">
                          {change.isNumeric ? `${formatCurrency(change.previous)} Kč` : change.previous}
                        </TableCell>
                        <TableCell align="right">
                          {change.isNumeric ? `${formatCurrency(change.current)} Kč` : change.current}
                        </TableCell>
                        <TableCell align="center">
                          {change.isNumeric ? (
                            parseFloat(change.current) > parseFloat(change.previous) ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'success.main' }}>
                                <TrendingUp size={16} />
                                +{formatCurrency(parseFloat(change.current) - parseFloat(change.previous))} Kč
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'error.main' }}>
                                <TrendingDown size={16} />
                                {formatCurrency(parseFloat(change.current) - parseFloat(change.previous))} Kč
                              </Box>
                            )
                          ) : (
                            <Typography variant="body2" color="text.secondary">Změněno</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <ResponsiveButton
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowLeft size={20} />}
        >
          Zpět
        </ResponsiveButton>
        {activeStep === steps.length - 1 ? (
          <ResponsiveButton
            variant="contained"
            onClick={handleSubmit}
            loading={loading}
            startIcon={<Calculator size={20} />}
          >
            {loading ? 'Počítám...' : 'Zobrazit výsledky'}
          </ResponsiveButton>
        ) : (
          <ResponsiveButton variant="contained" onClick={handleNext} endIcon={<ArrowRight size={20} />}>
            Pokračovat
          </ResponsiveButton>
        )}
      </Box>
    </Box>
  );
};

export default CalculatorPage;
