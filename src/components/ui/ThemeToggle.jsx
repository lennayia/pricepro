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
          width: 40,
          height: 40,
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
