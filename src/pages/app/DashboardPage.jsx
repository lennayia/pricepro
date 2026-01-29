import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Button,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { Clock, Calculator, History, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getTimeEntries } from '../../services/timeEntries';
import { getLatestCalculatorResult } from '../../services/calculatorResults';
import { getWeekDates, getDayNumber, getDateForDay } from '../../utils/dateHelpers';
import { calculateHealthScore } from '../../utils/healthScore';
import { formatHours } from '../../utils/formatters';
import { TIME_CONSTANTS } from '../../constants/healthThresholds';
import { COLORS } from '../../constants/colors';
import { ResponsiveButton } from '../../components/ui';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trackerData, setTrackerData] = useState(null);
  const [calculatorData, setCalculatorData] = useState(null);

  // Load data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load tracker data for current week
        const weekDates = getWeekDates();
        const timeEntries = await getTimeEntries(user.id);
        const currentWeekEntries = timeEntries.filter(entry =>
          weekDates.includes(entry.date)
        );

        // Calculate tracker stats
        const completedDays = currentWeekEntries.length;
        let totalWorkHours = 0;
        let totalSleep = 0;
        let totalFamily = 0;
        let totalPersonal = 0;

        currentWeekEntries.forEach(entry => {
          totalWorkHours += (parseFloat(entry.client_communication) || 0) +
            (parseFloat(entry.content_creation) || 0) +
            (parseFloat(entry.social_media) || 0) +
            (parseFloat(entry.administration) || 0) +
            (parseFloat(entry.messages) || 0) +
            (parseFloat(entry.education) || 0) +
            (parseFloat(entry.billable_work) || 0) +
            (parseFloat(entry.other) || 0);
          totalSleep += parseFloat(entry.sleep) || 0;
          totalFamily += parseFloat(entry.family_time) || 0;
          totalPersonal += parseFloat(entry.personal_time) || 0;
        });

        // Calculate averages for health score
        const avgSleep = completedDays > 0 ? totalSleep / completedDays : 0;
        const avgWork = completedDays > 0 ? totalWorkHours / completedDays : 0;
        const avgFamily = completedDays > 0 ? totalFamily / completedDays : 0;
        const avgPersonal = completedDays > 0 ? totalPersonal / completedDays : 0;

        const healthScore = calculateHealthScore(avgSleep, avgWork, avgPersonal, avgFamily);

        setTrackerData({
          completedDays,
          totalWorkHours,
          healthScore,
          avgSleep,
          avgWork,
        });

        // Load latest calculator result
        const latestCalc = await getLatestCalculatorResult(user.id);
        setCalculatorData(latestCalc);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Get today's day number (1-7)
  const today = new Date();
  const todayDayNumber = getDayNumber(getDateForDay(today.getDay() || 7));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">
          Vítejte zpět! 👋
        </Typography>
        <Typography color="text.secondary">
          Tady je váš přehled a rychlý přístup k nástrojům.
        </Typography>
      </Stack>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Tracker Stats */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: COLORS.primary.light + '20',
                    borderRadius: 2,
                    p: 1.5,
                    mr: 2,
                  }}
                >
                  <Clock size={24} color={COLORS.primary.main} />
                </Box>
                <Typography variant="h6">Time Tracker</Typography>
              </Box>

              {trackerData && trackerData.completedDays > 0 ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Vyplněné dny tohoto týdne
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trackerData.completedDays} / {TIME_CONSTANTS.DAYS_IN_WEEK}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(trackerData.completedDays / TIME_CONSTANTS.DAYS_IN_WEEK) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Health Score
                      </Typography>
                      <Typography variant="h5" color={
                        trackerData.healthScore >= 80 ? 'success.main' :
                        trackerData.healthScore >= 60 ? 'warning.main' : 'error.main'
                      }>
                        {trackerData.healthScore}%
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Celkem hodin práce
                      </Typography>
                      <Typography variant="h5">
                        {formatHours(trackerData.totalWorkHours)}h
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 'auto' }}>
                    <ResponsiveButton
                      component={Link}
                      to={`/app/tracker/den/${todayDayNumber}`}
                      variant="outlined"
                      color="primary"
                      responsive
                      startIcon={<Clock size={18} />}
                    >
                      Vyplnit dnešní den
                    </ResponsiveButton>
                  </Box>
                </>
              ) : (
                <>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Zatím nemáte žádné záznamy. Začněte trackovat svůj čas!
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <ResponsiveButton
                      component={Link}
                      to="/app/tracker"
                      variant="contained"
                      responsive
                      startIcon={<Clock size={18} />}
                    >
                      Začít trackovat
                    </ResponsiveButton>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Calculator Stats */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: COLORS.secondary.light + '20',
                    borderRadius: 2,
                    p: 1.5,
                    mr: 2,
                  }}
                >
                  <Calculator size={24} color={COLORS.secondary.main} />
                </Box>
                <Typography variant="h6">Cenová kalkulačka</Typography>
              </Box>

              {calculatorData ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Vaše doporučená hodinovka
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
                    {calculatorData.recommended_hourly.toLocaleString('cs-CZ', {
                      maximumFractionDigits: 0,
                    })}{' '}
                    Kč
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Minimální
                      </Typography>
                      <Typography variant="h6">
                        {calculatorData.minimum_hourly.toLocaleString('cs-CZ', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        Kč
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Prémiová
                      </Typography>
                      <Typography variant="h6">
                        {calculatorData.premium_hourly.toLocaleString('cs-CZ', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        Kč
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 'auto' }}>
                    <ResponsiveButton
                      component={Link}
                      to="/app/kalkulacka"
                      variant="outlined"
                      color="primary"
                      responsive
                      startIcon={<Calculator size={18} />}
                    >
                      Nová kalkulace
                    </ResponsiveButton>
                  </Box>
                </>
              ) : (
                <>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Zjistěte, kolik byste měli účtovat za hodinu práce.
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <ResponsiveButton
                      component={Link}
                      to="/app/kalkulacka"
                      variant="contained"
                      responsive
                      startIcon={<Calculator size={18} />}
                    >
                      Spočítat hodinovku
                    </ResponsiveButton>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Rychlé akce
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
            }}
          >
            <CardActionArea
              component={Link}
              to="/app/tracker"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                  <Clock size={32} color={COLORS.primary.main} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Tracker času
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sledovat tento týden
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
            }}
          >
            <CardActionArea
              component={Link}
              to="/app/kalkulacka"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                  <Calculator size={32} color={COLORS.secondary.main} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Kalkulačka
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Spočítat hodinovku
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
            }}
          >
            <CardActionArea
              component={Link}
              to="/app/historie"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                  <History size={32} color={COLORS.success.main} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Historie
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Předchozí kalkulace
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Tip Card */}
      <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <TrendingUp size={24} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Tip pro efektivní práci
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                Doporučujeme začít s <strong>Trackerem času</strong>. Po 7 dnech
                sledování budete přesně vědět, kolik času vám zabírají různé činnosti.
                Tyto údaje pak můžete použít v kalkulačce pro přesnější výpočet
                hodinovky.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
