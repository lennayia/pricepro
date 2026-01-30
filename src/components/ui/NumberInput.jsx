import { TextField, IconButton, InputAdornment, Box } from '@mui/material';
import { Plus, Minus } from 'lucide-react';

/**
 * NumberInput - Input pro číselné hodnoty s +/- tlačítky
 *
 * @param {number} value - Aktuální hodnota
 * @param {function} onChange - Callback pro změnu hodnoty (value) => {}
 * @param {number} min - Minimální hodnota (default: 0)
 * @param {number} max - Maximální hodnota (default: Infinity)
 * @param {number} step - Krok pro +/- tlačítka (default: 1)
 * @param {string} unit - Jednotka zobrazená vpravo (např. "hod", "Kč/měsíc")
 * @param {string} label - Label inputu
 * @param {string} helperText - Pomocný text pod inputem
 * @param {boolean} disabled - Zakázat input
 * @param {boolean} fullWidth - FullWidth input
 * @param {object} sx - MUI sx prop
 */
function NumberInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
  label,
  helperText,
  disabled = false,
  fullWidth = false,
  sx = {},
  ...otherProps
}) {
  const handleIncrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // Povolit prázdný string pro mazání
    if (newValue === '') {
      onChange('');
      return;
    }
    // Validovat rozsah
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      if (numValue >= min && numValue <= max) {
        onChange(newValue);
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TextField
        type="number"
        value={value}
        onChange={handleInputChange}
        label={label}
        helperText={helperText}
        disabled={disabled}
        fullWidth={fullWidth}
        InputProps={{
          endAdornment: unit ? (
            <InputAdornment position="end">{unit}</InputAdornment>
          ) : null,
          inputProps: { min, max, step },
        }}
        sx={{
          '& input[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '&::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          },
        }}
        {...otherProps}
      />

      {/* Custom +/- buttons */}
      <Box
        sx={{
          position: 'absolute',
          right: unit ? 100 : 12,
          top: label ? 16 : 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
        }}
      >
        <IconButton
          size="small"
          onClick={handleIncrement}
          disabled={disabled || parseFloat(value) >= max}
          sx={{
            padding: '2px',
            minWidth: 20,
            minHeight: 20,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Plus size={14} />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleDecrement}
          disabled={disabled || parseFloat(value) <= min}
          sx={{
            padding: '2px',
            minWidth: 20,
            minHeight: 20,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Minus size={14} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default NumberInput;
