import { Box, Typography, IconButton, Chip, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { ResponsiveButton } from '../ui';
import { useWeek } from '../../contexts/WeekContext';

/**
 * Week navigation component
 * Shows current week range and navigation buttons
 */
const WeekNavigation = () => {
  const theme = useTheme();
  const {
    weekRange,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
  } = useWeek();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      {/* Week Range Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calendar size={20} color={theme.palette.primary.main} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Týden: {weekRange}
        </Typography>
        {isCurrentWeek() && (
          <Chip
            label="Aktuální"
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={goToPreviousWeek}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ChevronLeft size={20} />
        </IconButton>

        {!isCurrentWeek() && (
          <ResponsiveButton
            onClick={goToCurrentWeek}
            variant="outlined"
            size="small"
          >
            Tento týden
          </ResponsiveButton>
        )}

        <IconButton
          onClick={goToNextWeek}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ChevronRight size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default WeekNavigation;
