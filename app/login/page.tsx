'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Alert, Button, FormControl, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { AccountCircleOutlined, ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { LoginCredentials, LoginProvider } from '../providers/userProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const router = useRouter();
  const [email, setEmail] = React.useState<string>('');
  const [emailError, setEmailError] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [passwordError, setPasswordError] = React.useState<string>('');
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = React.useState<boolean>(false);
  const [loginError, setLoginError] = React.useState<boolean>(false);

  function handleChangeEmail(value: string) {
    const _email = value.trim();
    let _emailError = '';
    if (!_email.length) {
      _emailError = 'Inserisci un valore!';
    } else if (!_email.match(emailRegex)) {
      _emailError = 'Inserisci una email valida!';
    }
    setEmail(_email);
    setEmailError(_emailError);
  }

  function handleChangePassword(value: string) {
    const _password = value.trim();
    let _passwordError = '';
    if (_password.length < 8) {
      _passwordError = 'La password ha almeno 8 caratteri!';
    }
    setPassword(_password);
    setPasswordError(_passwordError);
  }

  function handleClickLogin() {
    setFormSubmitted(true);
    // Per eseguire validazione in caso utente clicca
    // direttamente sul bottone senza interagire con
    // gli input.
    handleChangeEmail(email);
    handleChangePassword(password);
    if (!emailError && !passwordError) {
      login();
    }
  }

  function handleKeyPress(key: string) {
    if (key === 'Enter') {
      handleClickLogin();
    }
  }

  async function login() {
    const _email = email.trim();
    const _password = password.trim();
    if (!_email.length || !_password.length) {
      return;
    }
    setLoginError(false);
    const credentials: LoginCredentials = {
      email: _email,
      password: _password,
    };
    const result = await LoginProvider.login(credentials);
    if (result !== null) {
      router.back();
    } else {
      setLoginError(true);
    }
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Tooltip title="Indietro">
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack></ArrowBack>
        </IconButton>
      </Tooltip>
      <Typography sx={{ fontSize: 26 }}>Accedi al tuo account</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 2, paddingBottom: 2 }}>
        <AccountCircleOutlined color='success' sx={{ fontSize: 120 }}></AccountCircleOutlined>
      </Box>
      {
        loginError?
        <>
          <Alert severity="error">Email e/o password errati!</Alert>
          <Box sx={{ padding: 2 }}></Box>
        </> : null
      }
      <TextField
        fullWidth
        label='Email'
        variant='outlined'
        id="email"
        type="email"
        value={email}
        onChange={(event) => handleChangeEmail(event.target.value)}
        onKeyDown={(event) => handleKeyPress(event.key)}
        error={!!emailError}
        helperText={emailError}
      />
      <Box sx={{ padding: 1 }}></Box>
      <FormControl fullWidth variant="filled">
        <TextField
          label='Password'
          id="password"
          variant='outlined'
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => handleChangePassword(event.target.value)}
          onKeyDown={(event) => handleKeyPress(event.key)}
          error={!!passwordError}
          helperText={passwordError}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">
                <Tooltip title={showPassword ? 'Nascondi password' : 'Mostra password'}>
                  <IconButton
                    aria-label={
                      showPassword ? 'Nascondi password' : 'Mostra password'
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>,
            },
          }}
        />
      </FormControl>
      <Box sx={{ padding: 1 }}></Box>
      <Button variant='contained' disabled={formSubmitted && !!(emailError || passwordError)} onClick={handleClickLogin}>Accedi</Button>
      <Box sx={{ padding: 2 }}></Box>
      <Typography>Non hai ancora un account? <Link style={{ textDecoration: 'underline' }} href={'/register'}>Registrati</Link>!</Typography>
    </Box>
  );
}