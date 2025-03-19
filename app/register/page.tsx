'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Alert, Button, FormControl, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { AccountCircleOutlined, ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { LoginCredentials, LoginProvider } from '../providers/userProvider';
import { useRouter } from 'next/navigation';
import { createAccount, UserRegistrationParams } from './actions';

export default function Home() {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const router = useRouter();
  const [firstName, setFirstName] = React.useState<string>('');
  const [firstNameError, setFirstNameError] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [lastNameError, setLastNameError] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [emailError, setEmailError] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [passwordError, setPasswordError] = React.useState<string>('');
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = React.useState<boolean>(false);
  const [registrationError, setRegistrationError] = React.useState<boolean>(false);

  function canRegister(): boolean {
    const _firstNameError = getFirstNameError(firstName);
    const _lastNameError = getLastNameError(lastName);
    const _emailError = getEmailError(email);
    const _passwordError = getPasswordError(password);
    return !_firstNameError && !_lastNameError && !_emailError && !_passwordError;
  }

  function getEmailError(email: string): string {
    let _emailError = '';
    if (!email.length) {
      _emailError = 'Campo obbligatorio';
    } else if (!email.match(emailRegex)) {
      _emailError = 'Email non valida';
    }
    return _emailError;
  }

  function getFirstNameError(firstName: string): string {
    let _firstNameError = '';
    if (!firstName.length) {
      _firstNameError = 'Campo obbligatorio';
    }
    return _firstNameError;
  }

  function getLastNameError(lastName: string): string {
    let _lastNameError = '';
    if (!lastName.length) {
      _lastNameError = 'Campo obbligatorio';
    }
    return _lastNameError;
  }

  function getPasswordError(password: string): string {
    let _passwordError = '';
    if (!password.length) {
      _passwordError = 'Campo obbligatorio';
    } else if (password.length < 8) {
      _passwordError = 'La password ha almeno 8 caratteri';
    }
    return _passwordError;
  }

  function handleChangeEmail(value: string) {
    const _email = value.trim();
    setEmail(_email);
    setEmailError(getEmailError(_email));
  }

  function handleChangeFirstName(value: string) {
    const _firstName = value.trim();
    setFirstName(_firstName);
    setFirstNameError(getFirstNameError(_firstName));
  }

  function handleChangeLastName(value: string) {
    const _lastName = value.trim();
    setLastName(_lastName);
    setLastNameError(getLastNameError(_lastName));
  }

  function handleChangePassword(value: string) {
    const _password = value.trim();
    setPassword(_password);
    setPasswordError(getPasswordError(_password));
  }

  function handleClickRegister() {
    if (!formSubmitted) {
      setFormSubmitted(true);
    }
    // Per eseguire validazione in caso utente clicca
    // direttamente sul bottone senza interagire con
    // gli input.
    handleChangeFirstName(firstName);
    handleChangeLastName(lastName);
    handleChangeEmail(email);
    handleChangePassword(password);
    if (canRegister()) {
      register();
    }
  }

  async function register() {
    setRegistrationError(false);
    const params: UserRegistrationParams = {
      name: firstName,
      surname: lastName,
      email: email,
      password: password,
    };
    const registeredSuccessfully = await createAccount(params);
    if (registeredSuccessfully) {
      const loginParams: LoginCredentials = {
        email: email,
        password: password,
      };
      await LoginProvider.login(loginParams);
      router.replace('/main/activities');
    } else {
      setRegistrationError(true);
    }
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Tooltip title="Indietro">
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack></ArrowBack>
        </IconButton>
      </Tooltip>
      <Typography sx={{ fontSize: 26 }}>Registra account</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 2, paddingBottom: 2 }}>
        <AccountCircleOutlined color='success' sx={{ fontSize: 120 }}></AccountCircleOutlined>
      </Box>
      {
        registrationError?
        <>
          <Alert severity="error">Impossibile procedere con la registrazione!</Alert>
          <Box sx={{ padding: 2 }}></Box>
        </> : null
      }
      <TextField
        fullWidth
        label='Nome'
        variant='outlined'
        id="firstName"
        type="text"
        value={firstName}
        onChange={(event) => handleChangeFirstName(event.target.value)}
        error={!!firstNameError}
        helperText={firstNameError}
      />
      <Box sx={{ padding: 1 }}></Box>
      <TextField
        fullWidth
        label='Cognome'
        variant='outlined'
        id="lastName"
        type="text"
        value={lastName}
        onChange={(event) => handleChangeLastName(event.target.value)}
        error={!!lastNameError}
        helperText={lastNameError}
      />
      <Box sx={{ padding: 1 }}></Box>
      <TextField
        fullWidth
        label='Email'
        variant='outlined'
        id="email"
        type="email"
        value={email}
        onChange={(event) => handleChangeEmail(event.target.value)}
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
      <Button variant='contained' disabled={formSubmitted? !canRegister() : false} onClick={handleClickRegister}>Registrati</Button>
    </Box>
  );
}