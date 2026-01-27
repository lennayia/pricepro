import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  AccessTime as TrackerIcon,
  Calculate as CalculatorIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <TrackerIcon sx={{ fontSize: 48 }} />,
    title: 'Tracker času',
    description:
      'Sledujte, kolik času vám zabírají různé činnosti. Po týdnu uvidíte, kam vám uniká čas.',
  },
  {
    icon: <CalculatorIcon sx={{ fontSize: 48 }} />,
    title: 'Cenová kalkulačka',
    description:
      'Vypočítejte si minimální, doporučenou a prémiovou hodinovku na základě vašich reálných nákladů.',
  },
  {
    icon: <TrendingIcon sx={{ fontSize: 48 }} />,
    title: 'Personalizovaný report',
    description:
      'Získejte přehled o svém podnikání a tipy, jak si říct vyšší cenu.',
  },
];

const LandingPage = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Kolik opravdu stojí vaše práce?
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, fontWeight: 400 }}
            >
              Přestaňte hádat a zjistěte svou reálnou hodinovku. Nacen te své služby
              tak, abyste neprodělávali.
            </Typography>
            <Button
              component={Link}
              to="/pricepro/registrace"
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Začít zdarma
            </Button>
            <Typography variant="body2" color="text.secondary">
              Bez platební karty. Výsledky za 10 minut.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h2"
          textAlign="center"
          sx={{ mb: 6, fontSize: { xs: '1.75rem', md: '2rem' } }}
        >
          Jak to funguje?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}
            >
              Připraveni zjistit svou hodnotu?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500 }}>
              Většina podnikatelek si účtuje méně, než by měla. Zjistěte, jestli
              to není i váš případ.
            </Typography>
            <Button
              component={Link}
              to="/pricepro/registrace"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                px: 6,
                py: 1.5,
              }}
            >
              Spočítat hodinovku
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
