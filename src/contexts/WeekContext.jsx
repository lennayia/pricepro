import { createContext, useContext, useState, useEffect } from 'react';
import { getWeekStartDate, formatWeekRange, addWeeks } from '../utils/dateHelpers';
import { useAuth } from './AuthContext';
import { getSelectedWeekStart, updateSelectedWeekStart } from '../services/userService';

const WeekContext = createContext();

export const useWeek = () => {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error('useWeek must be used within WeekProvider');
  }
  return context;
};

export const WeekProvider = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with current week or from localStorage (cache)
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const saved = localStorage.getItem('pricepro_selected_week');
    if (saved) {
      return saved;
    }
    return getWeekStartDate(new Date());
  });

  // Load selected week from database on mount
  useEffect(() => {
    const loadSelectedWeek = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const savedWeek = await getSelectedWeekStart(user.id);
        if (savedWeek) {
          setSelectedWeekStart(savedWeek);
          localStorage.setItem('pricepro_selected_week', savedWeek);
        }
      } catch (err) {
        console.error('Error loading selected week:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedWeek();
  }, [user]);

  // Save to both database and localStorage when changed
  useEffect(() => {
    const saveSelectedWeek = async () => {
      if (!user || isLoading) return;

      // Save to localStorage immediately (cache)
      localStorage.setItem('pricepro_selected_week', selectedWeekStart);

      // Save to database (sync across devices)
      try {
        await updateSelectedWeekStart(user.id, selectedWeekStart);
      } catch (err) {
        console.error('Error saving selected week to database:', err);
      }
    };

    saveSelectedWeek();
  }, [selectedWeekStart, user, isLoading]);

  const setWeek = (weekStartDate) => {
    setSelectedWeekStart(weekStartDate);
  };

  const goToPreviousWeek = () => {
    const prevWeek = addWeeks(selectedWeekStart, -1);
    setSelectedWeekStart(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = addWeeks(selectedWeekStart, 1);
    setSelectedWeekStart(nextWeek);
  };

  const goToCurrentWeek = () => {
    const currentWeek = getWeekStartDate(new Date());
    setSelectedWeekStart(currentWeek);
  };

  const isCurrentWeek = () => {
    const currentWeek = getWeekStartDate(new Date());
    return selectedWeekStart === currentWeek;
  };

  const value = {
    selectedWeekStart,
    setWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
    weekRange: formatWeekRange(selectedWeekStart),
    isLoading,
  };

  return <WeekContext.Provider value={value}>{children}</WeekContext.Provider>;
};

export default WeekContext;
