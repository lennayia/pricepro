import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';

const steps = ['Životní náklady', 'Reálný čas', 'Tržní hodnota'];

const experienceOptions = [
  { value: '0-2', label: '0-2 roky', coefficient: 1.0 },
  { value: '3-5', label: '3-5 let', coefficient: 1.2 },
  { value: '6-10', label: '6-10 let', coefficient: 1.35 },
  { value: '10+', label: '10+ let', coefficient: 1.5 },
];

const specializationOptions = [
  { value: 'generalist', label: 'Generalistka (širší záběr)', coefficient: 1.0 },
  { value: 'specialist', label: 'Specialistka (úzké zaměření)', coefficient: 1.3 },
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

const CalculatorPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Layer 1: Living costs
  const [housingCosts, setHousingCosts] = useState('');
  const [livingCosts, setLivingCosts] = useState('');
  const [businessCosts, setBusinessCosts] = useState('');
  const [savings, setSavings] = useState('');

  // Layer 2: Real time
  const [weeklyHours, setWeeklyHours] = useState('');
  const [billableHours, setBillableHours] = useState('');

  // Layer 3: Market value
  const [experience, setExperience] = useState('0-2');
  const [specialization, setSpecialization] = useState('generalist');
  const [portfolio, setPortfolio] = useState('none');
  const [demand, setDemand] = useState('low');

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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate('/pricepro/app/kalkulacka/vysledky', {
        state: {
          minimumMonthly: getMinimumMonthly(),
          monthlyBillableHours: getMonthlyBillableHours(),
          minimumHourly: getMinimumHourly(),
          recommendedHourly: getRecommendedHourly(),
          premiumHourly: getPremiumHourly(),
          coefficients: getCoefficients(),
          inputs: {
            housingCosts,
            livingCosts,
            businessCosts,
            savings,
            weeklyHours,
            billableHours,
            experience,
            specialization,
            portfolio,
            demand,
          },
        },
      });
    } catch (error) {
      console.error('Error saving calculator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Kolik MUSÍŠ vydělat?</Typography>
      <Typography color="text.secondary">
        Zadej své měsíční náklady. Tyto údaje potřebujeme pro výpočet tvého životního minima.
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
        helperText="Kolik si chceš měsíčně odkládat"
        type="number"
        value={savings}
        onChange={(e) => setSavings(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">Kč/měsíc</InputAdornment>,
        }}
        fullWidth
      />

      <Alert severity="info">
        K tvým nákladům automaticky přičteme 15% na daně a odvody OSVČ.
      </Alert>

      <Card sx={{ bgcolor: 'grey.100' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Tvé minimální měsíční příjmy
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
      <Typography variant="h6">Kolik hodin OPRAVDU fakturuješ?</Typography>
      <Typography color="text.secondary">
        Zadej svůj skutečný pracovní čas. Ne kolik bys chtěla pracovat, ale kolik
        reálně fakturuješ klientům.
      </Typography>

      <TextField
        label="Celkový pracovní čas týdně"
        helperText="Kolik hodin týdně pracuješ celkem (včetně administrativy apod.)"
        type="number"
        value={weeklyHours}
        onChange={(e) => setWeeklyHours(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">hod/týden</InputAdornment>,
        }}
        fullWidth
      />

      <TextField
        label="Fakturovatelné hodiny týdně"
        helperText="Kolik hodin týdně můžeš reálně fakturovat klientům"
        type="number"
        value={billableHours}
        onChange={(e) => setBillableHours(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">hod/týden</InputAdornment>,
        }}
        fullWidth
      />

      <Alert severity="warning">
        Většina podnikatelek přeceňuje své fakturovatelné hodiny. Buď k sobě upřímná!
      </Alert>

      <Card sx={{ bgcolor: 'grey.100' }}>
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
      <Typography variant="h6">Kolik DOOPRAVDY stojíš?</Typography>
      <Typography color="text.secondary">
        Teď přidáme koeficienty, které odrážejí tvou tržní hodnotu.
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

      <Card sx={{ bgcolor: 'grey.100' }}>
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

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Cenová kalkulačka</Typography>
        <Typography color="text.secondary">
          Zjisti svou minimální, doporučenou a prémiovou hodinovku.
        </Typography>
      </Stack>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<BackIcon />}
        >
          Zpět
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
            disabled={loading}
          >
            {loading ? 'Počítám...' : 'Zobrazit výsledky'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} endIcon={<NextIcon />}>
            Pokračovat
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CalculatorPage;
