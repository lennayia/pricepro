import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const from = location.state?.from?.pathname || '/pricepro/app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Nesprávný email nebo heslo'
          : 'Nastala chyba při přihlašování. Zkuste to prosím znovu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 128px)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Vítej zpět
                </Typography>
                <Typography color="text.secondary">
                  Přihlas se ke svému účtu
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoComplete="email"
                    disabled={loading}
                  />
                  <TextField
                    label="Heslo"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Přihlásit se'
                    )}
                  </Button>
                </Stack>
              </form>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Nemáš účet?{' '}
                  <Typography
                    component={Link}
                    to="/pricepro/registrace"
                    variant="body2"
                    color="primary"
                    sx={{ textDecoration: 'none', fontWeight: 500 }}
                  >
                    Zaregistruj se
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
