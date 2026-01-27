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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleButton from '../../components/ui/GoogleButton';
import PrimaryButton from '../../components/ui/PrimaryButton';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Prosím vyplňte jméno a příjmení');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Heslo musí obsahovat alespoň jedno velké písmeno');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Heslo musí obsahovat alespoň jedno malé písmeno');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Heslo musí obsahovat alespoň jednu číslici');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Heslo musí obsahovat alespoň jeden speciální znak');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, firstName, lastName, marketingConsent);
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
                    label="Jméno"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    fullWidth
                    autoComplete="given-name"
                    disabled={loading}
                  />
                  <TextField
                    label="Příjmení"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    fullWidth
                    autoComplete="family-name"
                    disabled={loading}
                  />
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
                    helperText="Musí obsahovat alespoň 8 znaků: velké písmeno, malé písmeno, číslici a speciální znak"
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

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Chci dostávat novinky a tipy emailem
                      </Typography>
                    }
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PrimaryButton
                      type="submit"
                      loading={loading}
                    >
                      Zaregistrovat se
                    </PrimaryButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Registrací souhlasíte s{' '}
                    <Typography
                      component="a"
                      href="https://www.vibecodingpro.cz/obchodni-podminky"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      color="primary"
                      sx={{ textDecoration: 'underline' }}
                    >
                      obchodními podmínkami
                    </Typography>
                    {' '}a{' '}
                    <Typography
                      component="a"
                      href="https://www.vibecodingpro.cz/gdpr"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      color="primary"
                      sx={{ textDecoration: 'underline' }}
                    >
                      zásadami ochrany osobních údajů
                    </Typography>
                  </Typography>
                </Stack>
              </form>

              <Divider>
                <Typography variant="body2" color="text.secondary">
                  nebo
                </Typography>
              </Divider>

              <Stack spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Už máte účet?
                </Typography>
                <Button
                  component={Link}
                  to="/prihlaseni"
                  variant="outlined"
                  size="large"
                  sx={{ px: 4 }}
                >
                  Přihlaste se
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
