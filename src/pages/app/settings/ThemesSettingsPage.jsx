import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  List,
  ListItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Chip,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getProjectThemes,
  createProjectTheme,
  updateProjectTheme,
  deleteProjectTheme,
} from '../../../services/projectThemes';
import { INFO_CARD_STYLES } from '../../../constants/colors';

const ThemesSettingsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [themeName, setThemeName] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [saving, setSaving] = useState(false);

  // Load themes on mount
  useEffect(() => {
    loadThemes();
  }, [user]);

  const loadThemes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getProjectThemes(user.id);
      setThemes(data);
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('Nepodařilo se načíst témata.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (theme = null) => {
    setEditingTheme(theme);
    setThemeName(theme?.name || '');
    setThemeColor(theme?.color || '');
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTheme(null);
    setThemeName('');
    setThemeColor('');
    setError('');
  };

  const handleSave = async () => {
    console.log('=== handleSave called ===');
    console.log('themeName:', themeName);
    console.log('themeColor:', themeColor);
    console.log('editingTheme:', editingTheme);
    console.log('user:', user);

    if (!themeName.trim()) {
      console.log('ERROR: themeName is empty!');
      setError('Vyplňte název tématu.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      console.log('Starting save...');

      if (editingTheme) {
        // Update existing theme
        console.log('Updating theme:', editingTheme.id);
        await updateProjectTheme(editingTheme.id, {
          name: themeName.trim(),
          color: themeColor || null,
        });
        console.log('Theme updated successfully');
        setSuccess('Téma bylo úspěšně aktualizováno.');
      } else {
        // Create new theme
        console.log('Creating new theme for user:', user.id);
        const result = await createProjectTheme(user.id, {
          name: themeName.trim(),
          color: themeColor || null,
        });
        console.log('Theme created successfully:', result);
        setSuccess('Téma bylo úspěšně vytvořeno.');
      }

      handleCloseDialog();
      loadThemes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('!!! Error saving theme:', err);
      console.error('Error message:', err.message);
      console.error('Error details:', err);
      setError(err.message || 'Nepodařilo se uložit téma.');
    } finally {
      console.log('handleSave finished, saving:', false);
      setSaving(false);
    }
  };

  const handleDelete = async (themeId, themeName) => {
    if (!confirm(`Opravdu chcete smazat téma "${themeName}"?`)) {
      return;
    }

    try {
      await deleteProjectTheme(themeId);
      setSuccess('Téma bylo úspěšně smazáno.');
      loadThemes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting theme:', err);
      setError('Nepodařilo se smazat téma.');
    }
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
        <Typography variant="h4">Správa témat projektů</Typography>
        <Typography color="text.secondary">
          Vytvořte si témata/kategorie pro lepší organizaci projektů.
        </Typography>
      </Stack>

      {/* Error & Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
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
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Tag size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
            <Box>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Jak to funguje?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Vytvořte si témata jako "marketing", "fitness", "daně", "web development"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • U projektů pak můžete přiřadit téma
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Témata se zobrazují jako barevné chipy pro snadnou orientaci
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add Button */}
      <Box sx={{ mb: 3 }}>
        <ResponsiveButton
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Přidat téma
        </ResponsiveButton>
      </Box>

      {/* Themes List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Moje témata ({themes.length})
          </Typography>

          {themes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Zatím nemáte žádná témata
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Klikněte na tlačítko výše a přidejte své první téma
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {themes.map((projectTheme, index) => (
                <Box key={projectTheme.id}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      px: 0,
                    }}
                  >
                    {/* Theme chip preview */}
                    <Chip
                      label={projectTheme.name}
                      size="small"
                      sx={{
                        bgcolor: projectTheme.color || 'primary.main',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(projectTheme)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(projectTheme.id, projectTheme.name)}
                        sx={{ color: 'error.main' }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < themes.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTheme ? 'Upravit téma' : 'Přidat téma'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Název tématu"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              fullWidth
              autoFocus
              placeholder="např. marketing, fitness, daně..."
            />

            <TextField
              label="Barva chipu (volitelné)"
              value={themeColor}
              onChange={(e) => {
                let value = e.target.value;
                // Auto-add # if user enters hex code without it
                if (value && !value.startsWith('#') && /^[0-9A-Fa-f]+$/.test(value)) {
                  value = '#' + value;
                }
                setThemeColor(value);
              }}
              fullWidth
              placeholder="#3B82F6 nebo 3B82F6"
              helperText="Zadejte hex kód barvy (# se doplní automaticky). Pokud nevyplníte, použije se primární barva."
            />

            {/* Preview */}
            {themeName && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Náhled:
                </Typography>
                <Chip
                  label={themeName}
                  sx={{
                    bgcolor: themeColor || 'primary.main',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <ResponsiveButton onClick={handleCloseDialog} variant="outlined">
            Zrušit
          </ResponsiveButton>
          <ResponsiveButton
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Ukládám...' : editingTheme ? 'Uložit' : 'Přidat'}
          </ResponsiveButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThemesSettingsPage;
