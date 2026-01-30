import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Stack,
  Alert,
  InputAdornment,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { ResponsiveButton, NumberInput } from '../../../components/ui';
import { ArrowLeft, Save, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTimeEntry, upsertTimeEntry } from '../../../services/timeEntries';
import { getDateForDay } from '../../../utils/dateHelpers';
import { WORK_CATEGORIES, PERSONAL_CATEGORIES } from '../../../constants/categories';
import { calculateTotalHours, calculateWorkHours, calculatePersonalHours } from '../../../utils/calculators';
import { formatHours } from '../../../utils/formatters';
import { TIME_CONSTANTS } from '../../../constants/healthThresholds';
import { COLORS, INFO_CARD_STYLES } from '../../../constants/colors';

// Kategorie jsou nyní importované z constants/categories.js
const categories = [...WORK_CATEGORIES, ...PERSONAL_CATEGORIES];

const dayNames = ['', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

const TrackerDayPage = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const day = parseInt(dayNumber, 10);

  const [formData, setFormData] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.key]: '' }), {})
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load existing data for this day
  useEffect(() => {
    const loadDayData = async () => {
      if (!user || isNaN(day) || day < 1 || day > 7) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const date = getDateForDay(day);
        const entry = await getTimeEntry(user.id, date);

        if (entry) {
          // Populate form with existing data
          const loadedData = categories.reduce((acc, cat) => {
            acc[cat.key] = entry[cat.key] || '';
            return acc;
          }, {});
          setFormData(loadedData);
        }
      } catch (err) {
        console.error('Error loading day data:', err);
        setError('Nepodařilo se načíst data. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    };

    loadDayData();
  }, [user, day]);

  // Validate day number
  if (isNaN(day) || day < 1 || day > 7) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error">
          Neplatný den
        </Typography>
        <ResponsiveButton
          onClick={() => navigate('/app/tracker')}
          sx={{ mt: 2 }}
        >
          Zpět na tracker
        </ResponsiveButton>
      </Box>
    );
  }

  const handleChange = (key, value) => {
    // Only allow positive numbers between 0 and TIME_CONSTANTS.HOURS_IN_DAY
    if (value === '' || value === null || value === undefined) {
      setFormData((prev) => ({ ...prev, [key]: '' }));
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setFormData((prev) => ({ ...prev, [key]: '' }));
      return;
    }
    const numValue = Math.max(0, Math.min(TIME_CONSTANTS.HOURS_IN_DAY, parsed));
    setFormData((prev) => ({ ...prev, [key]: numValue }));
  };

  // Výpočty jsou nyní v utils/calculators.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate that at least one field has a value
    const hasData = Object.values(formData).some(val => parseFloat(val) > 0);
    if (!hasData) {
      setError('Vyplňte prosím alespoň jednu aktivitu.');
      return;
    }

    // Validate total hours doesn't exceed TIME_CONSTANTS.HOURS_IN_DAY
    const totalHours = calculateTotalHours(formData);
    if (totalHours > TIME_CONSTANTS.HOURS_IN_DAY) {
      setError(`Součet hodin nemůže překročit ${TIME_CONSTANTS.HOURS_IN_DAY} hodin za den. Aktuálně: ${formatHours(totalHours)}h`);
      return;
    }

    setSaving(true);

    try {
      const date = getDateForDay(day);

      // Convert form data to numbers
      const dataToSave = categories.reduce((acc, cat) => {
        acc[cat.key] = parseFloat(formData[cat.key]) || 0;
        return acc;
      }, {});

      await upsertTimeEntry(user.id, date, dataToSave);

      setSuccess(true);
      setTimeout(() => {
        navigate('/app/tracker');
      }, 1500);
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message || 'Nepodařilo se uložit data. Zkuste to prosím znovu.');
    } finally {
      setSaving(false);
    }
  };

  const totalHours = useMemo(() => calculateTotalHours(formData), [formData]);
  const workHours = useMemo(() => calculateWorkHours(formData), [formData]);
  const personalHours = useMemo(() => calculatePersonalHours(formData), [formData]);
  const sleepHours = useMemo(() => parseFloat(formData.sleep) || 0, [formData.sleep]);

  return (
    <Box>
      <ResponsiveButton
        startIcon={<ArrowLeft size={20} />}
        onClick={() => navigate('/app/tracker')}
        sx={{ mb: 2 }}
      >
        Zpět na přehled
      </ResponsiveButton>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Den {day} - {dayNames[day]}</Typography>
        <Typography color="text.secondary">
          Zapište, kolik hodin jste dnes strávili jednotlivými činnostmi.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Data byla úspěšně uložena! Přesměrovávám...
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
      <form onSubmit={handleSubmit}>
        {/* Work Section */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 0.5,
            color: 'primary.main'
          }}
        >
          Pracovní čas (v hodinách)
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          {WORK_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
            <Card key={category.key}>
              <CardContent sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      color: category.color || COLORS.neutral[600],
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Icon size={24} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <NumberInput
                    value={formData[category.key]}
                    onChange={(value) => handleChange(category.key, value)}
                    placeholder="0"
                    min={0}
                    max={TIME_CONSTANTS.HOURS_IN_DAY}
                    step={0.5}
                    sx={{ width: 75 }}
                    disabled={saving || success}
                  />
                </Box>
              </CardContent>
            </Card>
            );
          })}
        </Stack>

        {/* Personal Life Section */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 0.5,
            color: 'text.primary'
          }}
        >
          Osobní život (v hodinách)
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          {PERSONAL_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
            <Card
              key={category.key}
            >
              <CardContent sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      color: category.color || COLORS.neutral[600],
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Icon size={24} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <NumberInput
                    value={formData[category.key]}
                    onChange={(value) => handleChange(category.key, value)}
                    placeholder="0"
                    min={0}
                    max={TIME_CONSTANTS.HOURS_IN_DAY}
                    step={0.5}
                    sx={{ width: 75 }}
                    disabled={saving || success}
                  />
                </Box>
              </CardContent>
            </Card>
            );
          })}
        </Stack>

        {/* Summary */}
        <Card
          sx={{
            mb: 4,
            bgcolor: totalHours > TIME_CONSTANTS.HOURS_IN_DAY
              ? COLORS.error.main
              : sleepHours < 6 && sleepHours > 0
              ? COLORS.warning.main
              : workHours > 10
              ? COLORS.warning.dark
              : INFO_CARD_STYLES[theme.palette.mode].bgcolor,
            border: totalHours > TIME_CONSTANTS.HOURS_IN_DAY ||
              (sleepHours < 6 && sleepHours > 0) ||
              workHours > 10
              ? 'none'
              : INFO_CARD_STYLES[theme.palette.mode].border,
            color: totalHours > TIME_CONSTANTS.HOURS_IN_DAY ||
              (sleepHours < 6 && sleepHours > 0) ||
              workHours > 10
              ? 'white'
              : 'text.primary',
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Celkem dnes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatHours(totalHours)} / {TIME_CONSTANTS.HOURS_IN_DAY} hod
              </Typography>
            </Box>

            {/* Work vs Personal breakdown */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Práce
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatHours(workHours)}h
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Osobní život
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatHours(personalHours)}h
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Zbývá
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatHours(TIME_CONSTANTS.HOURS_IN_DAY - totalHours)}h
                </Typography>
              </Box>
            </Box>

            {/* Smart feedback */}
            {totalHours > TIME_CONSTANTS.HOURS_IN_DAY ? (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Pozor! Den má pouze {TIME_CONSTANTS.HOURS_IN_DAY} hodin. Zkontrolujte prosím své údaje.
                </Typography>
              </Box>
            ) : sleepHours < 6 && sleepHours > 0 ? (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Pozor! Spíte méně než 6 hodin - riziko vyhoření!
                </Typography>
              </Box>
            ) : workHours > 10 ? (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Hodně práce dnes ({formatHours(workHours)}h). Najděte si čas na odpočinek!
                </Typography>
              </Box>
            ) : sleepHours >= 7 && sleepHours <= 8 && personalHours >= 2 && workHours <= 10 ? (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={16} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                <Typography variant="body2">
                  Skvělý balanc! Spánek i osobní čas v pořádku.
                </Typography>
              </Box>
            ) : sleepHours === 0 && personalHours === 0 && workHours > 0 ? (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb size={16} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                <Typography variant="body2">
                  Nezapomeňte vyplnit spánek a osobní čas pro kompletní přehled!
                </Typography>
              </Box>
            ) : null}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <ResponsiveButton
            variant="outlined"
            onClick={() => navigate('/app/tracker')}
            disabled={saving}
          >
            Zrušit
          </ResponsiveButton>
          <ResponsiveButton
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save size={20} />}
            disabled={saving || success}
          >
            {saving ? 'Ukládám...' : 'Uložit'}
          </ResponsiveButton>
        </Box>
      </form>
      )}
    </Box>
  );
};

export default TrackerDayPage;
