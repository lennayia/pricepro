import { Button, CircularProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * PrimaryButton - Hlavní akční tlačítko s animací
 * Modulární komponenta pro primární akce (registrace, přihlášení, odeslání)
 *
 * @param {boolean} fullWidth - Vždy fullWidth na všech zařízeních
 * @param {boolean} responsive - FullWidth na mobilu (xs, sm), content-width na desktopu (md+)
 * @param {boolean} loading - Zobrazí loading spinner
 * @param {boolean} disabled - Zakáže tlačítko
 * @param {string} type - Typ tlačítka (button, submit)
 * @param {function} onClick - Handler pro kliknutí
 * @param {ReactNode} children - Obsah tlačítka
 */
function PrimaryButton({
  onClick,
  loading = false,
  fullWidth = false,
  responsive = false,
  disabled = false,
  type = 'button',
  children
}) {
  // Responsive: fullWidth na mobilu, content-width na desktopu
  const isResponsive = responsive && !fullWidth;

  return (
    <Box
      sx={{
        width: isResponsive ? { xs: '100%', md: 'auto' } : fullWidth ? '100%' : 'auto',
        display: isResponsive || fullWidth ? 'block' : 'inline-block',
      }}
    >
      <motion.div
        whileHover={{ scale: loading || disabled ? 1 : 1.02 }}
        whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
        style={{ width: '100%' }}
      >
        <Button
          type={type}
          onClick={onClick}
          disabled={loading || disabled}
          fullWidth={isResponsive || fullWidth}
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            ...(isResponsive && {
              width: { xs: '100%', md: 'auto' },
            }),
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            children
          )}
        </Button>
      </motion.div>
    </Box>
  );
}

export default PrimaryButton;
