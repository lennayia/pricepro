import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle - Přepínač mezi světlým a tmavým režimem
 * Používá Lucide ikony s Framer Motion animacemi
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          width: 40,
          height: 40,
          color: isDark ? '#0DDD0D' : '#CD7F32',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(13, 221, 13, 0.1)' : 'rgba(205, 127, 50, 0.1)',
          },
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
          key={isDark ? 'moon' : 'sun'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
