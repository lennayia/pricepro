import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Chip,
  LinearProgress,
  CircularProgress,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { CheckCircle, Circle, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useWeek } from '../../../contexts/WeekContext';
import { getTimeEntries } from '../../../services/timeEntries';
import { getWeekDatesForWeek, formatDateWithDayName } from '../../../utils/dateHelpers';
import { TIME_CONSTANTS } from '../../../constants/healthThresholds';
import { COLORS } from '../../../constants/colors';
import WeekNavigation from '../../../components/tracker/WeekNavigation';

const TrackerPage = () => {
  const { user } = useAuth();
  const { selectedWeekStart } = useWeek();
  const theme = useTheme();
  const [completedDates, setCompletedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timeframe selection with localStorage persistence
  const [timeframe, setTimeframe] = useState(() => {
    const saved = localStorage.getItem('tracker_timeframe');
    return saved || 'week';
  });

  // Save timeframe to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tracker_timeframe', timeframe);
  }, [timeframe]);

  // Calculate timeframe-specific settings
  const timeframeDays = {
    'week': 7,
    '2weeks': 14,
    '3weeks': 21,
    'month': 30
  }[timeframe];

  const timeframeLabel = {
    'week': 'týden',
    '2weeks': '2 týdny',
    '3weeks': '3 týdny',
    'month': 'měsíc'
  }[timeframe];

  // Get dates for selected week
  const weekDates = getWeekDatesForWeek(selectedWeekStart);

  // Get dates for selected timeframe (beyond just the current week)
  const timeframeDates = [];
  for (let i = 0; i < timeframeDays; i++) {
    const date = new Date(selectedWeekStart);
    date.setDate(date.getDate() + i);
    timeframeDates.push(date.toISOString().split('T')[0]);
  }

  // Generate days array with real dates - show only 7 days at a time
  const days = weekDates.map((date, index) => ({
    day: index + 1,
    date,
    label: formatDateWithDayName(date),
  }));

  const progress = (completedDates.length / timeframeDays) * 100;

  // Load completed days from Supabase
  useEffect(() => {
    const loadCompletedDays = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const entries = await getTimeEntries(user.id);

        // Filter entries to selected timeframe (not just week)
        const completedInTimeframe = entries
          .filter(entry => timeframeDates.includes(entry.date))
          .map(entry => entry.date);

        setCompletedDates(completedInTimeframe);
      } catch (err) {
        console.error('Error loading completed days:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedDays();
  }, [user, selectedWeekStart, timeframe, timeframeDays]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontSize: 'clamp(1.5rem, 4vw, 2.125rem)' }}>
          Tracker času
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
          Sledujte svůj čas po dobu {timeframeDays} dní. Každý den zaznamenejte, kolik hodin jste
          strávili různými činnostmi.
        </Typography>
      </Stack>

      {/* Timeframe Selection */}
      <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
        <CardContent sx={{ px: 'clamp(12px, 3vw, 16px)', py: 'clamp(12px, 3vw, 16px)' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', textAlign: 'center' }}>
            Jak dlouho chcete sledovat svůj čas?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
            <ToggleButtonGroup
              value={timeframe}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setTimeframe(newValue);
                }
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  fontSize: 'clamp(0.65rem, 2vw, 0.8125rem)',
                  px: 'clamp(6px, 2vw, 12px)',
                  py: 'clamp(4px, 1vw, 6px)',
                  minWidth: 'clamp(55px, 15vw, 80px)',
                  whiteSpace: 'nowrap',
                }
              }}
            >
              <ToggleButton value="week">Týden</ToggleButton>
              <ToggleButton value="2weeks">2 týdny</ToggleButton>
              <ToggleButton value="3weeks">3 týdny</ToggleButton>
              <ToggleButton value="month">Měsíc</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <WeekNavigation />

      {/* Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ px: 'clamp(12px, 3vw, 16px)', py: 'clamp(12px, 3vw, 16px)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Typography variant="h6" sx={{ flex: 1, fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
              Váš pokrok
            </Typography>
            <Chip
              label={`${completedDates.length} / ${timeframeDays} dní`}
              color={completedDates.length === timeframeDays ? 'success' : 'primary'}
              size="small"
              sx={{ fontSize: 'clamp(0.65rem, 2vw, 0.8125rem)' }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
          {completedDates.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              Zatím nemáte žádné záznamy pro tento {timeframeLabel}. Začněte vyplňovat svůj první den.
            </Typography>
          )}
          {completedDates.length > 0 && completedDates.length < timeframeDays && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              Super! Ještě {timeframeDays - completedDates.length} dní a budete mít kompletní
              přehled.
            </Typography>
          )}
          {completedDates.length === timeframeDays && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
              Gratulujeme! Máte kompletní {timeframeLabel}. Podívejte se na výsledky.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Days Grid */}
      <Grid container spacing={'clamp(8px, 2vw, 16px)'} sx={{ mb: 4 }}>
        {days.map((day) => {
          const isCompleted = completedDates.includes(day.date);
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 12 / 7 }} key={day.day}>
              <Card
                sx={{
                  height: '100%',
                  border: isCompleted ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/app/tracker/den/${day.day}`}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 'clamp(12px, 3vw, 24px)', px: 'clamp(6px, 2vw, 16px)' }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                      {isCompleted ? (
                        <CheckCircle size={28} color={theme.palette.primary.main} />
                      ) : (
                        <Circle size={28} color={COLORS.neutral[400]} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', lineHeight: 1.2 }}>
                      {day.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Results Button */}
      <Box sx={{ textAlign: 'center' }}>
        <ResponsiveButton
          component={Link}
          to="/app/tracker/vysledky"
          variant="contained"
          size="large"
          startIcon={<BarChart3 size={20} />}
          disabled={completedDates.length === 0}
          sx={{
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            px: 'clamp(16px, 4vw, 24px)',
            py: 'clamp(8px, 2vw, 12px)',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Zobrazit výsledky {timeframe === 'week' ? 'týdne' : timeframe === '2weeks' ? '2 týdnů' : timeframe === '3weeks' ? '3 týdnů' : 'měsíce'}
        </ResponsiveButton>
        {completedDates.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}
          >
            Vyplňte alespoň jeden den pro zobrazení výsledků
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TrackerPage;
