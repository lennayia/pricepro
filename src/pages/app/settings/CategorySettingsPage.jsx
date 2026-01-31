import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { ArrowLeft, Save, CheckCircle, TrendingUp, Briefcase } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getCategorySettings, updateCategoryType } from '../../../services/categorySettings';
import { WORK_CATEGORIES } from '../../../constants/categories';
import { INFO_CARD_STYLES } from '../../../constants/colors';

const CategorySettingsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load category settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const categorySettings = await getCategorySettings(user.id);

        // Convert array to object for easier lookup
        const settingsMap = categorySettings.reduce((acc, setting) => {
          acc[setting.category_key] = setting.category_type;
          return acc;
        }, {});

        setSettings(settingsMap);
      } catch (err) {
        console.error('Error loading category settings:', err);
        setError('Nepodařilo se načíst nastavení kategorií.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Handle category type change
  const handleCategoryTypeChange = (categoryKey, newType) => {
    setSettings((prev) => ({
      ...prev,
      [categoryKey]: newType,
    }));
  };

  // Save settings
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      // Update each category setting
      const updates = Object.entries(settings).map(([categoryKey, categoryType]) =>
        updateCategoryType(user.id, categoryKey, categoryType)
      );

      await Promise.all(updates);

      setSuccess(true);
      // Navigate back after successful save
      setTimeout(() => navigate('/app/tracker'), 500);
    } catch (err) {
      console.error('Error saving category settings:', err);
      setError('Nepodařilo se uložit nastavení. Zkuste to prosím znovu.');
      setSaving(false);
    }
  };

  // Calculate counts for summary
  const counts = {
    billable: Object.values(settings).filter((type) => type === 'billable').length,
    scalable: Object.values(settings).filter((type) => type === 'scalable').length,
    other: Object.values(settings).filter((type) => type === 'other').length,
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
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ResponsiveButton
            onClick={() => navigate('/app/tracker')}
            startIcon={<ArrowLeft size={20} />}
            variant="text"
            sx={{ mb: 1 }}
          >
            Zpět na tracker
          </ResponsiveButton>
        </Box>

        {/* Settings Navigation */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Kategorie"
            onClick={() => navigate('/app/nastaveni/kategorie')}
            color={location.pathname.includes('kategorie') ? 'primary' : 'default'}
            sx={{ fontWeight: location.pathname.includes('kategorie') ? 600 : 400 }}
          />
          <Chip
            label="Projekty"
            onClick={() => navigate('/app/nastaveni/projekty')}
            color={location.pathname.includes('projekty') ? 'primary' : 'default'}
            sx={{ fontWeight: location.pathname.includes('projekty') ? 600 : 400 }}
          />
          <Chip
            label="Klienti"
            onClick={() => navigate('/app/nastaveni/klienti')}
            color={location.pathname.includes('klienti') ? 'primary' : 'default'}
            sx={{ fontWeight: location.pathname.includes('klienti') ? 600 : 400 }}
          />
          <Chip
            label="Témata"
            onClick={() => navigate('/app/nastaveni/temata')}
            color={location.pathname.includes('temata') ? 'primary' : 'default'}
            sx={{ fontWeight: location.pathname.includes('temata') ? 600 : 400 }}
          />
        </Box>

        <Typography variant="h4">Nastavení kategorií</Typography>
        <Typography color="text.secondary">
          Klasifikujte své pracovní aktivity podle typu. Toto nastavení ovlivňuje výpočet
          fakturovatelných hodin v kalkulačce a reporting.
        </Typography>
      </Stack>

      {/* Error & Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle size={20} />}>
          Nastavení bylo úspěšně uloženo.
        </Alert>
      )}

      {/* Info Card */}
      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
          mb: 4,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Typy aktivit
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Briefcase size={20} color={theme.palette.primary.main} />
              <Box>
                <Typography fontWeight={600}>💼 Fakturovatelná (1:1 práce)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Přímá práce s klienty, kterou účtujete za hodinovou sazbu. Používá se pro výpočet
                  v kalkulačce.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TrendingUp size={20} color={theme.palette.warning.main} />
              <Box>
                <Typography fontWeight={600}>📈 Škálovatelná (investice)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Práce na produktech, kurzech a obsahu, které přinášejí pasivní příjem. Nepoužívá
                  se pro výpočet hodinovky.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'grey.400',
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography fontWeight={600}>🔧 Ostatní (režie)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrativa, vzdělávání, sociální sítě a další režijní aktivity.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Klasifikace kategorií
          </Typography>
          <Stack spacing={2} divider={<Divider />}>
            {WORK_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const currentType = settings[category.key] || 'other';

              return (
                <Box key={category.key}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexShrink: 0, pt: 0.5 }}>
                      <Icon size={20} color={theme.palette.text.secondary} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>
                  <ToggleButtonGroup
                    value={currentType}
                    exclusive
                    onChange={(e, newType) => {
                      if (newType !== null) {
                        handleCategoryTypeChange(category.key, newType);
                      }
                    }}
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        py: 1.5,
                        textTransform: 'none',
                      },
                    }}
                  >
                    <ToggleButton value="billable" aria-label="fakturovatelná">
                      💼 Fakturovatelná
                    </ToggleButton>
                    <ToggleButton value="scalable" aria-label="škálovatelná">
                      📈 Škálovatelná
                    </ToggleButton>
                    <ToggleButton value="other" aria-label="ostatní">
                      🔧 Ostatní
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card
        sx={{
          bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
          border: INFO_CARD_STYLES[theme.palette.mode].border,
          mb: 4,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Přehled nastavení
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={`${counts.billable} fakturovatelných`}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${counts.scalable} škálovatelných`}
              sx={{
                bgcolor: theme.palette.warning.main,
                color: theme.palette.warning.contrastText,
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${counts.other} ostatních`}
              sx={{ fontWeight: 600 }}
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ℹ️ Tyto kategorie ovlivňují výpočet fakturovatelných hodin v kalkulačce. Pouze
            fakturovatelné kategorie se používají pro stanovení hodinovky.
          </Typography>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <ResponsiveButton onClick={() => navigate('/app/tracker')} variant="outlined">
          Zrušit
        </ResponsiveButton>
        <ResponsiveButton
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={20} />}
          disabled={saving}
        >
          {saving ? 'Ukládám...' : 'Uložit změny'}
        </ResponsiveButton>
      </Box>
    </Box>
  );
};

export default CategorySettingsPage;
