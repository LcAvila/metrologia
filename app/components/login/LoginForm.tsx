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
import { signInWithEmail, getUserType } from '../../lib/supabaseClient';
import ResetPasswordModal from './ResetPasswordModal';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
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
      // Realizar login
      const { data, error } = await signInWithEmail(formData.email, formData.password);
      
      if (error) {
        throw error;
      }

      // Se o login foi bem-sucedido, verificar o tipo de usuário
      if (data.user) {
        const userType = await getUserType(data.user.id);
        
        // Redirecionar com base no tipo de usuário
        if (userType === 'metrologista') {
          router.push('/metrologia');
        } else if (userType === 'quimico') {
          router.push('/fispq');
        } else {
          // Se não tiver tipo definido, redirecionar para a página inicial
          router.push('/');
        }
      }
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login.';
      
      // Tratar erros específicos
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box 
        className="min-h-screen flex items-center justify-center px-4 py-8"
      >
        <div className="background-grid"></div>
        <div className="background-blur"></div>
        
        <Paper 
          elevation={0}
          className="w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl bg-white/20 dark:bg-[#23272f]/30 backdrop-blur-lg border border-white/30 dark:border-[#23272f]/50"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'var(--foreground)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '1.25rem',
          }}
        >
          <Box className="text-center mb-6">
            <img src="/assets/logo.png" alt="Logo" className="mx-auto mb-4 h-12 drop-shadow" />
            <Typography variant="h4" component="h1" className="mb-2 font-bold tracking-tight">
              Bem-vindo ao Sistema da Compactor
            </Typography>
            <Typography variant="body1" className="text-muted">
              Faça login para continuar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange}
              InputProps={{
                style: { 
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)'
                }
              }}
              InputLabelProps={{
                style: { color: 'var(--input-text)' }
              }}
              aria-label="Endereço de e-mail"
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
              InputLabelProps={{
                style: { color: 'var(--input-text)' }
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
                onClick={() => setOpenResetModal(true)}
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
      
      <ResetPasswordModal 
        open={openResetModal}
        onClose={() => setOpenResetModal(false)}
      />
    </>
  );
}
