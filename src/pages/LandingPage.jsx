import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Clock,
  Calculator,
  Heart,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { COLORS, GRADIENTS } from '../constants/colors';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: Clock,
      title: 'Time Tracker',
      description: 'Sledujte svůj čas a objevte, kam vám odchází hodiny. Work-life balance v reálných číslech.',
      color: COLORS.primary.main,
    },
    {
      icon: Calculator,
      title: 'Kalkulačka hodinovky',
      description: 'Zjistěte svou reálnou hodnotu. Kalkulace založená na vašich nákladech, času a tržní pozici.',
      color: COLORS.secondary.main,
    },
    {
      icon: Heart,
      title: 'Udržitelný byznys',
      description: 'Přestaňte se vypalovat. Naučte se pracovat méně a vydělávat víc – inteligentně.',
      color: COLORS.success.main,
    },
  ];

  const benefits = [
    'Přesná hodinovka založená na reálných číslech',
    'Tracking času s work-life balance metrikami',
    'Srovnání s trhem – nejste podhodnocená',
    'Historie kalkulací – sledujte svůj růst',
    'Žádné skryté poplatky – navždy zdarma',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #111827 0%, #1F2937 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(13, 221, 13, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(205, 127, 50, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Theme toggle - top right */}
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Box
            sx={{
              pt: { xs: 12, md: 16 },
              pb: { xs: 8, md: 12 },
              textAlign: 'center',
            }}
          >
            <motion.div variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 3,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #0DDD0D 0%, #34D399 100%)'
                    : GRADIENTS.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Kolik opravdu stojíte?
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  maxWidth: 700,
                  mx: 'auto',
                  mb: 5,
                  lineHeight: 1.6,
                }}
              >
                Už vás nebaví pracovat za pakatel? Zjistěte svou reálnou hodnotu,
                přestaňte se podhodnocovat a začněte vydělávat{' '}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#0DDD0D' : COLORS.primary.main,
                    fontWeight: 700,
                  }}
                >
                  co si zasloužíte
                </Box>.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/registrace')}
                  endIcon={<ArrowRight />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)'
                      : GRADIENTS.primary,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(13, 221, 13, 0.3)'
                      : '0 8px 32px rgba(205, 127, 50, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 12px 40px rgba(13, 221, 13, 0.4)'
                        : '0 12px 40px rgba(205, 127, 50, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Začít zdarma
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/prihlaseni')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: theme.palette.mode === 'dark' ? '#0DDD0D' : COLORS.primary.main,
                    color: theme.palette.mode === 'dark' ? '#0DDD0D' : COLORS.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.mode === 'dark' ? '#0DDD0D' : COLORS.primary.main,
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(13, 221, 13, 0.1)'
                        : 'rgba(205, 127, 50, 0.1)',
                    },
                  }}
                >
                  Přihlásit se
                </Button>
              </Stack>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary">
                Žádná platební karta, žádné závazky. Prostě to zkuste.
              </Typography>
            </motion.div>
          </Box>

          {/* Features */}
          <Box sx={{ py: { xs: 6, md: 10 } }}>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        height: '100%',
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(205, 127, 50, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 12px 40px rgba(13, 221, 13, 0.2)'
                            : '0 12px 40px rgba(205, 127, 50, 0.2)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(13, 221, 13, 0.2)'
                              : alpha(feature.color, 0.15),
                          }}
                        >
                          <feature.icon
                            size={32}
                            color={theme.palette.mode === 'dark' ? '#0DDD0D' : feature.color}
                          />
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 2,
                            fontWeight: 700,
                            color: theme.palette.mode === 'dark' ? '#0DDD0D' : feature.color,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Benefits */}
          <Box
            sx={{
              py: { xs: 6, md: 10 },
              textAlign: 'center',
            }}
          >
            <motion.div variants={itemVariants}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 6,
                }}
              >
                Co dostanete?
              </Typography>
            </motion.div>

            <Grid container spacing={3} justifyContent="center">
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div variants={itemVariants}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        textAlign: 'left',
                      }}
                    >
                      <CheckCircle
                        size={24}
                        color={theme.palette.mode === 'dark' ? '#0DDD0D' : COLORS.success.main}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {benefit}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Final CTA */}
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              textAlign: 'center',
            }}
          >
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  p: { xs: 4, md: 6 },
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(13, 221, 13, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(13, 221, 13, 0.3)'
                    : 'rgba(205, 127, 50, 0.3)',
                }}
              >
                <Sparkles
                  size={48}
                  color={theme.palette.mode === 'dark' ? '#0DDD0D' : COLORS.primary.main}
                  style={{ marginBottom: 24 }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Připravená přestat se podhodnocovat?
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: '1.2rem',
                    mb: 4,
                    maxWidth: 600,
                    mx: 'auto',
                  }}
                >
                  Registrace trvá 30 sekund. Výsledky uvidíte okamžitě.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/registrace')}
                  endIcon={<ArrowRight />}
                  sx={{
                    py: 1.5,
                    px: 5,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)'
                      : GRADIENTS.primary,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(13, 221, 13, 0.3)'
                      : '0 8px 32px rgba(205, 127, 50, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 12px 40px rgba(13, 221, 13, 0.4)'
                        : '0 12px 40px rgba(205, 127, 50, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Začít hned teď
                </Button>
              </Card>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © 2026 PricePro. Všechna práva vyhrazena.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
