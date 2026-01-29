import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTimeEntries } from '../../../services/timeEntries';
import { getWeekDates, formatDayName } from '../../../utils/dateHelpers';
import { CATEGORY_DEFINITIONS, WORK_CATEGORY_KEYS, PERSONAL_CATEGORY_KEYS, getCategoryLabel } from '../../../constants/categories';
import { TIME_CONSTANTS } from '../../../constants/healthThresholds';
import { CHART_COLORS, HEALTH_SCORE_COLORS } from '../../../constants/colors';
import { calculateHealthScore, generateRecommendations, getHealthScoreColors } from '../../../utils/healthScore';
import { formatHours, formatPercentage } from '../../../utils/formatters';
import { calculateCategoryTotal, findBiggest } from '../../../utils/calculators';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// Kategorie a barvy jsou nyní importované z constants
const allCategoryKeys = Object.keys(CATEGORY_DEFINITIONS);

const TrackerResultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load week data from Supabase
  useEffect(() => {
    const loadWeekData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const weekDates = getWeekDates();
        const entries = await getTimeEntries(user.id);

        // Filter to current week and transform to chart format
        const currentWeekEntries = entries.filter(entry =>
          weekDates.includes(entry.date)
        );

        // Transform database format to chart format
        const transformedData = weekDates.map(date => {
          const entry = currentWeekEntries.find(e => e.date === date);
          const dayName = formatDayName(date);

          if (entry) {
            return {
              day: dayName,
              billable_work: parseFloat(entry.billable_work) || 0,
              content_creation: parseFloat(entry.content_creation) || 0,
              social_media: parseFloat(entry.social_media) || 0,
              administration: parseFloat(entry.administration) || 0,
              messages: parseFloat(entry.messages) || 0,
              client_communication: parseFloat(entry.client_communication) || 0,
              education: parseFloat(entry.education) || 0,
              other: parseFloat(entry.other) || 0,
              sleep: parseFloat(entry.sleep) || 0,
              family_time: parseFloat(entry.family_time) || 0,
              personal_time: parseFloat(entry.personal_time) || 0,
            };
          }

          // Return empty day if no entry
          return {
            day: dayName,
            billable_work: 0,
            content_creation: 0,
            social_media: 0,
            administration: 0,
            messages: 0,
            client_communication: 0,
            education: 0,
            other: 0,
            sleep: 0,
            family_time: 0,
            personal_time: 0,
          };
        });

        setWeekData(transformedData);
      } catch (err) {
        console.error('Error loading week data:', err);
        setError('Nepodařilo se načíst data. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    };

    loadWeekData();
  }, [user]);

  // Calculate totals
  const totals = allCategoryKeys.reduce((acc, key) => {
    acc[key] = weekData.reduce((sum, day) => sum + (day[key] || 0), 0);
    return acc;
  }, {});

  const totalHours = Object.values(totals).reduce((sum, val) => sum + val, 0);
  const billableHours = totals.billable_work || 0;
  const nonBillableHours = totalHours - billableHours;

  // Count how many days have data
  const completedDays = weekData.filter(day =>
    allCategoryKeys.some(key => day[key] > 0)
  ).length;

  // Work-Life Balance metrics
  const workHours = WORK_CATEGORY_KEYS.reduce((sum, key) => sum + (totals[key] || 0), 0);
  const personalHours = PERSONAL_CATEGORY_KEYS.reduce((sum, key) => sum + (totals[key] || 0), 0);
  const sleepHours = totals.sleep || 0;
  const familyHours = totals.family_time || 0;
  const personalTimeHours = totals.personal_time || 0;

  const avgSleep = completedDays > 0 ? sleepHours / completedDays : 0;
  const avgWork = completedDays > 0 ? workHours / completedDays : 0;
  const avgFamily = completedDays > 0 ? familyHours / completedDays : 0;
  const avgPersonal = completedDays > 0 ? personalTimeHours / completedDays : 0;

  // Health Score (0-100) - nyní importováno z utils/healthScore.js
  const healthScore = calculateHealthScore(avgSleep, avgWork, avgPersonal, avgFamily);
  const healthColors = getHealthScoreColors(healthScore);

  // Prepare pie chart data
  const pieData = Object.entries(totals)
    .map(([key, value]) => ({
      name: getCategoryLabel(key),
      value: parseFloat(formatHours(value)),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Find biggest time sink (non-billable) - použijeme findBiggest z utils
  const biggestTimeSink = findBiggest(totals, ['billable_work']);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box>
        <ResponsiveButton
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/app/tracker')}
          sx={{ mb: 2 }}
        >
          Zpět na tracker
        </ResponsiveButton>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Show empty state if no data
  if (totalHours === 0) {
    return (
      <Box>
        <ResponsiveButton
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/app/tracker')}
          sx={{ mb: 2 }}
        >
          Zpět na tracker
        </ResponsiveButton>
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Zatím nemáte žádné záznamy
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Začněte trackovat svůj čas a získejte cenné poznatky o tom, jak trávíte
              svůj pracovní den.
            </Typography>
            <ResponsiveButton
              component={Link}
              to="/app/tracker"
              variant="contained"
            >
              Začít trackovat čas
            </ResponsiveButton>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveButton
        startIcon={<ArrowLeft size={20} />}
        onClick={() => navigate('/app/tracker')}
        sx={{ mb: 2 }}
      >
        Zpět na tracker
      </ResponsiveButton>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Výsledky za týden</Typography>
        <Typography color="text.secondary">
          Tady máte přehled, jak jste strávili svůj čas za posledních {TIME_CONSTANTS.DAYS_IN_WEEK} dní.
        </Typography>
      </Stack>

      {/* Completion Status */}
      {completedDays < TIME_CONSTANTS.DAYS_IN_WEEK && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography>
            <strong>Vyplněno {completedDays}/{TIME_CONSTANTS.DAYS_IN_WEEK} dní</strong>
          </Typography>
          <Typography variant="body2">
            Pro přesnější přehled doporučujeme vyplnit celý týden.{' '}
            <Link to="/app/tracker" style={{ color: 'inherit', fontWeight: 600 }}>
              Pokračovat ve vyplňování
            </Link>
          </Typography>
        </Alert>
      )}

      {/* Health Score Card */}
      <Card
        sx={{
          mb: 4,
          background: healthColors.gradient,
          color: 'white',
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {healthScore}%
              </Typography>
              <Typography variant="h6">
                {healthScore >= 80 ? '✅ Vynikající' : healthScore >= 60 ? '⚠️ Lze zlepšit' : '🚨 Varování'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                Work-Life Balance Skóre
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    💤 Průměrný spánek: <strong>{formatHours(avgSleep)}h/den</strong>
                    {avgSleep < 6 && ' - 🚨 Kriticky málo!'}
                    {avgSleep >= 7 && avgSleep <= 8 && ' - ✅ Ideální'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    💼 Průměrná práce: <strong>{formatHours(avgWork)}h/den</strong>
                    {avgWork > 12 && ' - ⚠️ Přetížení!'}
                    {avgWork <= 8 && ' - ✅ Zdravý balanc'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    👨‍👩‍👧 Čas s rodinou: <strong>{formatHours(avgFamily)}h/den</strong>
                    {avgFamily < 0.5 && ' - ⚠️ Věnujte více času blízkým'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    🎯 Osobní čas: <strong>{formatHours(avgPersonal)}h/den</strong>
                    {avgPersonal < 0.5 && ' - ⚠️ Nezapomínejte na sebe!'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {formatHours(totalHours)}
              </Typography>
              <Typography color="text.secondary">Celkem hodin</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                {formatHours(billableHours)}
              </Typography>
              <Typography color="text.secondary">Fakturovatelných hodin</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {formatHours(nonBillableHours)}
              </Typography>
              <Typography color="text.secondary">Nefakturovatelných hodin</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Rozdělení času
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} hod`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Fakturovatelná práce po dnech
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} hod`} />
                  <Bar
                    dataKey="billable_work"
                    fill={CHART_COLORS[2]}
                    name="Fakturovatelná práce"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Personalized Recommendations - nyní z utils/healthScore.js */}
      {(() => {
        const recommendations = generateRecommendations({ avgSleep, avgWork, avgPersonal, avgFamily });
        if (recommendations.length === 0) return null;

        return (
          <Card sx={{ mb: 4, bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                💡 Doporučení pro zdravější život
              </Typography>
              <Stack spacing={1}>
                {recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2">
                    {rec.message}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })()}

      {/* Insight Card */}
      {biggestTimeSink.value > 0 && (
        <Card sx={{ mb: 4, bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Kam ti uniká čas?
            </Typography>
            <Typography>
              <strong>{formatHours(biggestTimeSink.value)} hodin týdně</strong>{' '}
              trávíte činností "{getCategoryLabel(biggestTimeSink.key)}". To je{' '}
              {formatPercentage((biggestTimeSink.value / totalHours) * 100)} vašeho
              času. Šlo by to automatizovat nebo delegovat?
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detailní přehled
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Činnost</TableCell>
                  <TableCell align="right">Celkem hodin</TableCell>
                  <TableCell align="right">% času</TableCell>
                  <TableCell align="right">Průměr/den</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(totals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{getCategoryLabel(key)}</TableCell>
                      <TableCell align="right">{formatHours(value)}</TableCell>
                      <TableCell align="right">
                        {formatPercentage((value / totalHours) * 100)}
                      </TableCell>
                      <TableCell align="right">
                        {completedDays > 0 ? formatHours(value / completedDays) : '0.0'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* CTA */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Máte přehled o svém čase. Teď zjistěte svou hodinovku!
        </Typography>
        <ResponsiveButton
          component={Link}
          to="/app/kalkulacka"
          variant="contained"
          size="large"
          startIcon={<Calculator size={20} />}
        >
          Spočítat hodinovku
        </ResponsiveButton>
      </Box>
    </Box>
  );
};

export default TrackerResultsPage;
