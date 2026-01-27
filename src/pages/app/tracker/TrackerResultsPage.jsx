import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Calculate as CalculatorIcon,
} from '@mui/icons-material';
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

const categoryLabels = {
  client_communication: 'Komunikace s klienty',
  content_creation: 'Tvorba obsahu',
  social_media: 'Sociální sítě',
  administration: 'Administrativa',
  messages: 'Odpovídání na zprávy',
  education: 'Vzdělávání',
  billable_work: 'Práce pro klienty',
  other: 'Ostatní / pauzy',
};

const COLORS = [
  '#6366F1', // primary
  '#EC4899', // secondary
  '#10B981', // success
  '#F59E0B', // warning
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#64748B', // gray
];

const TrackerResultsPage = () => {
  const navigate = useNavigate();

  // TODO: Load data from Supabase
  // For now, using placeholder data to show the structure
  const [weekData] = useState([
    { day: 'Po', billable_work: 4, content_creation: 2, social_media: 1.5, administration: 1, messages: 1, client_communication: 0.5, education: 0.5, other: 0.5 },
    { day: 'Út', billable_work: 5, content_creation: 1, social_media: 1, administration: 0.5, messages: 1.5, client_communication: 1, education: 0, other: 1 },
    { day: 'St', billable_work: 3, content_creation: 3, social_media: 2, administration: 1, messages: 0.5, client_communication: 0.5, education: 1, other: 0 },
    { day: 'Čt', billable_work: 6, content_creation: 0.5, social_media: 0.5, administration: 0.5, messages: 1, client_communication: 1.5, education: 0, other: 0 },
    { day: 'Pá', billable_work: 4, content_creation: 2, social_media: 1, administration: 2, messages: 0.5, client_communication: 0, education: 0.5, other: 0 },
    { day: 'So', billable_work: 0, content_creation: 1, social_media: 2, administration: 0, messages: 1, client_communication: 0, education: 2, other: 1 },
    { day: 'Ne', billable_work: 0, content_creation: 0, social_media: 1, administration: 0, messages: 0.5, client_communication: 0, education: 1, other: 2 },
  ]);

  // Calculate totals
  const totals = Object.keys(categoryLabels).reduce((acc, key) => {
    acc[key] = weekData.reduce((sum, day) => sum + (day[key] || 0), 0);
    return acc;
  }, {});

  const totalHours = Object.values(totals).reduce((sum, val) => sum + val, 0);
  const billableHours = totals.billable_work || 0;
  const nonBillableHours = totalHours - billableHours;

  // Prepare pie chart data
  const pieData = Object.entries(totals)
    .map(([key, value]) => ({
      name: categoryLabels[key],
      value: parseFloat(value.toFixed(1)),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Find biggest time sink (non-billable)
  const nonBillableTotals = { ...totals };
  delete nonBillableTotals.billable_work;
  const biggestTimeSink = Object.entries(nonBillableTotals).reduce(
    (max, [key, value]) => (value > max.value ? { key, value } : max),
    { key: '', value: 0 }
  );

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/app/tracker')}
        sx={{ mb: 2 }}
      >
        Zpět na tracker
      </Button>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Výsledky za týden</Typography>
        <Typography color="text.secondary">
          Tady máte přehled, jak jste strávili svůj čas za posledních 7 dní.
        </Typography>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {totalHours.toFixed(1)}
              </Typography>
              <Typography color="text.secondary">Celkem hodin</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                {billableHours.toFixed(1)}
              </Typography>
              <Typography color="text.secondary">Fakturovatelných hodin</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {nonBillableHours.toFixed(1)}
              </Typography>
              <Typography color="text.secondary">Nefakturovatelných hodin</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
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
                        fill={COLORS[index % COLORS.length]}
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
        <Grid item xs={12} md={6}>
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
                    fill="#10B981"
                    name="Fakturovatelná práce"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Insight Card */}
      {biggestTimeSink.value > 0 && (
        <Card sx={{ mb: 4, bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Kam ti uniká čas?
            </Typography>
            <Typography>
              <strong>{biggestTimeSink.value.toFixed(1)} hodin týdně</strong>{' '}
              trávíte činností "{categoryLabels[biggestTimeSink.key]}". To je{' '}
              {((biggestTimeSink.value / totalHours) * 100).toFixed(0)}% vašeho
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
                      <TableCell>{categoryLabels[key]}</TableCell>
                      <TableCell align="right">{value.toFixed(1)}</TableCell>
                      <TableCell align="right">
                        {((value / totalHours) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {(value / 7).toFixed(1)}
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
        <Button
          component={Link}
          to="/app/kalkulacka"
          variant="contained"
          size="large"
          startIcon={<CalculatorIcon />}
        >
          Spočítat hodinovku
        </Button>
      </Box>
    </Box>
  );
};

export default TrackerResultsPage;
