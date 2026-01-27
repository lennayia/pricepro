import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Chat as CommunicationIcon,
  PhotoCamera as ContentIcon,
  Phone as SocialIcon,
  Receipt as AdminIcon,
  Email as MessagesIcon,
  School as EducationIcon,
  Work as BillableIcon,
  Coffee as OtherIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const categories = [
  {
    key: 'client_communication',
    label: 'Komunikace s klienty',
    description: 'Hovory, schůzky, videohovory',
    icon: <CommunicationIcon />,
  },
  {
    key: 'content_creation',
    label: 'Tvorba obsahu',
    description: 'Foto, video, texty, grafika',
    icon: <ContentIcon />,
  },
  {
    key: 'social_media',
    label: 'Sociální sítě',
    description: 'Scrollování, komentáře, stories',
    icon: <SocialIcon />,
  },
  {
    key: 'administration',
    label: 'Administrativa',
    description: 'Fakturace, účetnictví, e-maily',
    icon: <AdminIcon />,
  },
  {
    key: 'messages',
    label: 'Odpovídání na zprávy',
    description: 'DMs, WhatsApp, Messenger',
    icon: <MessagesIcon />,
  },
  {
    key: 'education',
    label: 'Vzdělávání',
    description: 'Kurzy, knihy, podcasty',
    icon: <EducationIcon />,
  },
  {
    key: 'billable_work',
    label: 'Práce pro klienty',
    description: 'Fakturovatelná práce',
    icon: <BillableIcon />,
  },
  {
    key: 'other',
    label: 'Ostatní / pauzy',
    description: 'Vše ostatní',
    icon: <OtherIcon />,
  },
];

const dayNames = ['', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

const TrackerDayPage = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const day = parseInt(dayNumber, 10);

  const [formData, setFormData] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.key]: '' }), {})
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate day number
  if (isNaN(day) || day < 1 || day > 7) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error">
          Neplatný den
        </Typography>
        <Button
          onClick={() => navigate('/app/tracker')}
          sx={{ mt: 2 }}
        >
          Zpět na tracker
        </Button>
      </Box>
    );
  }

  const handleChange = (key, value) => {
    // Only allow positive numbers
    const numValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    setFormData((prev) => ({ ...prev, [key]: numValue }));
  };

  const getTotalHours = () => {
    return Object.values(formData).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // TODO: Save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulated delay
      setSuccess(true);
      setTimeout(() => {
        navigate('/app/tracker');
      }, 1500);
    } catch (err) {
      setError('Nepodařilo se uložit data. Zkuste to prosím znovu.');
    } finally {
      setSaving(false);
    }
  };

  const totalHours = getTotalHours();

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/app/tracker')}
        sx={{ mb: 2 }}
      >
        Zpět na přehled
      </Button>

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

      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mb: 4 }}>
          {categories.map((category) => (
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
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <TextField
                    type="number"
                    value={formData[category.key]}
                    onChange={(e) => handleChange(category.key, e.target.value)}
                    placeholder="0"
                    inputProps={{ min: 0, step: 0.5 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">hod</InputAdornment>
                      ),
                    }}
                    sx={{ width: 120 }}
                    disabled={saving || success}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Summary */}
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">Celkem dnes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalHours.toFixed(1)} hod
              </Typography>
            </Box>
            {totalHours > 12 && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Páni, to je hodně! Doufáme, že máte i čas na odpočinek.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/app/tracker')}
            disabled={saving}
          >
            Zrušit
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving || success}
          >
            {saving ? 'Ukládám...' : 'Uložit'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TrackerDayPage;
