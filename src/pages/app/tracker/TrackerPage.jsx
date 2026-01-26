import { useState } from 'react';
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
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assessment as ResultsIcon,
} from '@mui/icons-material';

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
  // TODO: Load completed days from Supabase
  const [completedDays, setCompletedDays] = useState([]);
  const progress = (completedDays.length / 7) * 100;

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Tracker času</Typography>
        <Typography color="text.secondary">
          Sleduj svůj čas po dobu 7 dní. Každý den zaznamenej, kolik hodin jsi
          strávila různými činnostmi.
        </Typography>
      </Stack>

      {/* Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Tvůj pokrok
            </Typography>
            <Chip
              label={`${completedDays.length} / 7 dní`}
              color={completedDays.length === 7 ? 'success' : 'primary'}
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
              Zatím nemáš žádné záznamy. Začni vyplňovat svůj první den.
            </Typography>
          )}
          {completedDays.length > 0 && completedDays.length < 7 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Super! Ještě {7 - completedDays.length} dní a budeš mít kompletní
              přehled.
            </Typography>
          )}
          {completedDays.length === 7 && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
              Gratulujeme! Máš kompletní týden. Podívej se na výsledky.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Days Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {days.map((day) => {
          const isCompleted = completedDays.includes(day.day);
          return (
            <Grid item xs={6} sm={4} md={3} lg={12 / 7} key={day.day}>
              <Card
                sx={{
                  height: '100%',
                  border: isCompleted ? '2px solid' : 'none',
                  borderColor: 'success.main',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/pricepro/app/tracker/den/${day.day}`}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {isCompleted ? (
                      <CheckIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                    ) : (
                      <UncheckedIcon
                        color="disabled"
                        sx={{ fontSize: 32, mb: 1 }}
                      />
                    )}
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
          to="/pricepro/app/tracker/vysledky"
          variant="contained"
          size="large"
          startIcon={<ResultsIcon />}
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
            Vyplň alespoň jeden den pro zobrazení výsledků
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TrackerPage;
