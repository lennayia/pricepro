import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, INFO_CARD_STYLES, WARNING_CARD_STYLES } from '../../constants/colors';

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
          width: 44,
          height: 44,
          color: isDark ? WARNING_CARD_STYLES.dark.iconColor : COLORS.primary.main,
          '&:hover': {
            backgroundColor: isDark ? WARNING_CARD_STYLES.dark.bgcolor : INFO_CARD_STYLES.light.bgcolor,
          },
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
          key={isDark ? 'sun' : 'moon'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
