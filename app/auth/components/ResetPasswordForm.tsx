'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Paper, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert
} from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!matricula) {
      setError('Preencha sua matrícula.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Buscar o email associado à matrícula
      const { data: usuarioData, error: findError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('matricula', matricula)
        .single();
      
      if (findError || !usuarioData?.email) {
        setError('Matrícula não encontrada.');
        setIsLoading(false);
        return;
      }

      // 2. Enviar email de redefinição
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(usuarioData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess('Um email de redefinição foi enviado para o endereço associado a esta matrícula.');
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      setError(error.message || 'Erro ao solicitar redefinição de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        throw error;
      }
      
      setSuccess('Senha redefinida com sucesso! Você será redirecionado para a página de login.');
      
      // Redirecionar para login após alguns segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      setError(error.message || 'Erro ao redefinir senha. Link expirado ou inválido.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar qual modo exibir baseado na URL (se tem hash de redefinição)
  const isResetMode = typeof window !== 'undefined' && 
    window.location.href.includes('#access_token=');

  // Use o useEffect para detectar o modo de redefinição quando o componente montar
  useEffect(() => {
    if (isResetMode) {
      setMode('reset');
    }
  }, [isResetMode]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="background-grid"></div>
      <div className="background-blur"></div>
      <Paper
        elevation={0}
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl bg-white/20 dark:bg-[#23272f]/30 backdrop-blur-lg border border-white/30 dark:border-[#23272f]/50"
        sx={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          color: 'var(--foreground)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          className="mb-6 text-center font-bold"
          sx={{ color: 'var(--heading-color)' }}
        >
          {mode === 'request' ? 'Recuperar Senha' : 'Redefinir Senha'}
        </Typography>
        
        {error && (
          <Alert severity="error" className="mb-4" sx={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" className="mb-4" sx={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
            {success}
          </Alert>
        )}
        
        {mode === 'request' ? (
          <form onSubmit={handleRequestReset}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="matricula"
              label="Matrícula"
              name="matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)'
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'var(--input-bg) !important',
                  color: 'var(--input-text) !important',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--primary)',
                },
              }}
              InputLabelProps={{
                sx: {
                  color: '#888',
                  '&.Mui-focused': { color: 'var(--primary)' },
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              className="mt-4 mb-3 py-3"
              sx={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
                '&:hover': {
                  backgroundColor: 'var(--button-hover)'
                }
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
            <Box className="text-center mt-4">
              <Button
                onClick={() => router.push('/auth/login')}
                variant="text"
                className="text-sm"
                sx={{ color: 'var(--primary)' }}
              >
                Voltar para Login
              </Button>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Nova Senha"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)'
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'var(--input-bg) !important',
                  color: 'var(--input-text) !important',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--primary)',
                },
              }}
              InputLabelProps={{
                sx: {
                  color: '#888',
                  '&.Mui-focused': { color: 'var(--primary)' },
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)'
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'var(--input-bg) !important',
                  color: 'var(--input-text) !important',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--primary)',
                },
              }}
              InputLabelProps={{
                sx: {
                  color: '#888',
                  '&.Mui-focused': { color: 'var(--primary)' },
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              className="mt-4 mb-3 py-3"
              sx={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
                '&:hover': {
                  backgroundColor: 'var(--button-hover)'
                }
              }}
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}
