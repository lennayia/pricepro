import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  Button,
  ButtonGroup,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ResponsiveButton } from '../../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Briefcase, Image, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectLogo,
  deleteProjectLogo,
} from '../../../services/projects';
import { getProjectThemes } from '../../../services/projectThemes';
import { INFO_CARD_STYLES } from '../../../constants/colors';

const ProjectsSettingsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEnded, setShowEnded] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('other');
  const [projectTheme, setProjectTheme] = useState(null);
  const [projectStatus, setProjectStatus] = useState('active');
  const [projectColor, setProjectColor] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load projects and themes on mount
  useEffect(() => {
    loadProjectsAndThemes();
  }, [user]);

  const loadProjectsAndThemes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [projectsData, themesData] = await Promise.all([
        getProjects(user.id, false, true), // includeArchived=false, includeEnded=true
        getProjectThemes(user.id),
      ]);
      setProjects(projectsData);
      setThemes(themesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Nepodařilo se načíst data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project = null) => {
    setEditingProject(project);
    setProjectName(project?.name || '');
    setProjectType(project?.type || 'other');
    setProjectTheme(project?.theme || null);
    setProjectStatus(project?.status || 'active');
    setProjectColor(project?.color || '');
    setProjectStartDate(project?.start_date || '');
    setProjectEndDate(project?.end_date || '');
    setLogoPreview(project?.logo_url || '');
    setLogoFile(null);
    setRemoveLogo(false);
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setProjectName('');
    setProjectType('other');
    setProjectTheme(null);
    setProjectStatus('active');
    setProjectColor('');
    setProjectStartDate('');
    setProjectEndDate('');
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
    if (!projectName.trim()) {
      setError('Vyplňte název projektu.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let projectId;

      if (editingProject) {
        // Update existing project
        await updateProject(editingProject.id, {
          name: projectName.trim(),
          type: projectType,
          theme_id: projectTheme?.id || null,
          status: projectStatus,
          color: projectColor || null,
          start_date: projectStartDate || null,
          end_date: projectEndDate || null,
        });
        projectId = editingProject.id;
        setSuccess('Projekt byl úspěšně aktualizován.');
      } else {
        // Create new project
        const newProject = await createProject(user.id, {
          name: projectName.trim(),
          type: projectType,
          theme_id: projectTheme?.id || null,
          status: projectStatus,
          color: projectColor || null,
          start_date: projectStartDate || null,
          end_date: projectEndDate || null,
        });
        projectId = newProject.id;
        setSuccess('Projekt byl úspěšně vytvořen.');
      }

      // Handle logo upload/removal
      if (removeLogo && editingProject?.logo_url) {
        // Remove existing logo
        await deleteProjectLogo(user.id, projectId);
      } else if (logoFile) {
        // Upload new logo
        await uploadProjectLogo(user.id, projectId, logoFile);
      }

      handleCloseDialog();
      loadProjectsAndThemes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.message || 'Nepodařilo se uložit projekt.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (!confirm(`Opravdu chcete smazat projekt "${projectName}"?`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      setSuccess('Projekt byl úspěšně smazán.');
      loadProjectsAndThemes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Nepodařilo se smazat projekt.');
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

        <Typography variant="h4">Správa projektů a klientů</Typography>
        <Typography color="text.secondary">
          Vytvořte si seznam projektů a klientů pro lepší organizaci vašeho času.
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
            <Briefcase size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
            <Box>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Jak to funguje?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Vytvořte si projekty nebo klienty (např. "Klient Anna", "Můj kurz XY")
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • V trackeru pak u každé kategorie můžete vybrat, pro který projekt jste pracovali
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                • Ve výsledcích uvidíte přehled podle projektů i podle kategorií
              </Typography>

              <Typography fontWeight={600} sx={{ mb: 1, mt: 2 }}>
                Typy projektů:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                💼 <strong>Fakturovatelný (1:1 práce)</strong> - Veškerá práce pro konkrétního klienta včetně příprav, rešerší, konzultací, follow-upů. Počítá se do kalkulačky hodinovky.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                📈 <strong>Škálovatelný (investice)</strong> - Tvorba digiproduktu, kurzů, MLM, affiliate. Negeneruje hodinovku, ale pasivní příjem, který snižuje potřebu fakturovatelných hodin.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🔧 <strong>Ostatní (režie)</strong> - Okamžitě nefakturovatelné náklady businessu (administrativa, obecné vzdělávání, networking). Rozpouští se do hodinovky jako overhead.
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
          Přidat projekt/klienta
        </ResponsiveButton>

        <FormControlLabel
          control={
            <Checkbox
              checked={showEnded}
              onChange={(e) => setShowEnded(e.target.checked)}
            />
          }
          label="Zobrazit ukončené projekty"
        />
      </Box>

      {/* Projects List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Moje projekty a klienti ({projects.filter(p => showEnded || (p.status !== 'completed' && p.status !== 'cancelled')).length})
          </Typography>

          {projects.filter(p => showEnded || (p.status !== 'completed' && p.status !== 'cancelled')).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {showEnded ? 'Zatím nemáte žádné projekty' : 'Zatím nemáte žádné aktivní projekty'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Klikněte na tlačítko výše a přidejte svůj první projekt nebo klienta
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {projects
                .filter(p => showEnded || (p.status !== 'completed' && p.status !== 'cancelled'))
                .map((project, index) => (
                <Box key={project.id}>
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
                    {project.logo_url ? (
                      <Box
                        component="img"
                        src={project.logo_url}
                        alt={project.name}
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
                    ) : project.color ? (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: project.color,
                          flexShrink: 0,
                        }}
                      />
                    ) : null}

                    {/* Project name & details */}
                    <Box sx={{ flex: 1 }}>
                      <Typography>{project.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Theme chip */}
                        {project.theme && (
                          <Chip
                            label={project.theme.name}
                            size="small"
                            sx={{
                              bgcolor: project.theme.color || 'primary.main',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        )}
                        {/* Status badge */}
                        <Typography variant="caption" color="text.secondary">
                          {project.status === 'active' && '● Aktivní'}
                          {project.status === 'paused' && '⏸ Pozastavený'}
                          {project.status === 'completed' && '✓ Dokončený'}
                          {project.status === 'cancelled' && '✗ Zrušený'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(project)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(project.id, project.name)}
                        sx={{ color: 'error.main' }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < projects.filter(p => showEnded || (p.status !== 'completed' && p.status !== 'cancelled')).length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Upravit projekt' : 'Přidat projekt/klienta'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Název projektu/klienta"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
              autoFocus
              placeholder="např. Klient Anna, Kurz XYZ..."
            />

            {/* Logo Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Logo (volitelné)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nahrajte logo klienta nebo projektu. Max 50 KB, max 50×50 px. Formáty: PNG, JPG, WEBP, HEIC.
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

            {/* Project Type */}
            <FormControl fullWidth>
              <InputLabel>Typ projektu</InputLabel>
              <Select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                label="Typ projektu"
              >
                <MenuItem value="billable">💼 Fakturovatelný (1:1 práce)</MenuItem>
                <MenuItem value="scalable">📈 Škálovatelný (investice)</MenuItem>
                <MenuItem value="other">🔧 Ostatní (režie)</MenuItem>
              </Select>
              <FormHelperText>
                {projectType === 'billable' && 'Práce pro klienta včetně příprav a follow-upů. Jde přímo do kalkulačky hodinovky.'}
                {projectType === 'scalable' && 'Digiprodukty, kurzy, MLM. Generuje pasivní příjem místo hodinovky.'}
                {projectType === 'other' && 'Administrativa, networking, vzdělávání. Rozpouští se do hodinovky jako overhead.'}
              </FormHelperText>
            </FormControl>

            {/* Theme Selection */}
            <Autocomplete
              value={projectTheme}
              onChange={(e, newValue) => setProjectTheme(newValue)}
              options={themes}
              getOptionLabel={(option) => option.name || ''}
              renderInput={(params) => (
                <TextField {...params} label="Téma (volitelné)" />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Chip
                    label={option.name}
                    size="small"
                    sx={{
                      bgcolor: option.color || 'primary.main',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                    sx={{
                      bgcolor: option.color || 'primary.main',
                      color: 'white',
                    }}
                  />
                ))
              }
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="active">Aktivní</MenuItem>
                <MenuItem value="paused">Pozastavený</MenuItem>
                <MenuItem value="completed">Dokončený</MenuItem>
                <MenuItem value="cancelled">Zrušený</MenuItem>
              </Select>
            </FormControl>

            {/* Dates */}
            <TextField
              label="Datum začátku (volitelné)"
              type="date"
              value={projectStartDate}
              onChange={(e) => setProjectStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Datum konce (volitelné)"
              type="date"
              value={projectEndDate}
              onChange={(e) => setProjectEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Nevyplňujte, pokud projekt pokračuje"
            />

            <TextField
              label="Barva (volitelné)"
              value={projectColor}
              onChange={(e) => {
                let value = e.target.value;
                // Auto-add # if user enters hex code without it
                if (value && !value.startsWith('#') && /^[0-9A-Fa-f]+$/.test(value)) {
                  value = '#' + value;
                }
                setProjectColor(value);
              }}
              fullWidth
              placeholder="#3B82F6 nebo 3B82F6"
              helperText="Použije se, pokud není nahrané logo. Zadejte hex kód (# se doplní automaticky)."
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
            {saving ? 'Ukládám...' : editingProject ? 'Uložit' : 'Přidat'}
          </ResponsiveButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsSettingsPage;
