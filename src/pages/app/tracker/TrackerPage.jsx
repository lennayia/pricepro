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

  // Get dates for selected week
  const weekDates = getWeekDatesForWeek(selectedWeekStart);

  // Generate days array with real dates
  const days = weekDates.map((date, index) => ({
    day: index + 1,
    date,
    label: formatDateWithDayName(date),
  }));

  const progress = (completedDates.length / TIME_CONSTANTS.DAYS_IN_WEEK) * 100;

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

        // Filter entries to selected week
        const completedInWeek = entries
          .filter(entry => weekDates.includes(entry.date))
          .map(entry => entry.date);

        setCompletedDates(completedInWeek);
      } catch (err) {
        console.error('Error loading completed days:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedDays();
  }, [user, selectedWeekStart]);

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
        <Typography variant="h4">Tracker času</Typography>
        <Typography color="text.secondary">
          Sledujte svůj čas po dobu 7 dní. Každý den zaznamenejte, kolik hodin jste
          strávili různými činnostmi.
        </Typography>
      </Stack>

      {/* Week Navigation */}
      <WeekNavigation />

      {/* Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Váš pokrok
            </Typography>
            <Chip
              label={`${completedDates.length} / ${TIME_CONSTANTS.DAYS_IN_WEEK} dní`}
              color={completedDates.length === TIME_CONSTANTS.DAYS_IN_WEEK ? 'success' : 'primary'}
              size="small"
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Zatím nemáte žádné záznamy pro tento týden. Začněte vyplňovat svůj první den.
            </Typography>
          )}
          {completedDates.length > 0 && completedDates.length < TIME_CONSTANTS.DAYS_IN_WEEK && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Super! Ještě {TIME_CONSTANTS.DAYS_IN_WEEK - completedDates.length} dní a budete mít kompletní
              přehled.
            </Typography>
          )}
          {completedDates.length === TIME_CONSTANTS.DAYS_IN_WEEK && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
              Gratulujeme! Máte kompletní týden. Podívejte se na výsledky.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Days Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
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
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                      {isCompleted ? (
                        <CheckCircle size={32} color={theme.palette.primary.main} />
                      ) : (
                        <Circle size={32} color={COLORS.neutral[400]} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.2 }}>
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
        >
          Zobrazit výsledky týdne
        </ResponsiveButton>
        {completedDates.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Vyplňte alespoň jeden den pro zobrazení výsledků
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TrackerPage;
