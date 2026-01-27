import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Stack,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Circle, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTimeEntries } from '../../../services/timeEntries';
import { getWeekDates, getDayNumber } from '../../../utils/dateHelpers';
import { TIME_CONSTANTS } from '../../../constants/healthThresholds';
import { COLORS } from '../../../constants/colors';

const days = [
  { day: 1, label: 'Den 1', name: 'Pondělí' },
  { day: 2, label: 'Den 2', name: 'Úterý' },
  { day: 3, label: 'Den 3', name: 'Středa' },
  { day: 4, label: 'Den 4', name: 'Čtvrtek' },
  { day: 5, label: 'Den 5', name: 'Pátek' },
  { day: 6, label: 'Den 6', name: 'Sobota' },
  { day: 7, label: 'Den 7', name: 'Neděle' },
];

const TrackerPage = () => {
  const { user } = useAuth();
  const [completedDays, setCompletedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const progress = (completedDays.length / TIME_CONSTANTS.DAYS_IN_WEEK) * 100;

  // Load completed days from Supabase
  useEffect(() => {
    const loadCompletedDays = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const weekDates = getWeekDates();
        const entries = await getTimeEntries(user.id);

        // Filter entries to current week and map to day numbers
        const completedDayNumbers = entries
          .filter(entry => weekDates.includes(entry.date))
          .map(entry => getDayNumber(entry.date))
          .filter(dayNum => dayNum !== null);

        setCompletedDays(completedDayNumbers);
      } catch (err) {
        console.error('Error loading completed days:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedDays();
  }, [user]);

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

      {/* Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Váš pokrok
            </Typography>
            <Chip
              label={`${completedDays.length} / ${TIME_CONSTANTS.DAYS_IN_WEEK} dní`}
              color={completedDays.length === TIME_CONSTANTS.DAYS_IN_WEEK ? 'success' : 'primary'}
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
          {completedDays.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Zatím nemáte žádné záznamy. Začněte vyplňovat svůj první den.
            </Typography>
          )}
          {completedDays.length > 0 && completedDays.length < TIME_CONSTANTS.DAYS_IN_WEEK && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Super! Ještě {TIME_CONSTANTS.DAYS_IN_WEEK - completedDays.length} dní a budete mít kompletní
              přehled.
            </Typography>
          )}
          {completedDays.length === TIME_CONSTANTS.DAYS_IN_WEEK && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
              Gratulujeme! Máte kompletní týden. Podívejte se na výsledky.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Days Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {days.map((day) => {
          const isCompleted = completedDays.includes(day.day);
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 12 / 7 }} key={day.day}>
              <Card
                sx={{
                  height: '100%',
                  border: isCompleted ? '2px solid' : 'none',
                  borderColor: COLORS.success.main,
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
                        <CheckCircle size={32} color={COLORS.success.main} />
                      ) : (
                        <Circle size={32} color="#9CA3AF" />
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      {day.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {day.name}
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
        <Button
          component={Link}
          to="/app/tracker/vysledky"
          variant="contained"
          size="large"
          startIcon={<BarChart3 size={20} />}
          disabled={completedDays.length === 0}
        >
          Zobrazit výsledky
        </Button>
        {completedDays.length === 0 && (
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
