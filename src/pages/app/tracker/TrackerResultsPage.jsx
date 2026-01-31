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
  useTheme,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { ArrowLeft, Calculator, Moon, Briefcase, Users, Sparkles, Lightbulb, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useWeek } from '../../../contexts/WeekContext';
import { getTimeEntries } from '../../../services/timeEntries';
import { getBillableCategoryKeys, getScalableCategoryKeys } from '../../../services/categorySettings';
import { getProjects } from '../../../services/projects';
import { getClients } from '../../../services/clients';
import { getWeekDatesForWeek, formatDayName } from '../../../utils/dateHelpers';
import WeekNavigation from '../../../components/tracker/WeekNavigation';
import { CATEGORY_DEFINITIONS, WORK_CATEGORY_KEYS, PERSONAL_CATEGORY_KEYS, getCategoryLabel } from '../../../constants/categories';
import { TIME_CONSTANTS } from '../../../constants/healthThresholds';
import { CHART_COLORS, HEALTH_SCORE_COLORS, INFO_CARD_STYLES, WARNING_CARD_STYLES, getChartColors } from '../../../constants/colors';
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
  const { selectedWeekStart } = useWeek();
  const theme = useTheme();
  const chartColors = getChartColors(theme.palette.mode);

  // Read timeframe from localStorage (set in TrackerDayPage)
  const timeframe = localStorage.getItem('tracker_timeframe') || 'week';

  const [weekData, setWeekData] = useState([]);
  const [billableCategoryKeys, setBillableCategoryKeys] = useState(['billable_work']);
  const [scalableCategoryKeys, setScalableCategoryKeys] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [clients, setClients] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filledDaysCount, setFilledDaysCount] = useState(0);

  // Load category settings
  useEffect(() => {
    const loadCategorySettings = async () => {
      if (!user) return;
      try {
        const billableKeys = await getBillableCategoryKeys(user.id);
        const scalableKeys = await getScalableCategoryKeys(user.id);
        setBillableCategoryKeys(billableKeys.length > 0 ? billableKeys : ['billable_work']);
        setScalableCategoryKeys(scalableKeys);
      } catch (err) {
        console.error('Error loading category settings:', err);
        // Fallback to default
        setBillableCategoryKeys(['billable_work']);
        setScalableCategoryKeys([]);
      }
    };

    loadCategorySettings();
  }, [user]);

  // Load projects and clients
  useEffect(() => {
    const loadProjectsAndClients = async () => {
      if (!user) return;
      try {
        const [projectsData, clientsData] = await Promise.all([
          getProjects(user.id),
          getClients(user.id)
        ]);

        setProjects(projectsData);
        setClients(clientsData);

        // Create maps for fast lookup
        const projectsMapData = projectsData.reduce((acc, project) => {
          acc[project.id] = project;
          return acc;
        }, {});
        setProjectsMap(projectsMapData);

        const clientsMapData = clientsData.reduce((acc, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
        setClientsMap(clientsMapData);
      } catch (err) {
        console.error('Error loading projects and clients:', err);
      }
    };

    loadProjectsAndClients();
  }, [user]);

  // Load week data from Supabase
  useEffect(() => {
    const loadWeekData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Calculate dates based on selected timeframe
        const getDatesForTimeframe = (startDate, timeframe) => {
          const days = {
            'week': 7,
            '2weeks': 14,
            '3weeks': 21,
            'month': 30
          }[timeframe];

          const dates = [];
          for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
          }
          return dates;
        };

        const dates = getDatesForTimeframe(selectedWeekStart, timeframe);
        const entries = await getTimeEntries(user.id);

        // Filter to current timeframe and transform to chart format
        const currentWeekEntries = entries.filter(entry =>
          dates.includes(entry.date)
        );

        // Transform database format to chart format
        const transformedData = dates.map(date => {
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
              digital_products: parseFloat(entry.digital_products) || 0,
              other: parseFloat(entry.other) || 0,
              sleep: parseFloat(entry.sleep) || 0,
              family_time: parseFloat(entry.family_time) || 0,
              personal_time: parseFloat(entry.personal_time) || 0,
              // CRITICAL: Include project and client data!
              category_projects: entry.category_projects || {},
              category_project_hours: entry.category_project_hours || {},
              category_project_clients: entry.category_project_clients || {},
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
            digital_products: 0,
            other: 0,
            sleep: 0,
            family_time: 0,
            personal_time: 0,
            category_projects: {},
            category_project_hours: {},
            category_project_clients: {},
          };
        });

        setWeekData(transformedData);

        // Count filled days (entries with at least some hours) for smart alerts
        const filled = entries.filter(entry => {
          const totalHours = WORK_CATEGORY_KEYS.reduce((sum, key) => sum + (parseFloat(entry[key]) || 0), 0) +
                            PERSONAL_CATEGORY_KEYS.reduce((sum, key) => sum + (parseFloat(entry[key]) || 0), 0);
          return totalHours > 0;
        });
        setFilledDaysCount(filled.length);
      } catch (err) {
        console.error('Error loading week data:', err);
        setError('Nepodařilo se načíst data. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    };

    loadWeekData();
  }, [user, selectedWeekStart, timeframe]);

  // Calculate totals
  const totals = allCategoryKeys.reduce((acc, key) => {
    acc[key] = weekData.reduce((sum, day) => sum + (day[key] || 0), 0);
    return acc;
  }, {});

  const totalHours = Object.values(totals).reduce((sum, val) => sum + val, 0);

  // Timeframe-specific settings
  const minFilledDaysThreshold = {
    'week': 5,
    '2weeks': 10,
    '3weeks': 15,
    'month': 20
  }[timeframe];

  const timeframeTitle = {
    'week': 'Výsledky za týden',
    '2weeks': 'Výsledky za 2 týdny',
    '3weeks': 'Výsledky za 3 týdny',
    'month': 'Výsledky za měsíc'
  }[timeframe];

  const timeframeDays = {
    'week': 7,
    '2weeks': 14,
    '3weeks': 21,
    'month': 30
  }[timeframe];

  // Calculate hours by category type based on user settings
  const billableHours = billableCategoryKeys.reduce((sum, key) => sum + (totals[key] || 0), 0);
  const scalableHours = scalableCategoryKeys.reduce((sum, key) => sum + (totals[key] || 0), 0);
  const workHoursTotal = WORK_CATEGORY_KEYS.reduce((sum, key) => sum + (totals[key] || 0), 0);
  const otherWorkHours = workHoursTotal - billableHours - scalableHours;

  // Calculate breakdown by projects
  const projectBreakdown = {};
  weekData.forEach(day => {
    const categoryProjects = day.category_projects || {};
    const categoryProjectHours = day.category_project_hours || {};

    // First, process split hours (category_project_hours)
    Object.entries(categoryProjectHours).forEach(([categoryKey, projectHoursMap]) => {
      Object.entries(projectHoursMap).forEach(([projectId, hours]) => {
        if (!projectId || !hours) return;

        if (!projectBreakdown[projectId]) {
          projectBreakdown[projectId] = {
            projectId,
            billableHours: 0,
            scalableHours: 0,
            otherHours: 0,
            totalHours: 0,
          };
        }

        const hoursValue = parseFloat(hours) || 0;

        // Categorize hours
        if (billableCategoryKeys.includes(categoryKey)) {
          projectBreakdown[projectId].billableHours += hoursValue;
        } else if (scalableCategoryKeys.includes(categoryKey)) {
          projectBreakdown[projectId].scalableHours += hoursValue;
        } else {
          projectBreakdown[projectId].otherHours += hoursValue;
        }
        projectBreakdown[projectId].totalHours += hoursValue;
      });
    });

    // Then, process simple project assignments (category_projects)
    // Only for categories that DON'T have split hours
    Object.entries(categoryProjects).forEach(([categoryKey, projectId]) => {
      if (!projectId) return;

      // Skip if this category has split hours
      if (categoryProjectHours[categoryKey]) return;

      const hours = parseFloat(day[categoryKey]) || 0;
      if (hours === 0) return;

      if (!projectBreakdown[projectId]) {
        projectBreakdown[projectId] = {
          projectId,
          billableHours: 0,
          scalableHours: 0,
          otherHours: 0,
          totalHours: 0,
        };
      }

      // Categorize hours
      if (billableCategoryKeys.includes(categoryKey)) {
        projectBreakdown[projectId].billableHours += hours;
      } else if (scalableCategoryKeys.includes(categoryKey)) {
        projectBreakdown[projectId].scalableHours += hours;
      } else {
        projectBreakdown[projectId].otherHours += hours;
      }
      projectBreakdown[projectId].totalHours += hours;
    });
  });

  // Convert to array and sort by total hours
  const projectBreakdownArray = Object.values(projectBreakdown)
    .sort((a, b) => b.totalHours - a.totalHours);

  // Calculate breakdown by clients
  const clientBreakdown = {};
  weekData.forEach(day => {
    const categoryProjectHours = day.category_project_hours || {};
    const categoryProjectClients = day.category_project_clients || {};

    // Process category_project_hours and map to clients
    Object.entries(categoryProjectHours).forEach(([categoryKey, projectHoursMap]) => {
      Object.entries(projectHoursMap).forEach(([projectId, hours]) => {
        if (!projectId || !hours) return;

        // Get client ID for this project
        const clientId = categoryProjectClients[categoryKey]?.[projectId];
        if (!clientId) return;

        if (!clientBreakdown[clientId]) {
          clientBreakdown[clientId] = {
            clientId,
            billableHours: 0,
            scalableHours: 0,
            otherHours: 0,
            totalHours: 0,
          };
        }

        const hoursValue = parseFloat(hours) || 0;

        // Categorize hours
        if (billableCategoryKeys.includes(categoryKey)) {
          clientBreakdown[clientId].billableHours += hoursValue;
        } else if (scalableCategoryKeys.includes(categoryKey)) {
          clientBreakdown[clientId].scalableHours += hoursValue;
        } else {
          clientBreakdown[clientId].otherHours += hoursValue;
        }
        clientBreakdown[clientId].totalHours += hoursValue;
      });
    });
  });

  // Convert to array and sort by total hours
  const clientBreakdownArray = Object.values(clientBreakdown)
    .sort((a, b) => b.totalHours - a.totalHours);

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
      key: key,
      name: getCategoryLabel(key),
      value: parseFloat(formatHours(value)),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Color mapping - každá kategorie má fixed barvu
  const getCategoryColor = (categoryKey) => {
    const colorMap = {
      'billable_work': chartColors[0], // neon green (dark) / bronze (light)
      'client_communication': chartColors[1], // neon yellow (dark) / gold (light)
      'other': chartColors[2], // neon orange (dark) / amber (light)
      'messages': chartColors[3], // neon red (dark) / red (light)
      'family_time': chartColors[4], // neon pink/magenta (dark) / pink (light)
      'sleep': chartColors[5], // neon purple (dark) / purple (light)
      'social_media': chartColors[6], // neon blue (dark) / blue (light)
      'personal_time': chartColors[7], // neon cyan (dark) / teal (light)
      'content_creation': chartColors[8], // neon lime (dark) / emerald (light)
      'administration': chartColors[9], // neon hot pink (dark) / copper (light)
      'education': chartColors[10], // neon violet (dark) / violet (light)
    };

    return colorMap[categoryKey] || chartColors[0];
  };

  // Find biggest time sink (jen pracovní aktivity, ne osobní život) - použijeme findBiggest z utils
  const biggestTimeSink = findBiggest(totals, ['billable_work', 'sleep', 'family_time', 'personal_time']);

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

      <WeekNavigation />

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">{timeframeTitle}</Typography>
        <Typography color="text.secondary">
          Přehled vašeho času za vybrané období. (Období můžete změnit v trackeru)
        </Typography>
      </Stack>

      {/* Completion Status */}
      {completedDays < timeframeDays && (
        <Alert
          severity="warning"
          sx={{
            mb: 4,
            bgcolor: WARNING_CARD_STYLES[theme.palette.mode].bgcolor,
            border: WARNING_CARD_STYLES[theme.palette.mode].border,
            color: theme.palette.mode === 'dark' ? WARNING_CARD_STYLES.dark.iconColor : undefined,
            '& .MuiAlert-icon': {
              color: WARNING_CARD_STYLES[theme.palette.mode].iconColor,
            },
          }}
        >
          <Typography sx={{ color: 'inherit' }}>
            <strong>Vyplněno {completedDays}/{timeframeDays} dní</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: 'inherit' }}>
            Pro přesnější přehled doporučujeme vyplnit celé období.{' '}
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
          bgcolor: healthScore >= 60
            ? INFO_CARD_STYLES[theme.palette.mode].bgcolor
            : undefined,
          background: healthScore >= 60
            ? undefined
            : healthColors.gradient,
          border: healthScore >= 60
            ? INFO_CARD_STYLES[theme.palette.mode].border
            : 'none',
          color: healthScore >= 60 ? 'text.primary' : 'white',
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {healthScore}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                {healthScore >= 80 ? (
                  <CheckCircle size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                ) : healthScore >= 60 ? (
                  <AlertTriangle size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                ) : (
                  <AlertCircle size={20} color="white" />
                )}
                <Typography variant="h6">
                  {healthScore >= 80 ? 'Vynikající' : healthScore >= 60 ? 'Lze zlepšit' : 'Varování'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Work-Life Balance Skóre
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Moon size={16} color={healthScore >= 60 ? INFO_CARD_STYLES[theme.palette.mode].iconColor : 'white'} />
                    <Typography variant="body2">
                      Průměrný spánek: <strong>{formatHours(avgSleep)}h/den</strong>
                      {avgSleep < 6 && ' - Kriticky málo!'}
                      {avgSleep >= 7 && avgSleep <= 8 && ' - Ideální'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Briefcase size={16} color={healthScore >= 60 ? INFO_CARD_STYLES[theme.palette.mode].iconColor : 'white'} />
                    <Typography variant="body2">
                      Průměrná práce: <strong>{formatHours(avgWork)}h/den</strong>
                      {avgWork > 12 && ' - Přetížení!'}
                      {avgWork <= 8 && ' - Zdravý balanc'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Users size={16} color={healthScore >= 60 ? INFO_CARD_STYLES[theme.palette.mode].iconColor : 'white'} />
                    <Typography variant="body2">
                      Čas s rodinou: <strong>{formatHours(avgFamily)}h/den</strong>
                      {avgFamily < 0.5 && ' - Věnujte více času blízkým'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sparkles size={16} color={healthScore >= 60 ? INFO_CARD_STYLES[theme.palette.mode].iconColor : 'white'} />
                    <Typography variant="body2">
                      Osobní čas: <strong>{formatHours(avgPersonal)}h/den</strong>
                      {avgPersonal < 0.5 && ' - Nezapomínejte na sebe!'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Info about work types */}
      <Card
        sx={{
          mb: 3,
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Lightbulb size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
            <Box>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Co znamenají typy práce?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                💼 <strong>Fakturovatelné (1:1)</strong> - Veškerá práce pro konkrétního klienta (konzultace, přípravy, rešerše, follow-upy). Používá se pro výpočet hodinovky v kalkulačce.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                📈 <strong>Škálovatelné</strong> - Investice do digiproduktu, kurzů, MLM. Negeneruje hodinovku, ale pasivní příjem - můžete pak pracovat méně 1:1 hodin.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🔧 <strong>Ostatní (režie)</strong> - Overhead (administrativa, obecné vzdělávání, networking). Rozpouští se do hodinovky jako náklady businessu.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards - Work Type Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                {formatHours(billableHours)}
              </Typography>
              <Typography color="text.secondary">💼 Fakturovatelné (1:1)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                Pro kalkulačku hodinovky
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {formatHours(scalableHours)}
              </Typography>
              <Typography color="text.secondary">📈 Škálovatelné</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                Investice do produktů
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {formatHours(otherWorkHours)}
              </Typography>
              <Typography color="text.secondary">🔧 Ostatní</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                Režie a administrativa
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Breakdown - MOVED UP for better visibility */}
      {projectBreakdownArray.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                📊 Přehled podle projektů ({projectBreakdownArray.length})
              </Typography>
              <ResponsiveButton
                component={Link}
                to="/app/nastaveni/projekty"
                variant="outlined"
                size="small"
              >
                Spravovat projekty
              </ResponsiveButton>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Projekt</strong></TableCell>
                    <TableCell align="right">💼 Fakturovatelné</TableCell>
                    <TableCell align="right">📈 Škálovatelné</TableCell>
                    <TableCell align="right">🔧 Ostatní</TableCell>
                    <TableCell align="right"><strong>Celkem</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectBreakdownArray.map((item) => {
                    const project = projectsMap[item.projectId];
                    const projectName = project?.name || 'Neznámý projekt';

                    return (
                      <TableRow key={item.projectId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {project?.color && (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: project.color,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <Typography fontWeight={500}>{projectName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {item.billableHours > 0 ? `${formatHours(item.billableHours)}h` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {item.scalableHours > 0 ? `${formatHours(item.scalableHours)}h` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {item.otherHours > 0 ? `${formatHours(item.otherHours)}h` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatHours(item.totalHours)}h</strong>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Client Breakdown */}
      {clientBreakdownArray.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                👥 Přehled podle klientů ({clientBreakdownArray.length})
              </Typography>
              <ResponsiveButton
                component={Link}
                to="/app/nastaveni/klienti"
                variant="outlined"
                size="small"
              >
                Spravovat klienty
              </ResponsiveButton>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Klient</strong></TableCell>
                    <TableCell align="right">💼 Fakturovatelné</TableCell>
                    <TableCell align="right">📈 Škálovatelné</TableCell>
                    <TableCell align="right">🔧 Ostatní</TableCell>
                    <TableCell align="right"><strong>Celkem</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientBreakdownArray.map((item) => {
                    const client = clientsMap[item.clientId];
                    const clientName = client?.name || 'Neznámý klient';

                    return (
                      <TableRow key={item.clientId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {client?.logo_url ? (
                              <Box
                                component="img"
                                src={client.logo_url}
                                alt={client.name}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  objectFit: 'contain',
                                  borderRadius: 0.5,
                                  flexShrink: 0,
                                }}
                              />
                            ) : client?.color ? (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: client.color,
                                  flexShrink: 0,
                                }}
                              />
                            ) : null}
                            <Typography fontWeight={500}>{clientName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {item.billableHours > 0 ? `${formatHours(item.billableHours)}h` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {item.scalableHours > 0 ? `${formatHours(item.scalableHours)}h` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {item.otherHours > 0 ? `${formatHours(item.otherHours)}h` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatHours(item.totalHours)}h</strong>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Settings Info */}
      <Card
        sx={{
          mb: 4,
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ℹ️ Klasifikace kategorií ovlivňuje výpočet fakturovatelných hodin v kalkulačce.
                {billableHours === 0 && workHoursTotal > 0 && (
                  <strong> Nemáte žádné fakturovatelné kategorie - nastavte je pro správný výpočet hodinovky.</strong>
                )}
              </Typography>
            </Box>
            <ResponsiveButton
              component={Link}
              to="/app/nastaveni/kategorie"
              variant="outlined"
              size="small"
            >
              Změnit klasifikaci kategorií
            </ResponsiveButton>
          </Box>
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 500 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Rozdělení času
              </Typography>
              <ResponsiveContainer width="100%" height={420}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props) => {
                      const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 20;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      const entry = pieData[index];

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={getCategoryColor(entry.key, index)}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontWeight="400"
                          fontSize="14"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCategoryColor(entry.key, index)}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} hod`} />
                  <Legend
                    verticalAlign="bottom"
                    height={100}
                    formatter={(value) => <span style={{ fontWeight: 300 }}>{value}</span>}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 500 }}>
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
                    fill={chartColors[0]}
                    name="Fakturovatelná práce"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Personalized Recommendations - pouze po dostatečném počtu vyplněných dnů */}
      {filledDaysCount >= minFilledDaysThreshold && (() => {
        const recommendations = generateRecommendations({ avgSleep, avgWork, avgPersonal, avgFamily });
        if (recommendations.length === 0) return null;

        return (
          <Card
            sx={{
              mb: 4,
              bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
              border: INFO_CARD_STYLES[theme.palette.mode].border,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Lightbulb size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                <Typography variant="h6">
                  Doporučení pro zdravější život
                </Typography>
              </Box>
              <Stack spacing={1}>
                {recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2" color="text.primary">
                    {rec.message}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })()}

      {/* Insight Card - pouze po dostatečném počtu vyplněných dnů */}
      {filledDaysCount >= minFilledDaysThreshold && biggestTimeSink.value > 0 && (
        <Card
          sx={{
            mb: 4,
            bgcolor: WARNING_CARD_STYLES[theme.palette.mode].bgcolor,
            border: WARNING_CARD_STYLES[theme.palette.mode].border,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
              Kam ti uniká čas?
            </Typography>
            <Typography color="text.primary">
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
