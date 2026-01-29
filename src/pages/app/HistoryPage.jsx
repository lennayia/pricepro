import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { ResponsiveButton } from '../../components/ui';
import { History, Calculator, Eye, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCalculatorResults, deleteCalculatorResult } from '../../services/calculatorResults';
import { COLORS } from '../../constants/colors';

const HistoryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await getCalculatorResults(user.id);
        setHistoryItems(results);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('Nepodařilo se načíst historii. Zkuste to prosím znovu.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedItem(null);
  };

  const handleOpenDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      await deleteCalculatorResult(itemToDelete.id);

      // Remove from list
      setHistoryItems(prev => prev.filter(item => item.id !== itemToDelete.id));

      handleCloseDeleteConfirm();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Nepodařilo se smazat kalkulaci. Zkuste to prosím znovu.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('cs-CZ', { maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4">Historie výpočtů</Typography>
        <Typography color="text.secondary">
          Přehled vašich předchozích kalkulací hodinovky.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {historyItems.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              py: 8,
              textAlign: 'center',
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <History size={64} color={COLORS.neutral[400]} />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Zatím nemáte žádné výpočty
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Až si spočítáte svou hodinovku, najdete zde historii svých výpočtů.
            </Typography>
            <ResponsiveButton
              component={Link}
              to="/app/kalkulacka"
              variant="contained"
              startIcon={<Calculator size={20} />}
            >
              Spočítat hodinovku
            </ResponsiveButton>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {historyItems.map((item) => (
            <Card
              key={item.id}
              sx={{
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 8, lg: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Datum vytvoření
                    </Typography>
                    <Typography variant="h6">
                      {formatDate(item.created_at)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Doporučená hodinovka
                    </Typography>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                      {formatCurrency(item.recommended_hourly)} Kč
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Minimální
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(item.minimum_hourly)} Kč
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Prémiová
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(item.premium_hourly)} Kč
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 12, md: 4, lg: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, opacity: 0, visibility: { xs: 'hidden', md: 'visible' } }}>
                      Akce
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: { xs: 1, md: 0 } }}>
                      <IconButton
                        onClick={() => handleViewDetail(item)}
                        size="small"
                        sx={{
                          color: COLORS.primary.main,
                          '&:hover': { bgcolor: COLORS.primary.light + '20' },
                        }}
                      >
                        <Eye size={20} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteConfirm(item)}
                        size="small"
                        sx={{
                          color: COLORS.error.main,
                          '&:hover': { bgcolor: COLORS.error.light + '20' },
                        }}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: COLORS.primary.light + '20',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Calculator size={24} color={COLORS.primary.main} />
                </Box>
                <Box>
                  <Typography variant="h6">Detail kalkulace</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedItem.created_at)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Price Cards */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Výsledné hodinovky
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ bgcolor: COLORS.error.light + '10' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <AlertCircle size={32} color={COLORS.error.main} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Minimální
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(selectedItem.minimum_hourly)} Kč
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ bgcolor: COLORS.success.light + '10' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <TrendingUp size={32} color={COLORS.success.main} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Doporučená
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(selectedItem.recommended_hourly)} Kč
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ bgcolor: COLORS.warning.light + '10' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <TrendingUp size={32} color={COLORS.warning.main} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Prémiová
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(selectedItem.premium_hourly)} Kč
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Summary */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Shrnutí
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Minimální měsíční příjem
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedItem.minimum_monthly)} Kč
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fakturovatelné hodiny měsíčně
                  </Typography>
                  <Typography variant="h6">
                    {selectedItem.monthly_billable_hours} hodin
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tržní koeficient
                  </Typography>
                  <Chip
                    label={`×${selectedItem.coefficients.toFixed(2)}`}
                    color="primary"
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Inputs */}
              {selectedItem.inputs && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Zadané údaje
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Náklady na bydlení: {formatCurrency(selectedItem.inputs.housingCosts || 0)} Kč
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Životní náklady: {formatCurrency(selectedItem.inputs.livingCosts || 0)} Kč
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Náklady na podnikání: {formatCurrency(selectedItem.inputs.businessCosts || 0)} Kč
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Rezerva + spoření: {formatCurrency(selectedItem.inputs.savings || 0)} Kč
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <ResponsiveButton onClick={handleCloseDetail}>
                Zavřít
              </ResponsiveButton>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Smazat kalkulaci?</DialogTitle>
        <DialogContent>
          <Typography>
            Opravdu chcete smazat tuto kalkulaci? Tato akce je nevratná.
          </Typography>
          {itemToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDate(itemToDelete.created_at)}
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(itemToDelete.recommended_hourly)} Kč
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <ResponsiveButton onClick={handleCloseDeleteConfirm} disabled={deleting}>
            Zrušit
          </ResponsiveButton>
          <ResponsiveButton
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <Trash2 size={20} />}
          >
            {deleting ? 'Mažu...' : 'Smazat'}
          </ResponsiveButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPage;
