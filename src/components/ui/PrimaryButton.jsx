import { Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * PrimaryButton - Hlavní akční tlačítko s animací
 * Modulární komponenta pro primární akce (registrace, přihlášení, odeslání)
 */
function PrimaryButton({
  onClick,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  children
}) {
  return (
    <motion.div
      whileHover={{ scale: loading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
      style={{ width: fullWidth ? '100%' : 'auto', display: fullWidth ? 'block' : 'inline-block' }}
    >
      <Button
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        fullWidth={fullWidth}
        variant="contained"
        size="large"
        sx={{
          py: 1.5,
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          children
        )}
      </Button>
    </motion.div>
  );
}

export default PrimaryButton;
