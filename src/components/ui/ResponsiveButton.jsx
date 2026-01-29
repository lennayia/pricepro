import { Button as MuiButton, CircularProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * ResponsiveButton - Univerzální tlačítko s responzivním chováním
 * Modulární komponenta pro všechny typy tlačítek v aplikaci
 *
 * @param {string} variant - Varianta tlačítka (contained, outlined, text)
 * @param {string} color - Barva tlačítka (primary, secondary, success, error, warning, info)
 * @param {string} size - Velikost tlačítka (small, medium, large)
 * @param {boolean} fullWidth - Vždy fullWidth na všech zařízeních
 * @param {boolean} responsive - FullWidth na mobilu (xs, sm), content-width na desktopu (md+)
 * @param {boolean} loading - Zobrazí loading spinner
 * @param {boolean} disabled - Zakáže tlačítko
 * @param {string} type - Typ tlačítka (button, submit)
 * @param {function} onClick - Handler pro kliknutí
 * @param {object} startIcon - Ikona na začátku tlačítka
 * @param {object} endIcon - Ikona na konci tlačítka
 * @param {object} sx - MUI sx prop pro vlastní styling
 * @param {ReactNode} children - Obsah tlačítka
 */
function ResponsiveButton({
  variant = 'contained',
  color = 'primary',
  size = 'large',
  onClick,
  loading = false,
  fullWidth = false,
  responsive = false,
  disabled = false,
  type = 'button',
  startIcon,
  endIcon,
  sx = {},
  children,
  ...otherProps
}) {
  // Responsive: fullWidth na mobilu/tabletu, content-width od md (768px+)
  const isResponsive = responsive && !fullWidth;

  return (
    <motion.div
      whileHover={{ scale: loading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
      style={{
        display: 'inline-block',
        width: '100%',
      }}
    >
      <MuiButton
        type={type}
        variant={variant}
        color={color}
        size={size}
        onClick={onClick}
        disabled={loading || disabled}
        fullWidth={fullWidth}
        startIcon={loading ? undefined : startIcon}
        endIcon={loading ? undefined : endIcon}
        sx={{
          ...(size === 'large' && { py: 1.5 }),
          ...(isResponsive && {
            width: { xs: '100%', md: 'auto' },
          }),
          ...sx,
        }}
        {...otherProps}
      >
        {loading ? (
          <CircularProgress size={size === 'small' ? 20 : 24} color="inherit" />
        ) : (
          children
        )}
      </MuiButton>
    </motion.div>
  );
}

export default ResponsiveButton;
