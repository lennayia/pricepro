import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Typography, AppBar, Toolbar, Button } from '@mui/material';
import ThemeToggle from '../ui/ThemeToggle';

const PublicLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                textDecoration: 'none',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '#0DDD0D'
                    : 'linear-gradient(135deg, #FFD700 0%, #CD7F32 50%, #A0522D 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PricePro
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <ThemeToggle />
            <Button
              component={Link}
              to="/prihlaseni"
              color="inherit"
              sx={{ ml: 1, mr: 1 }}
            >
              Přihlášení
            </Button>
            <Button
              component={Link}
              to="/registrace"
              variant="contained"
              color="primary"
            >
              Začít zdarma
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Outlet />
      <Box
        component="footer"
        sx={{
          py: 4,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            PricePro je součástí{' '}
            <Typography
              component="a"
              href="https://vibecodingpro.cz"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              vibecodingpro.cz
            </Typography>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;
