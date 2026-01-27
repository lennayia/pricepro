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
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleButton from '../../components/ui/GoogleButton';
import PrimaryButton from '../../components/ui/PrimaryButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();

  const from = location.state?.from?.pathname || '/app';

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

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      // OAuth redirect will happen automatically
    } catch (err) {
      setError('Nastala chyba při přihlašování přes Google. Zkuste to prosím znovu.');
      setGoogleLoading(false);
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
                  Vítejte zpět
                </Typography>
                <Typography color="text.secondary">
                  Přihlaste se ke svému účtu
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleButton
                  onClick={handleGoogleSignIn}
                  loading={googleLoading}
                />
              </Box>

              <Divider>
                <Typography variant="body2" color="text.secondary">
                  nebo
                </Typography>
              </Divider>

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
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PrimaryButton
                      type="submit"
                      loading={loading}
                    >
                      Přihlásit se
                    </PrimaryButton>
                  </Box>
                </Stack>
              </form>

              <Divider>
                <Typography variant="body2" color="text.secondary">
                  nebo
                </Typography>
              </Divider>

              <Stack spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Nemáte účet?
                </Typography>
                <Button
                  component={Link}
                  to="/registrace"
                  variant="outlined"
                  size="large"
                  sx={{ px: 4 }}
                >
                  Zaregistrujte se
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
