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
    <TextField
      type="number"
      value={value}
      onChange={handleInputChange}
      label={label}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ ml: -1 }}>
            <IconButton
              size="small"
              onClick={handleDecrement}
              disabled={disabled || parseFloat(value) <= min}
              sx={{
                padding: { xs: '8px', sm: '4px' },
                minWidth: { xs: 44, sm: 28 },
                minHeight: { xs: 44, sm: 28 },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Minus size={16} />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end" sx={{ mr: -1 }}>
            <IconButton
              size="small"
              onClick={handleIncrement}
              disabled={disabled || parseFloat(value) >= max}
              sx={{
                padding: { xs: '8px', sm: '4px' },
                minWidth: { xs: 44, sm: 28 },
                minHeight: { xs: 44, sm: 28 },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Plus size={16} />
            </IconButton>
          </InputAdornment>
        ),
        inputProps: { min, max, step },
      }}
      sx={{
        '& input[type=number]': {
          MozAppearance: 'textfield',
          paddingRight: 0.5,
          '&::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '&::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
        },
        ...sx,
      }}
      {...otherProps}
    />
  );
}

export default NumberInput;
