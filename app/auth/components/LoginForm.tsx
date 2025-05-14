'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Paper, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    matricula: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openResetModal, setOpenResetModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Buscar o email associado à matrícula
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('email')
        .eq('matricula', formData.matricula)
        .single();
      
      if (!usuarioData?.email) {
        setError('Matrícula não encontrada.');
        setIsLoading(false);
        return;
      }

      // 2. Realizar login com o email e senha
      const { user, session, error: loginError } = await authService.login(
        usuarioData.email, 
        formData.password
      );

      if (loginError) {
        let errorMessage = 'Erro ao fazer login.';
        
        if (loginError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Matrícula ou senha incorretos.';
        } else if (loginError.message?.includes('rate limit')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // 3. Login bem-sucedido - buscar o tipo de usuário e redirecionar
      if (user) {
        const userProfile = await authService.getUserProfile();
        
        if (userProfile) {
          // Determinar para onde redirecionar baseado no tipo de usuário
          const redirectUrl = authService.getRedirectUrl(userProfile.tipo_usuario);
          console.log(`Usuário autenticado como ${userProfile.tipo_usuario}. Redirecionando para ${redirectUrl}`);
          router.push(redirectUrl);
        } else {
          console.log('Perfil de usuário não encontrado. Redirecionando para /');
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Erro durante login:', error);
      setError('Ocorreu um erro durante o login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <>
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
            variant="h4"
            component="h1"
            className="mb-6 text-center font-bold"
            sx={{ color: 'var(--heading-color)' }}
          >
            Bem-vindo
          </Typography>
          
          {error && (
            <Alert severity="error" className="mb-4" sx={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="matricula"
              label="Matrícula"
              name="matricula"
              autoComplete="username"
              autoFocus
              value={formData.matricula}
              onChange={handleInputChange}
              disabled={isLoading}
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
                '& .MuiInputBase-input': {
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
                  '&.MuiInputLabel-shrink': { color: 'var(--primary)' },
                }
              }}
              aria-label="Matrícula"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                style: {
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)'
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Alternar visibilidade da senha"
                      onClick={handleTogglePassword}
                      edge="end"
                      style={{ color: 'var(--input-text)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'var(--input-bg) !important',
                  color: 'var(--input-text) !important',
                },
                '& .MuiInputBase-input': {
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
                  '&.MuiInputLabel-shrink': { color: 'var(--primary)' },
                }
              }}
              aria-label="Senha"
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
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Box className="text-center mt-4">
              <Button
                onClick={() => router.push('/auth/reset-password')}
                variant="text"
                className="text-sm"
                sx={{ color: 'var(--primary)' }}
              >
                Esqueceu sua senha?
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}
