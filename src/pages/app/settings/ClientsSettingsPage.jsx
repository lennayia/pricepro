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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Users, Image, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  uploadClientLogo,
  deleteClientLogo,
} from '../../../services/clients';
import { INFO_CARD_STYLES } from '../../../constants/colors';

const ClientsSettingsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEnded, setShowEnded] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientColor, setClientColor] = useState('');
  const [clientStartDate, setClientStartDate] = useState('');
  const [clientEndDate, setClientEndDate] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getClients(user.id, true); // Include ended clients
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Nepodařilo se načíst klienty.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client = null) => {
    setEditingClient(client);
    setClientName(client?.name || '');
    setClientColor(client?.color || '');
    setClientStartDate(client?.start_date || '');
    setClientEndDate(client?.end_date || '');
    setClientNotes(client?.notes || '');
    setLogoPreview(client?.logo_url || '');
    setLogoFile(null);
    setRemoveLogo(false);
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
    setClientName('');
    setClientColor('');
    setClientStartDate('');
    setClientEndDate('');
    setClientNotes('');
    setLogoFile(null);
    setLogoPreview('');
    setRemoveLogo(false);
    setError('');
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50KB)
    if (file.size > 50 * 1024) {
      setError('Logo je příliš velké. Maximální velikost je 50 KB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Neplatný formát. Povolené formáty: PNG, JPG, WEBP, HEIC.');
      return;
    }

    // Validate image dimensions (max 50x50px)
    try {
      const dimensions = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('Nepodařilo se načíst obrázek.'));
        img.src = URL.createObjectURL(file);
      });

      if (dimensions.width > 50 || dimensions.height > 50) {
        setError('Logo je příliš velké. Maximální rozměry jsou 50×50 px.');
        return;
      }
    } catch (err) {
      setError('Nepodařilo se načíst obrázek.');
      return;
    }

    setLogoFile(file);
    setRemoveLogo(false);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setRemoveLogo(true);
    setError('');
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      setError('Vyplňte název klienta.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let clientId;

      if (editingClient) {
        // Update existing client
        await updateClient(editingClient.id, {
          name: clientName.trim(),
          color: clientColor || null,
          start_date: clientStartDate || null,
          end_date: clientEndDate || null,
          notes: clientNotes || null,
        });
        clientId = editingClient.id;
        setSuccess('Klient byl úspěšně aktualizován.');
      } else {
        // Create new client
        const newClient = await createClient(user.id, {
          name: clientName.trim(),
          color: clientColor || null,
          start_date: clientStartDate || null,
          end_date: clientEndDate || null,
          notes: clientNotes || null,
        });
        clientId = newClient.id;
        setSuccess('Klient byl úspěšně vytvořen.');
      }

      // Handle logo upload/removal
      if (removeLogo && editingClient?.logo_url) {
        // Remove existing logo
        await deleteClientLogo(user.id, clientId);
      } else if (logoFile) {
        // Upload new logo
        await uploadClientLogo(user.id, clientId, logoFile);
      }

      handleCloseDialog();
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving client:', err);
      setError(err.message || 'Nepodařilo se uložit klienta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId, clientName) => {
    if (!confirm(`Opravdu chcete smazat klienta "${clientName}"?`)) {
      return;
    }

    try {
      await deleteClient(clientId);
      setSuccess('Klient byl úspěšně smazán.');
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Nepodařilo se smazat klienta.');
    }
  };

  // Filter clients based on showEnded checkbox
  const filteredClients = showEnded
    ? clients
    : clients.filter(c => !c.end_date);

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
        <Typography variant="h4">Správa klientů</Typography>
        <Typography color="text.secondary">
          Spravujte své klienty a jejich údaje.
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
            <Users size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
            <Box>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Jak to funguje?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Přidejte klienty, se kterými spolupracujete
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • V trackeru pak můžete vybrat klienta pro danou práci
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Ve výsledcích uvidíte přehled práce podle klientů
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add Button & Filter */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <ResponsiveButton
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Přidat klienta
        </ResponsiveButton>

        <FormControlLabel
          control={
            <Checkbox
              checked={showEnded}
              onChange={(e) => setShowEnded(e.target.checked)}
            />
          }
          label="Zobrazit ukončené spolupráce"
        />
      </Box>

      {/* Clients List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Moji klienti ({filteredClients.length})
          </Typography>

          {filteredClients.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {showEnded ? 'Zatím nemáte žádné klienty' : 'Zatím nemáte žádné aktivní klienty'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Klikněte na tlačítko výše a přidejte svého prvního klienta
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredClients.map((client, index) => (
                <Box key={client.id}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      px: 0,
                    }}
                  >
                    {/* Logo or color indicator */}
                    {client.logo_url ? (
                      <Box
                        component="img"
                        src={client.logo_url}
                        alt={client.name}
                        sx={{
                          width: 32,
                          height: 32,
                          objectFit: 'contain',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          flexShrink: 0,
                        }}
                      />
                    ) : client.color ? (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: client.color,
                          flexShrink: 0,
                        }}
                      />
                    ) : null}

                    {/* Client name */}
                    <Box sx={{ flex: 1 }}>
                      <Typography>{client.name}</Typography>
                      {client.end_date && (
                        <Typography variant="caption" color="text.secondary">
                          Ukončeno: {new Date(client.end_date).toLocaleDateString('cs-CZ')}
                        </Typography>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(client)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(client.id, client.name)}
                        sx={{ color: 'error.main' }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < filteredClients.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClient ? 'Upravit klienta' : 'Přidat klienta'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Název klienta"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              fullWidth
              autoFocus
              placeholder="např. Anna Nováková, Firma XYZ..."
            />

            {/* Logo Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Logo (volitelné)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nahrajte logo klienta. Max 50 KB, max 50×50 px. Formáty: PNG, JPG, WEBP, HEIC.
              </Typography>

              {logoPreview && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Logo preview"
                    sx={{
                      width: 50,
                      height: 50,
                      objectFit: 'contain',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {logoFile ? logoFile.name : 'Aktuální logo'}
                    </Typography>
                    {logoFile && (
                      <Typography variant="caption" color="text.secondary">
                        {(logoFile.size / 1024).toFixed(1)} KB
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleRemoveLogo}
                    sx={{ color: 'error.main' }}
                  >
                    <X size={18} />
                  </IconButton>
                </Box>
              )}

              <input
                accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <ResponsiveButton
                  component="span"
                  variant="outlined"
                  startIcon={<Image size={18} />}
                  fullWidth
                >
                  {logoPreview ? 'Změnit logo' : 'Nahrát logo'}
                </ResponsiveButton>
              </label>
            </Box>

            <TextField
              label="Barva (volitelné)"
              value={clientColor}
              onChange={(e) => {
                let value = e.target.value;
                // Auto-add # if user enters hex code without it
                if (value && !value.startsWith('#') && /^[0-9A-Fa-f]+$/.test(value)) {
                  value = '#' + value;
                }
                setClientColor(value);
              }}
              fullWidth
              placeholder="#3B82F6 nebo 3B82F6"
              helperText="Použije se, pokud není nahrané logo. Zadejte hex kód (# se doplní automaticky)."
            />

            <TextField
              label="Datum začátku spolupráce (volitelné)"
              type="date"
              value={clientStartDate}
              onChange={(e) => setClientStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Datum konce spolupráce (volitelné)"
              type="date"
              value={clientEndDate}
              onChange={(e) => setClientEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Nevyplňujte, pokud spolupráce pokračuje"
            />

            <TextField
              label="Poznámky (volitelné)"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Kontaktní údaje, poznámky..."
            />
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
            {saving ? 'Ukládám...' : editingClient ? 'Uložit' : 'Přidat'}
          </ResponsiveButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsSettingsPage;
