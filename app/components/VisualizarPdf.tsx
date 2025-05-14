"use client";

import { useState } from 'react';
import { getPublicUrl } from '../lib/getPublicUrl';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualizarPdfProps {
  filePath: string;
  onClose?: () => void;
  title?: string;
}

export default function VisualizarPdf({ filePath, onClose, title }: VisualizarPdfProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(onClose ? true : false);
  const [error, setError] = useState<string | null>(null);
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  }
  
  const handleOpen = () => {
    try {
      // A nova implementação de getPublicUrl é mais robusta e tenta várias abordagens
      const url = getPublicUrl(filePath);
      if (url.includes('erro.url')) {
        setError(`Não foi possível encontrar o documento: ${filePath}. Verifique se o arquivo existe no Supabase.`);
        return;
      }
      setIsOpen(true);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao abrir PDF:', err);
      setError('Não foi possível abrir o documento. Verifique se o bucket existe no Supabase.');
    }
  };
  

  return (
    <>
      {!onClose && (
        <button
          onClick={handleOpen}
          className="text-gray-400 hover:text-blue-400 p-1.5 rounded transition-colors"
          title="Visualizar PDF"
        >
          <i className="bx bx-show text-lg"></i>
        </button>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-900/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <i className="bx bx-error-circle text-xl"></i>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 z-50 bg-gray-900 rounded-xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-lg font-medium text-white">{title || 'Visualizando documento'}</h3>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <i className="bx bx-x text-xl"></i>
                </button>
              </div>
              
              <div className="flex-grow overflow-hidden p-0 bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                {filePath && (
                  <iframe 
                    src={getPublicUrl(filePath)}
                    className="w-full h-full relative z-10"
                    title="Visualizar PDF"
                    onLoad={(e) => {
                      // Esconde o spinner quando o iframe carrega
                      const target = e.target as HTMLIFrameElement;
                      if (target.parentElement) {
                        const spinner = target.parentElement.querySelector('div');
                        if (spinner) spinner.classList.add('hidden');
                      }
                    }}
                  />
                )}
              </div>
              
              <div className="p-4 border-t border-gray-800 flex justify-between">
                <a
                  href={getPublicUrl(filePath)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <i className="bx bx-download"></i>
                  Baixar documento
                </a>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
