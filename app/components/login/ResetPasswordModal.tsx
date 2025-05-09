'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { resetPassword } from '../../lib/supabaseClient';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({ open, onClose }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        throw error;
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setEmail('');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Erro ao solicitar redefinição de senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          style: {
            backgroundColor: 'var(--card-bg)',
            color: 'var(--foreground)',
            border: '1px solid var(--card-border)'
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center">
          <span>Redefinir Senha</span>
          <IconButton 
            onClick={handleClose}
            size="small"
            style={{ color: 'var(--foreground)' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <p className="mb-4 text-sm">
              Informe seu e-mail para receber um link de redefinição de senha.
            </p>
            
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="E-mail"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                style: { 
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)'
                }
              }}
              InputLabelProps={{
                style: { color: 'var(--input-text)' }
              }}
              required
            />
            
            {error && (
              <Alert severity="error" className="mt-3">
                {error}
              </Alert>
            )}
          </DialogContent>
          
          <DialogActions className="p-4">
            <Button 
              onClick={handleClose}
              variant="outlined"
              style={{ 
                borderColor: 'var(--button-bg)',
                color: 'var(--button-text)',
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)' 
              }}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={3000} 
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          E-mail enviado com sucesso! Verifique sua caixa de entrada.
        </Alert>
      </Snackbar>
    </>
  );
}
