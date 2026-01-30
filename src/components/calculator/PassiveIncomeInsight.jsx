import { useState } from 'react';
import { Card, CardContent, Typography, TextField, InputAdornment, Box, Collapse, IconButton, useTheme } from '@mui/material';
import { ChevronDown, ChevronUp, TrendingDown } from 'lucide-react';
import { INFO_CARD_STYLES } from '../../constants/colors';
import { calculateRequiredHours } from '../../utils/billableHoursCalculator';

const PassiveIncomeInsight = ({ minimumMonthly, recommendedHourly }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [passiveIncome, setPassiveIncome] = useState('');

  const passiveIncomeValue = parseFloat(passiveIncome) || 0;
  const insights = calculateRequiredHours(minimumMonthly, recommendedHourly, passiveIncomeValue);

  return (
    <Card
      sx={{
        bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
        border: INFO_CARD_STYLES[theme.palette.mode].border,
        mt: 3,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingDown size={20} color={INFO_CARD_STYLES[theme.palette.mode].iconColor} />
            <Typography variant="h6">Máte pasivní příjem?</Typography>
          </Box>
          <IconButton size="small">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pokud máte pasivní příjem z produktů, kurzů nebo předplatného, zadejte měsíční
              částku. Ukážeme vám, kolik hodin pak potřebujete reálně fakturovat.
            </Typography>

            <TextField
              label="Měsíční pasivní příjem"
              type="number"
              value={passiveIncome}
              onChange={(e) => setPassiveIncome(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">Kč/měsíc</InputAdornment>,
              }}
              fullWidth
              sx={{ mb: 3 }}
            />

            {passiveIncomeValue > 0 && (
              <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Přehled potřebných hodin
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Bez pasivního příjmu:</Typography>
                    <Typography fontWeight={600}>{insights.requiredHours}h/měsíc</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>
                      S pasivním příjmem {passiveIncomeValue.toLocaleString('cs-CZ')} Kč:
                    </Typography>
                    <Typography fontWeight={600} color="success.main">
                      {insights.requiredHoursWithPassive}h/měsíc
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
                      borderRadius: 2,
                    }}
                  >
                    <Typography fontWeight={600}>Ušetříte:</Typography>
                    <Typography fontWeight={700} color="success.main">
                      {(insights.requiredHours - insights.requiredHoursWithPassive).toFixed(1)}h/měsíc
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, fontStyle: 'italic' }}
                  >
                    💡 Důležité: Vaše hodinovka zůstává stejná (
                    {recommendedHourly.toLocaleString('cs-CZ')} Kč/h). Pasivní příjem znamená, že
                    potřebujete méně fakturovatelných 1:1 hodin na pokrytí nákladů.
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, fontStyle: 'italic' }}
                  >
                    📈 Tip: Sledujte své škálovatelné hodiny v trackeru - čím více času investujete
                    do produktů, tím více pasivního příjmu můžete generovat.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PassiveIncomeInsight;
