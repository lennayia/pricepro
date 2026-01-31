import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  Autocomplete,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from '@mui/material';
import { ResponsiveButton, NumberInput } from '../../../components/ui';
import { ArrowLeft, Save, AlertTriangle, CheckCircle, Lightbulb, Plus, X, Image } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useWeek } from '../../../contexts/WeekContext';
import { getTimeEntry, upsertTimeEntry, getTimeEntries } from '../../../services/timeEntries';
import { getProjects, createProject, uploadProjectLogo } from '../../../services/projects';
import { getClients } from '../../../services/clients';
import { supabase } from '../../../services/supabase';
import { getDateForDayInWeek, formatDateWithDayName } from '../../../utils/dateHelpers';
import { WORK_CATEGORIES, PERSONAL_CATEGORIES } from '../../../constants/categories';
import { calculateTotalHours, calculateWorkHours, calculatePersonalHours } from '../../../utils/calculators';
import { formatHours } from '../../../utils/formatters';
import { TIME_CONSTANTS } from '../../../constants/healthThresholds';
import { COLORS, INFO_CARD_STYLES } from '../../../constants/colors';

// Kategorie jsou nyní importované z constants/categories.js
const categories = [...WORK_CATEGORIES, ...PERSONAL_CATEGORIES];

const dayNames = ['', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

const TrackerDayPage = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedWeekStart } = useWeek();
  const theme = useTheme();
  const day = parseInt(dayNumber, 10);

  // Get the actual date for this day in the selected week
  const actualDate = getDateForDayInWeek(day, selectedWeekStart);
  const formattedDate = formatDateWithDayName(actualDate);

  // Personal categories still use simple form data (no projects)
  const [formData, setFormData] = useState(
    PERSONAL_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: '' }), {})
  );

  // Work categories use project rows: { categoryKey: [{ projectId: '123', hours: 2 }] }
  const [categoryProjectRows, setCategoryProjectRows] = useState(
    WORK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: [] }), {})
  );

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [trackPersonalTime, setTrackPersonalTime] = useState(true); // Default true
  const [filledDaysCount, setFilledDaysCount] = useState(0); // Count of days with tracked hours
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New project dialog state
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('client');
  const [newProjectColor, setNewProjectColor] = useState('');
  const [newProjectLogoFile, setNewProjectLogoFile] = useState(null);
  const [newProjectLogoPreview, setNewProjectLogoPreview] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState('');
  const [pendingProjectSelection, setPendingProjectSelection] = useState(null); // { categoryKey, rowIndex }

  // Load projects, clients, and user settings
  useEffect(() => {
    const loadProjectsAndClientsAndSettings = async () => {
      if (!user) return;
      try {
        // Load projects and clients
        const [projectsData, clientsData] = await Promise.all([
          getProjects(user.id),
          getClients(user.id)
        ]);
        setProjects(projectsData);
        setClients(clientsData);

        // Load user settings (track_personal_time)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('track_personal_time')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error loading user settings:', userError);
        } else if (userData) {
          setTrackPersonalTime(userData.track_personal_time ?? true);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadProjectsAndClientsAndSettings();
  }, [user]);

  // Count filled days for smart alert logic
  useEffect(() => {
    const countFilledDays = async () => {
      if (!user) return;
      try {
        const allEntries = await getTimeEntries(user.id);

        // Count entries that have at least some hours tracked
        const filled = allEntries.filter(entry => {
          const totalHours = WORK_CATEGORIES.reduce((sum, cat) => sum + (parseFloat(entry[cat.key]) || 0), 0) +
                            PERSONAL_CATEGORIES.reduce((sum, cat) => sum + (parseFloat(entry[cat.key]) || 0), 0);
          return totalHours > 0;
        });

        setFilledDaysCount(filled.length);
      } catch (err) {
        console.error('Error counting filled days:', err);
      }
    };

    countFilledDays();
  }, [user]);

  // Load existing data for this day
  useEffect(() => {
    const loadDayData = async () => {
      if (!user || isNaN(day) || day < 1 || day > 7) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const entry = await getTimeEntry(user.id, actualDate);

        if (entry) {
          // Load personal categories (simple form data)
          const loadedData = PERSONAL_CATEGORIES.reduce((acc, cat) => {
            acc[cat.key] = entry[cat.key] || '';
            return acc;
          }, {});
          setFormData(loadedData);

          // Load work categories with project rows
          const loadedProjectRows = {};
          WORK_CATEGORIES.forEach(cat => {
            const categoryKey = cat.key;
            const projectHours = entry.category_project_hours?.[categoryKey] || {};
            const projectClients = entry.category_project_clients?.[categoryKey] || {};

            // Convert DB format { projectId: hours } to array [{ projectId, clientId, hours }]
            const rows = Object.entries(projectHours).map(([projectId, hours]) => ({
              projectId,
              clientId: projectClients[projectId] || '',
              hours: hours || 0
            }));

            loadedProjectRows[categoryKey] = rows.length > 0 ? rows : [];
          });
          setCategoryProjectRows(loadedProjectRows);
        }
      } catch (err) {
        console.error('Error loading day data:', err);
        setError('Nepodařilo se načíst data. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    };

    loadDayData();
  }, [user, day, actualDate, selectedWeekStart]);

  // Validate day number
  if (isNaN(day) || day < 1 || day > 7) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error">
          Neplatný den
        </Typography>
        <ResponsiveButton
          onClick={() => navigate('/app/tracker')}
          sx={{ mt: 2 }}
        >
          Zpět na tracker
        </ResponsiveButton>
      </Box>
    );
  }

  const handleChange = (key, value) => {
    // Only allow positive numbers between 0 and TIME_CONSTANTS.HOURS_IN_DAY
    if (value === '' || value === null || value === undefined) {
      setFormData((prev) => ({ ...prev, [key]: '' }));
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setFormData((prev) => ({ ...prev, [key]: '' }));
      return;
    }
    const numValue = Math.max(0, Math.min(TIME_CONSTANTS.HOURS_IN_DAY, parsed));
    setFormData((prev) => ({ ...prev, [key]: numValue }));
  };

  // Výpočty jsou nyní v utils/calculators.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Calculate work category totals from project rows
    const workCategoryTotals = {};
    WORK_CATEGORIES.forEach(cat => {
      const rows = categoryProjectRows[cat.key] || [];
      const total = rows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0);
      workCategoryTotals[cat.key] = total;
    });

    // Combine work and personal data
    const allData = { ...workCategoryTotals, ...formData };

    // Validate that at least one field has a value
    const hasData = Object.values(allData).some(val => parseFloat(val) > 0);
    if (!hasData) {
      setError('Vyplňte prosím alespoň jednu aktivitu.');
      return;
    }

    // Validate total hours doesn't exceed TIME_CONSTANTS.HOURS_IN_DAY (only if tracking personal time)
    if (trackPersonalTime) {
      const totalHours = calculateTotalHours(allData);
      if (totalHours > TIME_CONSTANTS.HOURS_IN_DAY) {
        setError(`Součet hodin nemůže překročit ${TIME_CONSTANTS.HOURS_IN_DAY} hodin za den. Aktuálně: ${formatHours(totalHours)}h`);
        return;
      }
    }

    setSaving(true);

    try {
      // Convert to DB format
      const dataToSave = {};

      // Add work category totals (calculated from project rows)
      WORK_CATEGORIES.forEach(cat => {
        dataToSave[cat.key] = workCategoryTotals[cat.key] || 0;
      });

      // Add personal categories
      PERSONAL_CATEGORIES.forEach(cat => {
        dataToSave[cat.key] = parseFloat(formData[cat.key]) || 0;
      });

      // Convert project rows to DB format
      const category_projects = {};
      const category_project_hours = {};
      const category_project_clients = {};

      WORK_CATEGORIES.forEach(cat => {
        const rows = categoryProjectRows[cat.key] || [];
        if (rows.length > 0) {
          const projectIds = rows.map(row => row.projectId).filter(Boolean);
          const projectHours = {};
          const projectClients = {};

          rows.forEach(row => {
            if (row.projectId && row.hours > 0) {
              projectHours[row.projectId] = parseFloat(row.hours);
              if (row.clientId) {
                projectClients[row.projectId] = row.clientId;
              }
            }
          });

          if (projectIds.length > 0) {
            category_projects[cat.key] = projectIds;
            category_project_hours[cat.key] = projectHours;
            if (Object.keys(projectClients).length > 0) {
              category_project_clients[cat.key] = projectClients;
            }
          }
        }
      });

      dataToSave.category_projects = category_projects;
      dataToSave.category_project_hours = category_project_hours;
      dataToSave.category_project_clients = category_project_clients;

      await upsertTimeEntry(user.id, actualDate, dataToSave);

      // Update filled days count (increment if this was a new entry with data)
      if (hasData) {
        setFilledDaysCount(prev => {
          // Simple increment - actual count will be recalculated on next load
          return prev + 1;
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/app/tracker');
      }, 1500);
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message || 'Nepodařilo se uložit data. Zkuste to prosím znovu.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals from both work project rows and personal form data
  const workHours = useMemo(() => {
    let total = 0;
    WORK_CATEGORIES.forEach(cat => {
      const rows = categoryProjectRows[cat.key] || [];
      const catTotal = rows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0);
      total += catTotal;
    });
    return total;
  }, [categoryProjectRows]);

  const personalHours = useMemo(() => {
    return trackPersonalTime ? calculatePersonalHours(formData) : 0;
  }, [formData, trackPersonalTime]);
  const totalHours = useMemo(() => workHours + personalHours, [workHours, personalHours]);
  const sleepHours = useMemo(() => parseFloat(formData.sleep) || 0, [formData.sleep]);

  // Remove project row from category
  const handleRemoveProjectRow = (categoryKey, rowIndex) => {
    setCategoryProjectRows(prev => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || []).filter((_, index) => index !== rowIndex)
    }));
  };

  // Update client ID in row
  const handleUpdateClientId = (categoryKey, rowIndex, clientId) => {
    setCategoryProjectRows(prev => {
      const rows = [...(prev[categoryKey] || [])];
      rows[rowIndex] = { ...rows[rowIndex], clientId };
      return { ...prev, [categoryKey]: rows };
    });
  };

  // Update project ID in row
  const handleUpdateProjectId = (categoryKey, rowIndex, projectId) => {
    setCategoryProjectRows(prev => {
      const rows = [...(prev[categoryKey] || [])];
      rows[rowIndex] = { ...rows[rowIndex], projectId };
      return { ...prev, [categoryKey]: rows };
    });
  };

  // Update hours in row
  const handleUpdateProjectHours = (categoryKey, rowIndex, hours) => {
    setCategoryProjectRows(prev => {
      const rows = [...(prev[categoryKey] || [])];
      rows[rowIndex] = { ...rows[rowIndex], hours: parseFloat(hours) || 0 };
      return { ...prev, [categoryKey]: rows };
    });
  };

  // Calculate total hours for a category
  const getCategoryTotal = (categoryKey) => {
    const rows = categoryProjectRows[categoryKey] || [];
    return rows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0);
  };

  // Handle opening create project dialog
  const handleOpenCreateProjectDialog = (categoryKey, rowIndex) => {
    setPendingProjectSelection({ categoryKey, rowIndex });
    setCreateProjectDialogOpen(true);
    setNewProjectName('');
    setNewProjectType('client');
    setNewProjectColor('');
    setNewProjectLogoFile(null);
    setNewProjectLogoPreview('');
    setCreateProjectError('');
  };

  // Handle logo upload
  const handleNewProjectLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50KB)
    if (file.size > 50 * 1024) {
      setCreateProjectError('Logo je příliš velké. Maximální velikost je 50 KB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setCreateProjectError('Neplatný formát. Povolené formáty: PNG, JPG, WEBP, HEIC.');
      return;
    }

    // Validate image dimensions (max 50x50px)
    try {
      const dimensions = await new Promise((resolve, reject) => {
        const img = new globalThis.Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('Nepodařilo se načíst obrázek.'));
        img.src = URL.createObjectURL(file);
      });

      if (dimensions.width > 50 || dimensions.height > 50) {
        setCreateProjectError('Logo je příliš velké. Maximální rozměry jsou 50×50 px.');
        return;
      }
    } catch (err) {
      setCreateProjectError('Nepodařilo se načíst obrázek.');
      return;
    }

    setNewProjectLogoFile(file);
    setCreateProjectError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProjectLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNewProjectLogo = () => {
    setNewProjectLogoFile(null);
    setNewProjectLogoPreview('');
  };

  // Handle creating new project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setCreateProjectError('Zadejte název projektu');
      return;
    }

    setCreatingProject(true);
    setCreateProjectError('');

    try {
      const newProject = await createProject(user.id, {
        name: newProjectName.trim()
      });

      // Add to projects list
      setProjects(prev => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));

      // If there was a pending selection, apply it
      if (pendingProjectSelection) {
        const { categoryKey, rowIndex } = pendingProjectSelection;
        const rows = categoryProjectRows[categoryKey] || [];
        const isEmptyRow = rowIndex === rows.length;

        if (isEmptyRow) {
          // Add new row with the new project
          setCategoryProjectRows(prev => ({
            ...prev,
            [categoryKey]: [...(prev[categoryKey] || []), { clientId: '', projectId: newProject.id, hours: 0 }]
          }));
        } else {
          // Update existing row
          handleUpdateProjectId(categoryKey, rowIndex, newProject.id);
        }
      }

      // Close dialog
      setCreateProjectDialogOpen(false);
      setNewProjectName('');
      setPendingProjectSelection(null);
    } catch (err) {
      console.error('Error creating project:', err);
      setCreateProjectError(err.message || 'Nepodařilo se vytvořit projekt');
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <Box>
      <ResponsiveButton
        startIcon={<ArrowLeft size={20} />}
        onClick={() => navigate('/app/tracker')}
        sx={{ mb: 2 }}
      >
        Zpět na přehled
      </ResponsiveButton>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">{formattedDate}</Typography>
        <Typography color="text.secondary">
          Zapište, kolik hodin jste tento den strávili jednotlivými činnostmi.
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

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
      <form onSubmit={handleSubmit}>
        {/* Work Section */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 0.5,
            color: 'primary.main'
          }}
        >
          Pracovní čas (v hodinách)
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          {WORK_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const rows = categoryProjectRows[category.key] || [];
            const categoryTotal = getCategoryTotal(category.key);

            return (
            <Card key={category.key} sx={{ overflow: 'hidden' }}>
              <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                {/* Category header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: rows.length > 0 ? 2 : 0 }}>
                  <Box sx={{ color: category.color || COLORS.neutral[600], flexShrink: 0 }}>
                    <Icon size={20} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {category.description}
                    </Typography>
                  </Box>
                  {categoryTotal > 0 && (
                    <Chip
                      label={`${formatHours(categoryTotal)}h`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

                {/* Project rows - always show filled + one empty row */}
                <Stack spacing={1}>
                  {/* Display all rows including the always-present empty row */}
                  {[...rows, { projectId: '', hours: 0 }].map((row, rowIndex) => {
                    const isEmptyRow = rowIndex === rows.length; // Last row is always empty
                    const hasProject = Boolean(row.projectId);

                    return (
                      <Box
                        key={rowIndex}
                        sx={{
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          pl: 3.5
                        }}
                      >
                        {/* Client Autocomplete */}
                        <Autocomplete
                          size="small"
                          value={clients.find(c => c.id === row.clientId) || null}
                          onChange={(e, newValue) => {
                            if (isEmptyRow && newValue) {
                              // Adding new row with selected client
                              setCategoryProjectRows(prev => ({
                                ...prev,
                                [category.key]: [...(prev[category.key] || []), { clientId: newValue.id, projectId: '', hours: 0 }]
                              }));
                            } else if (!isEmptyRow) {
                              // Updating existing row
                              handleUpdateClientId(category.key, rowIndex, newValue?.id || '');
                            }
                          }}
                          options={clients}
                          getOptionLabel={(option) => option.name || ''}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <li key={key} {...otherProps} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}>
                                {option.logo_url ? (
                                  <Box
                                    component="img"
                                    src={option.logo_url}
                                    alt={option.name}
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      objectFit: 'contain',
                                      borderRadius: 0.5,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : option.color ? (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: option.color,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <Box sx={{ width: 12, height: 12, flexShrink: 0 }} />
                                )}
                                {option.name}
                              </li>
                            );
                          }}
                          renderInput={(params) => {
                            const selectedClient = clients.find(c => c.id === row.clientId);
                            return (
                              <TextField
                                {...params}
                                placeholder={isEmptyRow ? "Klient" : "Vyberte klienta"}
                                size="small"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      {!isEmptyRow && selectedClient?.logo_url ? (
                                        <Box
                                          component="img"
                                          src={selectedClient.logo_url}
                                          alt={selectedClient.name}
                                          sx={{
                                            width: 16,
                                            height: 16,
                                            objectFit: 'contain',
                                            borderRadius: 0.5,
                                            ml: 1,
                                            mr: 0.5,
                                            flexShrink: 0,
                                          }}
                                        />
                                      ) : !isEmptyRow && selectedClient?.color ? (
                                        <Box
                                          sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            backgroundColor: selectedClient.color,
                                            ml: 1,
                                            mr: 0.5,
                                            flexShrink: 0,
                                          }}
                                        />
                                      ) : null}
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                              />
                            );
                          }}
                          sx={{ flex: 1 }}
                          disabled={saving || success}
                        />

                        {/* Project Autocomplete */}
                        <Autocomplete
                          size="small"
                          value={projects.find(p => p.id === row.projectId) || null}
                          onChange={(e, newValue) => {
                            // Check if "Create new" option was selected
                            if (newValue && newValue.id === '__create_new__') {
                              handleOpenCreateProjectDialog(category.key, rowIndex);
                              return;
                            }

                            if (isEmptyRow && newValue) {
                              // Adding new row with selected project
                              setCategoryProjectRows(prev => ({
                                ...prev,
                                [category.key]: [...(prev[category.key] || []), { clientId: '', projectId: newValue.id, hours: 0 }]
                              }));
                            } else if (!isEmptyRow) {
                              // Updating existing row
                              handleUpdateProjectId(category.key, rowIndex, newValue?.id || '');
                            }
                          }}
                          options={[
                            { id: '__create_new__', name: 'Vytvořit nový projekt' },
                            ...projects
                          ]}
                          getOptionLabel={(option) => option.name || ''}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <li key={key} {...otherProps} style={{
                                fontWeight: option.id === '__create_new__' ? 600 : 400,
                                color: option.id === '__create_new__' ? theme.palette.primary.main : 'inherit',
                                borderBottom: option.id === '__create_new__' ? '1px solid #e0e0e0' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}>
                                {option.id === '__create_new__' ? (
                                  <Plus size={16} />
                                ) : option.logo_url ? (
                                  <Box
                                    component="img"
                                    src={option.logo_url}
                                    alt={option.name}
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      objectFit: 'contain',
                                      borderRadius: 0.5,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : option.color ? (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: option.color,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <Box sx={{ width: 12, height: 12, flexShrink: 0 }} />
                                )}
                                {option.name}
                              </li>
                            );
                          }}
                          renderInput={(params) => {
                            const selectedProject = projects.find(p => p.id === row.projectId);
                            return (
                              <TextField
                                {...params}
                                placeholder={isEmptyRow ? "Projekt" : "Vyberte projekt"}
                                size="small"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      {!isEmptyRow && selectedProject?.logo_url ? (
                                        <Box
                                          component="img"
                                          src={selectedProject.logo_url}
                                          alt={selectedProject.name}
                                          sx={{
                                            width: 16,
                                            height: 16,
                                            objectFit: 'contain',
                                            borderRadius: 0.5,
                                            ml: 1,
                                            mr: 0.5,
                                            flexShrink: 0,
                                          }}
                                        />
                                      ) : !isEmptyRow && selectedProject?.color ? (
                                        <Box
                                          sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            backgroundColor: selectedProject.color,
                                            ml: 1,
                                            mr: 0.5,
                                            flexShrink: 0,
                                          }}
                                        />
                                      ) : null}
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                              />
                            );
                          }}
                          sx={{ flex: 1 }}
                          disabled={saving || success}
                        />

                        {/* Theme chip - show when project has a theme */}
                        {!isEmptyRow && projects.find(p => p.id === row.projectId)?.theme && (
                          <Chip
                            label={projects.find(p => p.id === row.projectId).theme.name}
                            size="small"
                            sx={{
                              bgcolor: projects.find(p => p.id === row.projectId).theme.color || 'primary.main',
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <NumberInput
                            value={isEmptyRow ? '' : row.hours}
                            onChange={(value) => {
                              const numValue = parseFloat(value) || 0;
                              if (isEmptyRow && numValue > 0) {
                                // Create new row when user enters hours in empty row
                                setCategoryProjectRows(prev => ({
                                  ...prev,
                                  [category.key]: [...(prev[category.key] || []), { clientId: '', projectId: '', hours: numValue }]
                                }));
                              } else if (!isEmptyRow) {
                                handleUpdateProjectHours(category.key, rowIndex, value);
                              }
                            }}
                            placeholder="0"
                            min={0}
                            max={TIME_CONSTANTS.HOURS_IN_DAY}
                            step={0.5}
                            size="small"
                            sx={{ width: 90 }}
                            disabled={saving || success}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            h
                          </Typography>
                        </Box>
                        {hasProject && !isEmptyRow && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveProjectRow(category.key, rowIndex)}
                            disabled={saving || success}
                            sx={{ color: 'error.main' }}
                          >
                            <X size={18} />
                          </IconButton>
                        )}
                        {/* Spacer to keep alignment when no X button */}
                        {(!hasProject || isEmptyRow) && (
                          <Box sx={{ width: 34 }} />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
            );
          })}
        </Stack>

        {/* Personal Life Section - only show if user wants to track personal time */}
        {trackPersonalTime && (
          <>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: 0.5,
                color: 'text.primary'
              }}
            >
              Osobní život (v hodinách)
            </Typography>
            <Stack spacing={2} sx={{ mb: 4 }}>
              {PERSONAL_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                <Card
                  key={category.key}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          color: category.color || COLORS.neutral[600],
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={24} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {category.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                          {category.description}
                        </Typography>
                      </Box>
                      <Box sx={{ alignSelf: 'flex-end' }}>
                        <NumberInput
                          value={formData[category.key]}
                          onChange={(value) => handleChange(category.key, value)}
                          placeholder="0"
                          min={0}
                          max={TIME_CONSTANTS.HOURS_IN_DAY}
                          step={0.5}
                          size="small"
                          sx={{ width: 75 }}
                          disabled={saving || success}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                );
              })}
            </Stack>
          </>
        )}

        {/* Summary */}
        <Card
          sx={{
            mb: 4,
            bgcolor: totalHours > TIME_CONSTANTS.HOURS_IN_DAY
              ? COLORS.error.main
              : sleepHours < 6 && sleepHours > 0
              ? COLORS.warning.main
              : workHours > 10
              ? COLORS.warning.dark
              : INFO_CARD_STYLES[theme.palette.mode].bgcolor,
            border: totalHours > TIME_CONSTANTS.HOURS_IN_DAY ||
              (sleepHours < 6 && sleepHours > 0) ||
              workHours > 10
              ? 'none'
              : INFO_CARD_STYLES[theme.palette.mode].border,
            color: totalHours > TIME_CONSTANTS.HOURS_IN_DAY ||
              (sleepHours < 6 && sleepHours > 0) ||
              workHours > 10
              ? 'white'
              : 'text.primary',
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Celkem dnes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatHours(totalHours)} / {TIME_CONSTANTS.HOURS_IN_DAY} hod
              </Typography>
            </Box>

            {/* Work vs Personal breakdown */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Práce
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatHours(workHours)}h
                </Typography>
              </Box>
              {trackPersonalTime && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Osobní život
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatHours(personalHours)}h
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Zbývá
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatHours(TIME_CONSTANTS.HOURS_IN_DAY - totalHours)}h
                </Typography>
              </Box>
            </Box>

            {/* Smart feedback - New logic: extreme alerts immediately, general alerts after 5+ days */}
            {totalHours > TIME_CONSTANTS.HOURS_IN_DAY ? (
              // VALIDATION ERROR - always show
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Pozor! Den má pouze {TIME_CONSTANTS.HOURS_IN_DAY} hodin. Zkontrolujte prosím své údaje.
                </Typography>
              </Box>
            ) : sleepHours < 5 && sleepHours > 0 ? (
              // EXTREME ALERT - show immediately (even on day 1)
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  KRITICKY! Spíte méně než 5 hodin - vysoké riziko vyhoření!
                </Typography>
              </Box>
            ) : workHours > 12 ? (
              // EXTREME ALERT - show immediately (even on day 1)
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  KRITICKY! Pracujete více než 12 hodin - riziko vyhoření!
                </Typography>
              </Box>
            ) : filledDaysCount >= 5 ? (
              // GENERAL ALERTS - only show after 5+ filled days
              sleepHours < 6 && sleepHours > 0 ? (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertTriangle size={16} color="white" />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Pozor! Spíte méně než 6 hodin - riziko vyhoření!
                  </Typography>
                </Box>
              ) : workHours > 10 ? (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertTriangle size={16} color="white" />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Hodně práce dnes ({formatHours(workHours)}h). Najděte si čas na odpočinek!
                  </Typography>
                </Box>
              ) : sleepHours >= 7 && sleepHours <= 8 && personalHours >= 2 && workHours <= 10 ? (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={16} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                  <Typography variant="body2">
                    Skvělý balanc! Spánek i osobní čas v pořádku.
                  </Typography>
                </Box>
              ) : sleepHours === 0 && personalHours === 0 && workHours > 0 ? (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb size={16} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
                  <Typography variant="body2">
                    Nezapomeňte vyplnit spánek a osobní čas pro kompletní přehled!
                  </Typography>
                </Box>
              ) : null
            ) : null}
          </CardContent>
        </Card>

        {/* Info o klientech a projektech */}
        {(projects.length === 0 || clients.length === 0) && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              💡 {projects.length === 0 && clients.length === 0 ? (
                <>
                  Nemáte žádné klienty ani projekty.{' '}
                  <a
                    href="/app/nastaveni/klienti"
                    onClick={(e) => { e.preventDefault(); navigate('/app/nastaveni/klienti'); }}
                    style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Vytvořte si klienty
                  </a>
                  {' '}a{' '}
                  <a
                    href="/app/nastaveni/projekty"
                    onClick={(e) => { e.preventDefault(); navigate('/app/nastaveni/projekty'); }}
                    style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    projekty v nastavení
                  </a>.
                </>
              ) : projects.length === 0 ? (
                <>
                  Nemáte žádné projekty.{' '}
                  <a
                    href="/app/nastaveni/projekty"
                    onClick={(e) => { e.preventDefault(); navigate('/app/nastaveni/projekty'); }}
                    style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Vytvořte si je v nastavení
                  </a>.
                </>
              ) : (
                <>
                  Nemáte žádné klienty.{' '}
                  <a
                    href="/app/nastaveni/klienti"
                    onClick={(e) => { e.preventDefault(); navigate('/app/nastaveni/klienti'); }}
                    style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Vytvořte si je v nastavení
                  </a>.
                </>
              )}
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <ResponsiveButton
            variant="outlined"
            onClick={() => navigate('/app/tracker')}
            disabled={saving}
          >
            Zrušit
          </ResponsiveButton>
          <ResponsiveButton
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save size={20} />}
            disabled={saving || success}
          >
            {saving ? 'Ukládám...' : 'Uložit'}
          </ResponsiveButton>
        </Box>
      </form>
      )}

      {/* Create Project Dialog */}
      <Dialog
        open={createProjectDialogOpen}
        onClose={() => {
          if (!creatingProject) {
            setCreateProjectDialogOpen(false);
            setNewProjectName('');
            setCreateProjectError('');
            setPendingProjectSelection(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vytvořit nový projekt</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Název projektu"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !creatingProject) {
                handleCreateProject();
              }
            }}
            error={Boolean(createProjectError)}
            helperText={createProjectError}
            disabled={creatingProject}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateProjectDialogOpen(false);
              setNewProjectName('');
              setCreateProjectError('');
              setPendingProjectSelection(null);
            }}
            disabled={creatingProject}
          >
            Zrušit
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={creatingProject || !newProjectName.trim()}
          >
            {creatingProject ? 'Vytvářím...' : 'Vytvořit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrackerDayPage;
