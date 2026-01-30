import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Grid,
  Chip,
  Alert,
  CardActionArea,
  useTheme,
} from '@mui/material';
import { ResponsiveButton } from '../../components/ui';
import { Calendar, CheckCircle, Circle, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeek } from '../../contexts/WeekContext';
import { getTimeEntries } from '../../services/timeEntries';
import { getWeekStartDate, formatWeekRange, getWeekDatesForWeek } from '../../utils/dateHelpers';
import { COLORS } from '../../constants/colors';

const HistoryPage = () => {
  const { user } = useAuth();
  const { setWeek, isCurrentWeek, selectedWeekStart } = useWeek();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState('');

  // Load all weeks from time entries
  useEffect(() => {
    const loadWeeks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const entries = await getTimeEntries(user.id);

        if (entries.length === 0) {
          setWeeks([]);
          setLoading(false);
          return;
        }

        // Group entries by week
        const weekMap = {};
        entries.forEach(entry => {
          const weekStart = getWeekStartDate(entry.date);
          if (!weekMap[weekStart]) {
            weekMap[weekStart] = {
              weekStart,
              weekRange: formatWeekRange(weekStart),
              dates: getWeekDatesForWeek(weekStart),
              completedDates: [],
              totalHours: 0,
            };
          }
          weekMap[weekStart].completedDates.push(entry.date);

          // Calculate total hours for this entry
          const entryHours = Object.keys(entry)
            .filter(key => !['id', 'user_id', 'date', 'created_at', 'updated_at', 'project_name', 'category_projects', 'category_project_hours'].includes(key))
            .reduce((sum, key) => sum + (parseFloat(entry[key]) || 0), 0);

          weekMap[weekStart].totalHours += entryHours;
        });

        // Convert to array and sort by week start (newest first)
        const weeksList = Object.values(weekMap).sort((a, b) =>
          b.weekStart.localeCompare(a.weekStart)
        );

        setWeeks(weeksList);
      } catch (err) {
        console.error('Error loading weeks:', err);
        setError('Nepodařilo se načíst historii týdnů. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    };

    loadWeeks();
  }, [user]);

  const handleSelectWeek = (weekStart) => {
    setWeek(weekStart);
    navigate('/app/tracker');
  };

  const handleViewResults = (weekStart) => {
    setWeek(weekStart);
    navigate('/app/tracker/vysledky');
  };

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
        <Typography variant="h4">Historie týdnů</Typography>
        <Typography color="text.secondary">
          Přehled všech týdnů, které jste trackovali.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {weeks.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              py: 8,
              textAlign: 'center',
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Calendar size={64} color={COLORS.neutral[400]} />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Zatím nemáte žádné záznamy
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Začněte trackovat svůj čas a tady najdete historii všech týdnů.
            </Typography>
            <ResponsiveButton
              onClick={() => navigate('/app/tracker')}
              variant="contained"
              startIcon={<Calendar size={20} />}
            >
              Začít trackovat
            </ResponsiveButton>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {weeks.map((week) => {
            const completionPercentage = (week.completedDates.length / 7) * 100;
            const isComplete = week.completedDates.length === 7;
            const isCurrent = week.weekStart === selectedWeekStart;
            const avgHoursPerDay = week.totalHours / week.completedDates.length;

            return (
              <Card
                key={week.weekStart}
                sx={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: isCurrent ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    {/* Week Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Calendar size={20} color={theme.palette.primary.main} />
                        <Typography variant="h6">
                          {week.weekRange}
                        </Typography>
                      </Box>
                      {isCurrent && (
                        <Chip
                          label="Vybraný týden"
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                      {isCurrentWeek() && week.weekStart === getWeekStartDate(new Date()) && (
                        <Chip
                          label="Tento týden"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5, ml: isCurrent ? 1 : 0 }}
                        />
                      )}
                    </Grid>

                    {/* Stats */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Dokončeno
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isComplete ? (
                          <CheckCircle size={20} color={theme.palette.success.main} />
                        ) : (
                          <Circle size={20} color={COLORS.neutral[400]} />
                        )}
                        <Typography variant="h6">
                          {week.completedDates.length}/7 dní
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {completionPercentage.toFixed(0)}% vyplněno
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Celkem hodin
                      </Typography>
                      <Typography variant="h6">
                        {week.totalHours.toFixed(1)}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ø {avgHoursPerDay.toFixed(1)}h/den
                      </Typography>
                    </Grid>

                    {/* Actions */}
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Stack spacing={1}>
                        <ResponsiveButton
                          onClick={() => handleSelectWeek(week.weekStart)}
                          variant="outlined"
                          size="small"
                          fullWidth
                        >
                          Upravit
                        </ResponsiveButton>
                        <ResponsiveButton
                          onClick={() => handleViewResults(week.weekStart)}
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<BarChart3 size={16} />}
                        >
                          Výsledky
                        </ResponsiveButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default HistoryPage;
