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
  IconButton,
} from '@mui/material';
import {
  Clock,
  Calculator,
  BarChart3,
  DollarSign,
  HelpCircle,
  AlertTriangle,
  UserPlus,
  Calendar,
  TrendingUp,
  Layers,
  Gift,
  ChevronDown,
  ChevronUp,
  Star,
  Check,
} from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const scrollToNextSection = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  };

  const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const problems = [
    {
      icon: DollarSign,
      title: 'Vyčerpávající práce, mizerný výdělek',
      description: 'Makáte 50 hodin týdně, ale když si spočítáte hodinovku, je nižší než na brigádě v kavárně.',
    },
    {
      icon: HelpCircle,
      title: 'Nevím, co si můžu dovolit říct',
      description: 'Bojíte se říct vyšší cenu, protože nevíte, jestli je férová. Takže spíš podhodnotíte.',
    },
    {
      icon: AlertTriangle,
      title: 'Zapomínám na náklady',
      description: 'Počítáte jen čas, ale zapomínáte na nájmy, daně, sociálku, nástroje... A prodělávate.',
    },
  ];

  const stats = [
    { number: '10', unit: 'minut', label: 'k výsledku' },
    { number: '3', unit: 'úrovně cen', label: 'podle ambicí' },
    { number: '100%', unit: 'zdarma', label: 'žádné poplatky' }
  ];

  const features = [
    {
      icon: Clock,
      number: 1,
      title: 'Tracker času',
      description: 'Sledujte 7 dní, kolik času vám zabírají různé činnosti. Uvidíte, kam vám uniká čas a co vás stojí peníze.',
    },
    {
      icon: Calculator,
      number: 2,
      title: 'Cenová kalkulačka',
      description: 'Zadejte své fixní náklady a kolik hodin reálně pracujete. Kalkulačka vám spočítá minimální, doporučenou a prémiovou hodinovku.',
    },
    {
      icon: BarChart3,
      number: 3,
      title: 'Personalizovaný report',
      description: 'Získáte přehled o svém podnikání a konkrétní tipy, jak si říct vyšší cenu – a obhájit ji.',
    },
  ];

  const processSteps = [
    {
      icon: UserPlus,
      title: 'Zaregistrujte se',
      description: 'Email nebo Google. Žádná platební karta.',
      badge: '30 sekund',
    },
    {
      icon: Calendar,
      title: 'Sledujte týden',
      description: 'Zaznamenejte, co děláte a kolik to trvá. Aplikace vám pomůže.',
      badge: '5 min denně',
    },
    {
      icon: TrendingUp,
      title: 'Získejte výsledky',
      description: 'Po týdnu uvidíte report s doporučenou cenou a tipy, jak si o ni říct.',
      badge: 'okamžitě',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      number: '35%',
      title: 'vyšší hodinovka',
      subtitle: 'v průměru po použití PricePro',
    },
    {
      icon: Calendar,
      number: '7 dní',
      title: 'ke zjištění',
      subtitle: 'reálného času na projekty',
    },
    {
      icon: Layers,
      number: '3 úrovně',
      title: 'cenových variant',
      subtitle: 'minimum, doporučená, prémium',
    },
    {
      icon: Gift,
      number: '100%',
      title: 'zdarma',
      subtitle: 'žádné skryté poplatky',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0F172A',
        position: 'relative',
      }}
    >
      {/* Fixed Top Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0DDD0D 0%, #34D399 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PricePro
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="text"
                onClick={() => navigate('/prihlaseni')}
                sx={{
                  color: '#9CA3AF',
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': {
                    color: '#0DDD0D',
                  },
                }}
              >
                Přihlásit se
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/registrace')}
                sx={{
                  background: 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3FE73F 0%, #34D399 100%)',
                  },
                }}
              >
                Chci začít
              </Button>
              <ThemeToggle />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 10 }}>
        {/* Hero Section */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: { xs: 12, md: 16 },
            textAlign: 'center',
          }}
        >
          <motion.div {...slideUp}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 4,
                background: 'linear-gradient(135deg, #0DDD0D 0%, #34D399 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Kolik opravdu stojí vaše práce?
            </Typography>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.1 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                maxWidth: 800,
                mx: 'auto',
                mb: 2,
                color: '#D1D5DB',
                lineHeight: 1.6,
                fontWeight: 300,
              }}
            >
              Přestaňte hádat a zjistěte svou reálnou hodinovku. Nacen yourujte své služby
              tak, abyste neprodělávala.
            </Typography>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.2 }}>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                mb: 6,
                color: '#9CA3AF',
                fontSize: '1.1rem',
              }}
            >
              Podívejte se, co všechno můžete s PricePro zjistit, nebo rovnou začněte.
            </Typography>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 3 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/registrace')}
                sx={{
                  py: 1.5,
                  px: 5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)',
                  color: '#000',
                  boxShadow: '0 8px 32px rgba(13, 221, 13, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(13, 221, 13, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Začít zdarma
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={scrollToNextSection}
                sx={{
                  py: 1.5,
                  px: 5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#D1D5DB',
                  '&:hover': {
                    borderColor: '#0DDD0D',
                    bgcolor: 'rgba(13, 221, 13, 0.1)',
                    color: '#0DDD0D',
                  },
                }}
              >
                Nejdřív chci vědět víc
              </Button>
            </Stack>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.4 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 8 }}>
              Bez platební karty. Výsledky za 10 minut.
            </Typography>
          </motion.div>

          {/* Preview Mockup */}
          <motion.div {...slideUp} transition={{ delay: 0.5 }}>
            <Card
              sx={{
                maxWidth: 1000,
                mx: 'auto',
                mt: 6,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(13, 221, 13, 0.3)',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(13, 221, 13, 0.25)',
              }}
            >
              <Box
                sx={{
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2a 100%)',
                }}
              >
                <Typography variant="h5" sx={{ color: '#6B7280' }}>
                  PricePro Dashboard Preview
                </Typography>
              </Box>
            </Card>
          </motion.div>

          {/* Scroll indicator */}
          <Box sx={{ mt: 12 }}>
            <IconButton
              onClick={scrollToNextSection}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#0DDD0D',
                },
              }}
            >
              <ChevronDown size={32} />
            </IconButton>
          </Box>
        </Box>

        {/* Problems Section */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            py: { xs: 12, md: 20 },
          }}
        >
          <motion.div {...slideUp}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem', lg: '3.5rem' },
                fontWeight: 700,
                mb: 12,
                textAlign: 'center',
                color: '#F9FAFB',
                lineHeight: 1.2,
              }}
            >
              Většina podnikatelek si účtuje míň, než by měla
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    {...slideUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        background: 'rgba(10, 10, 26, 0.5)',
                        border: '1px solid rgba(128, 128, 128, 0.3)',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          borderColor: 'rgba(13, 221, 13, 0.5)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 3,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(13, 221, 13, 0.1)',
                          }}
                        >
                          <Icon size={32} color="#0DDD0D" strokeWidth={1.5} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: '#F9FAFB',
                          }}
                        >
                          {problem.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#9CA3AF',
                            lineHeight: 1.7,
                            fontSize: '1.05rem',
                            fontWeight: 300,
                          }}
                        >
                          {problem.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <IconButton
              onClick={scrollToNextSection}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#0DDD0D',
                },
              }}
            >
              <ChevronDown size={32} />
            </IconButton>
          </Box>
        </Box>

        {/* Solution Section */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            py: { xs: 12, md: 20 },
            textAlign: 'center',
          }}
        >
          <motion.div {...slideUp}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem', lg: '3.5rem' },
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(135deg, #0DDD0D 0%, #34D399 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              PricePro vám ukáže pravdu o vašem podnikání
            </Typography>
          </motion.div>

          {/* Copper divider */}
          <Box
            sx={{
              width: 80,
              height: 2,
              mx: 'auto',
              mb: 6,
              background: 'linear-gradient(90deg, transparent, #0DDD0D, transparent)',
            }}
          />

          <motion.div {...slideUp} transition={{ delay: 0.1 }}>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                mb: 10,
                color: '#D1D5DB',
                fontSize: '1.25rem',
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              Za 10 minut získáte přesný výpočet, kolik musíte vydělat, abyste neprodělávala – a
              kolik si můžete říct, abyste žila fajn.
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <motion.div
                  {...slideUp}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card
                    sx={{
                      p: 4,
                      background: 'rgba(13, 221, 13, 0.05)',
                      border: '1px solid rgba(13, 221, 13, 0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        color: '#0DDD0D',
                        mb: 1,
                        lineHeight: 1,
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#F9FAFB',
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {stat.unit}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#9CA3AF',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 8 }}>
            <IconButton
              onClick={scrollToNextSection}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#0DDD0D',
                },
              }}
            >
              <ChevronDown size={32} />
            </IconButton>
          </Box>
        </Box>

        {/* How It Works - Cards */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            py: { xs: 12, md: 20 },
          }}
        >
          <motion.div {...slideUp}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem', lg: '3.5rem' },
                fontWeight: 700,
                mb: 12,
                textAlign: 'center',
                color: '#F9FAFB',
                lineHeight: 1.2,
              }}
            >
              Jak to funguje?
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    {...slideUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        background: 'rgba(10, 10, 26, 0.5)',
                        border: '1px solid rgba(128, 128, 128, 0.3)',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(13, 221, 13, 0.5)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        {/* Number badge */}
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            mb: 3,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)',
                            color: '#000',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                          }}
                        >
                          {feature.number}
                        </Box>
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            mb: 3,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(13, 221, 13, 0.2)',
                          }}
                        >
                          <Icon size={24} color="#0DDD0D" strokeWidth={1.5} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: '#F9FAFB',
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#9CA3AF',
                            lineHeight: 1.7,
                            fontWeight: 300,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <IconButton
              onClick={scrollToNextSection}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#0DDD0D',
                },
              }}
            >
              <ChevronDown size={32} />
            </IconButton>
          </Box>
        </Box>

        {/* Process Steps - Timeline */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            py: { xs: 12, md: 20 },
          }}
        >
          <motion.div {...slideUp}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem', lg: '3.5rem' },
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                color: '#F9FAFB',
                lineHeight: 1.2,
              }}
            >
              3 kroky k férové ceně
            </Typography>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.1 }}>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                mb: 12,
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '1.25rem',
                fontWeight: 300,
              }}
            >
              Jednoduchý proces, který vám ukáže reálnou hodnotu vaší práce
            </Typography>
          </motion.div>

          <Stack spacing={0} sx={{ maxWidth: 900, mx: 'auto' }}>
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === processSteps.length - 1;

              return (
                <Box key={index} sx={{ position: 'relative' }}>
                  <motion.div
                    {...slideUp}
                    transition={{ delay: index * 0.15 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 3, md: 4 },
                        flexDirection: { xs: 'column', md: 'row' },
                        textAlign: { xs: 'center', md: 'left' },
                      }}
                    >
                      {/* Icon circle with glow */}
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 96,
                          height: 96,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#0DDD0D',
                          boxShadow: '0 0 30px rgba(13, 221, 13, 0.4)',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        <Icon size={40} color="#ffffff" strokeWidth={1.5} />
                      </Box>

                      {/* Content card */}
                      <Card
                        sx={{
                          flex: 1,
                          p: 4,
                          background: 'rgba(13, 221, 13, 0.05)',
                          border: '1px solid rgba(13, 221, 13, 0.3)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: { md: 'translateX(8px)' },
                            borderColor: 'rgba(13, 221, 13, 0.5)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'center' },
                            justifyContent: 'space-between',
                            mb: 2,
                            gap: 2,
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: '#F9FAFB',
                              fontSize: '1.5rem',
                            }}
                          >
                            {step.title}
                          </Typography>
                          <Typography
                            sx={{
                              px: 3,
                              py: 0.75,
                              borderRadius: 4,
                              background: 'rgba(13, 221, 13, 0.2)',
                              color: '#0DDD0D',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            {step.badge}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#9CA3AF',
                            lineHeight: 1.7,
                            fontSize: '1.05rem',
                            fontWeight: 300,
                          }}
                        >
                          {step.description}
                        </Typography>
                      </Card>
                    </Box>
                  </motion.div>

                  {/* Connecting line */}
                  {!isLast && (
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        left: 48,
                        top: 96,
                        width: 2,
                        height: 64,
                        background: 'rgba(13, 221, 13, 0.3)',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {!isLast && <Box sx={{ height: { xs: 4, md: 8 } }} />}
                </Box>
              );
            })}
          </Stack>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <IconButton
              onClick={scrollToNextSection}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#0DDD0D',
                },
              }}
            >
              <ChevronDown size={32} />
            </IconButton>
          </Box>
        </Box>

        {/* Benefits */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            py: { xs: 12, md: 20 },
          }}
        >
          <motion.div {...slideUp}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem', lg: '3.5rem' },
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                color: '#F9FAFB',
                lineHeight: 1.2,
              }}
            >
              Co získáte?
            </Typography>
          </motion.div>

          <motion.div {...slideUp} transition={{ delay: 0.1 }}>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                mb: 12,
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '1.25rem',
                fontWeight: 300,
              }}
            >
              Konkrétní čísla a nástroje, které změní váš přístup k cenotvorbě
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    {...slideUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        background: 'rgba(10, 10, 26, 0.5)',
                        border: '1px solid rgba(128, 128, 128, 0.3)',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          borderColor: 'rgba(13, 221, 13, 0.5)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            mx: 'auto',
                            mb: 3,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(13, 221, 13, 0.2)',
                          }}
                        >
                          <Icon size={28} color="#0DDD0D" strokeWidth={1.5} />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '2.75rem',
                            fontWeight: 700,
                            color: '#0DDD0D',
                            mb: 1,
                            lineHeight: 1,
                          }}
                        >
                          {benefit.number}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#F9FAFB',
                            mb: 1,
                            fontSize: '1.1rem',
                          }}
                        >
                          {benefit.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#9CA3AF',
                            fontSize: '0.95rem',
                          }}
                        >
                          {benefit.subtitle}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <IconButton
              onClick={scrollToNextSection}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#0DDD0D',
                },
              }}
            >
              <ChevronDown size={32} />
            </IconButton>
          </Box>
        </Box>

        {/* Final CTA */}
        <Box
          component={motion.div}
          {...fadeIn}
          sx={{
            py: { xs: 12, md: 20 },
            textAlign: 'center',
          }}
        >
          <motion.div {...slideUp}>
            <Card
              sx={{
                maxWidth: 900,
                mx: 'auto',
                p: { xs: 4, md: 8 },
                background: 'rgba(13, 221, 13, 0.05)',
                border: '2px solid rgba(13, 221, 13, 0.3)',
                borderRadius: 4,
                boxShadow: '0 0 60px rgba(13, 221, 13, 0.2)',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
                  fontWeight: 700,
                  mb: 3,
                  background: 'linear-gradient(135deg, #0DDD0D 0%, #34D399 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                }}
              >
                Připravená zjistit svou hodnotu?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.15rem',
                  mb: 5,
                  color: '#D1D5DB',
                  maxWidth: 700,
                  mx: 'auto',
                  fontWeight: 300,
                  lineHeight: 1.7,
                }}
              >
                Většina podnikatelek zjistí, že by si měly účtovat o 30-50% víc. Jste
                jedna z nich?
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/registrace')}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)',
                  color: '#000',
                  boxShadow: '0 8px 32px rgba(13, 221, 13, 0.3)',
                  mb: 5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(13, 221, 13, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Spočítat si hodinovku
              </Button>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={4}
                justifyContent="center"
                sx={{ mb: 5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Check size={18} color="#0DDD0D" />
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Registrace trvá 30 sekund
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Check size={18} color="#0DDD0D" />
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Výsledky za týden
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Check size={18} color="#0DDD0D" />
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    100% zdarma
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: '#6B7280',
                  mb: 2,
                  fontSize: '0.9rem',
                }}
              >
                Důvěřují nám podnikatelky z celé ČR
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  justifyContent: 'center',
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} fill="#0DDD0D" color="#0DDD0D" />
                ))}
              </Box>
            </Card>
          </motion.div>
        </Box>
      </Container>

      {/* Scroll to top button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
        }}
      >
        <IconButton
          onClick={scrollToTop}
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #0DDD0D 0%, #10B981 100%)',
            color: '#000',
            boxShadow: '0 4px 20px rgba(13, 221, 13, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3FE73F 0%, #34D399 100%)',
              boxShadow: '0 6px 24px rgba(13, 221, 13, 0.4)',
            },
          }}
        >
          <ChevronUp size={28} />
        </IconButton>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            © 2026 PricePro. Všechna práva vyhrazena.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
