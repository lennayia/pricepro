import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import { ResponsiveButton } from '../ui';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

/**
 * Dialog for splitting category hours across multiple projects
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (receives splits array)
 * @param {Object} category - Category object
 * @param {number} totalHours - Total hours for this category
 * @param {Array} projects - Available projects
 * @param {Object} initialSplits - Initial splits (if editing)
 */
const SplitHoursDialog = ({
  open,
  onClose,
  onSave,
  category,
  totalHours,
  projects,
  initialSplits = {},
}) => {
  const [splits, setSplits] = useState([]);
  const [error, setError] = useState('');

  // Initialize splits from props
  useEffect(() => {
    if (open) {
      if (Object.keys(initialSplits).length > 0) {
        // Convert initialSplits object to array
        const splitsArray = Object.entries(initialSplits).map(([projectId, hours]) => ({
          projectId,
          hours: hours.toString(),
        }));
        setSplits(splitsArray);
      } else {
        // Start with one empty split
        setSplits([{ projectId: '', hours: '' }]);
      }
      setError('');
    }
  }, [open, initialSplits]);

  // Calculate total of current splits
  const currentTotal = splits.reduce((sum, split) => {
    const hours = parseFloat(split.hours) || 0;
    return sum + hours;
  }, 0);

  const hasValidationError = Math.abs(currentTotal - totalHours) > 0.01;

  const handleAddSplit = () => {
    setSplits([...splits, { projectId: '', hours: '' }]);
  };

  const handleRemoveSplit = (index) => {
    if (splits.length > 1) {
      const newSplits = splits.filter((_, i) => i !== index);
      setSplits(newSplits);
    }
  };

  const handleSplitChange = (index, field, value) => {
    const newSplits = [...splits];
    newSplits[index][field] = value;
    setSplits(newSplits);
    setError('');
  };

  const handleSave = () => {
    // Validation
    const emptyProject = splits.some((s) => !s.projectId);
    if (emptyProject) {
      setError('Vyberte projekt pro všechny řádky.');
      return;
    }

    const emptyHours = splits.some((s) => !s.hours || parseFloat(s.hours) <= 0);
    if (emptyHours) {
      setError('Vyplňte hodiny pro všechny projekty (větší než 0).');
      return;
    }

    if (hasValidationError) {
      setError(`Součet hodin (${currentTotal.toFixed(2)}h) se neshoduje s celkovými hodinami (${totalHours}h).`);
      return;
    }

    // Check for duplicate projects
    const projectIds = splits.map((s) => s.projectId);
    const uniqueProjectIds = new Set(projectIds);
    if (projectIds.length !== uniqueProjectIds.size) {
      setError('Nemůžete přiřadit stejný projekt vícekrát.');
      return;
    }

    // Convert to object format: { projectId: hours }
    const splitsObject = splits.reduce((acc, split) => {
      acc[split.projectId] = parseFloat(split.hours);
      return acc;
    }, {});

    onSave(splitsObject);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Rozdělit hodiny mezi projekty
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {category?.label} • Celkem {totalHours}h
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Info */}
          <Alert severity="info" icon={<AlertCircle size={18} />}>
            Rozdělte {totalHours}h na jednotlivé projekty. Součet musí být přesně {totalHours}h.
          </Alert>

          {/* Error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Splits */}
          {splits.map((split, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                {/* Project selector */}
                <TextField
                  select
                  label="Projekt"
                  value={split.projectId}
                  onChange={(e) => handleSplitChange(index, 'projectId', e.target.value)}
                  fullWidth
                  size="small"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {project.color && (
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
                        <Typography>{project.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Hours input */}
                <TextField
                  type="number"
                  label="Hodiny"
                  value={split.hours}
                  onChange={(e) => handleSplitChange(index, 'hours', e.target.value)}
                  inputProps={{ min: 0, step: 0.5, max: totalHours }}
                  sx={{ width: 120 }}
                  size="small"
                />

                {/* Remove button */}
                <IconButton
                  onClick={() => handleRemoveSplit(index)}
                  disabled={splits.length === 1}
                  color="error"
                  size="small"
                  sx={{ mt: 0.5 }}
                >
                  <Trash2 size={18} />
                </IconButton>
              </Box>
            </Box>
          ))}

          {/* Add split button */}
          <ResponsiveButton
            onClick={handleAddSplit}
            startIcon={<Plus size={18} />}
            variant="outlined"
            size="small"
          >
            Přidat další projekt
          </ResponsiveButton>

          <Divider />

          {/* Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Součet:
            </Typography>
            <Typography
              variant="h6"
              color={hasValidationError ? 'error.main' : 'success.main'}
              fontWeight={600}
            >
              {currentTotal.toFixed(2)}h / {totalHours}h
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <ResponsiveButton onClick={handleCancel} variant="outlined">
          Zrušit
        </ResponsiveButton>
        <ResponsiveButton onClick={handleSave} variant="contained" disabled={hasValidationError}>
          Uložit rozdělení
        </ResponsiveButton>
      </DialogActions>
    </Dialog>
  );
};

export default SplitHoursDialog;
