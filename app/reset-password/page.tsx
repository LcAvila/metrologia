'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { Paper, Box, Typography, TextField, Button, Alert } from '@mui/material';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) {
      setError('Erro ao redefinir senha. Link expirado ou inválido.');
    } else {
      setSuccess('Senha redefinida com sucesso! Faça login novamente.');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="background-grid"></div>
      <div className="background-blur"></div>
      <Paper elevation={3} className="w-full max-w-md p-6 sm:p-8" sx={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}>
        <Typography variant="h5" className="mb-4 font-bold text-center">Redefinir Senha</Typography>
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        {success && <Alert severity="success" className="mb-4">{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nova senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{ style: { backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' } }}
            InputLabelProps={{ style: { color: 'var(--input-text)' } }}
            required
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            InputProps={{ style: { backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' } }}
            InputLabelProps={{ style: { color: 'var(--input-text)' } }}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            className="mt-4 py-3"
            sx={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)', '&:hover': { backgroundColor: 'var(--button-hover)' } }}
          >
            {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
