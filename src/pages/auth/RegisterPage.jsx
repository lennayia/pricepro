import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Tento email je již registrován');
      } else {
        setError('Nastala chyba při registraci. Zkuste to prosím znovu.');
      }
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
      setError('Nastala chyba při registraci přes Google. Zkuste to prosím znovu.');
      setGoogleLoading(false);
    }
  };

  if (success) {
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
              <Stack spacing={3} alignItems="center" textAlign="center">
                <Typography variant="h4">Ověřte svůj email</Typography>
                <Typography color="text.secondary">
                  Na adresu <strong>{email}</strong> jsme vám poslali ověřovací
                  odkaz. Klikněte na něj pro dokončení registrace.
                </Typography>
                <Button
                  component={Link}
                  to="/prihlaseni"
                  variant="contained"
                >
                  Přejít na přihlášení
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

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
                  Vytvořte si účet
                </Typography>
                <Typography color="text.secondary">
                  Zjistěte svou reálnou hodinovku
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <GoogleButton
                onClick={handleGoogleSignIn}
                loading={googleLoading}
              />

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
                    autoComplete="new-password"
                    disabled={loading}
                    helperText="Minimálně 6 znaků"
                  />
                  <TextField
                    label="Potvrzení hesla"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                    autoComplete="new-password"
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
                      'Zaregistrovat se'
                    )}
                  </Button>
                </Stack>
              </form>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Už máte účet?{' '}
                  <Typography
                    component={Link}
                    to="/prihlaseni"
                    variant="body2"
                    color="primary"
                    sx={{ textDecoration: 'none', fontWeight: 500 }}
                  >
                    Přihlaste se
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

export default RegisterPage;
