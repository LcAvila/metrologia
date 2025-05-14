'use client';
import { useState } from 'react';
import { FISPQ } from '../types/fispq';
import { HiDocumentText, HiDownload, HiOutlinePencil, HiTrash, HiExclamation, HiShieldExclamation } from 'react-icons/hi';
import { motion } from 'framer-motion';
import VisualizarPdf from '../../components/VisualizarPdf';
import { formatarData } from '../../utils/formatters';

interface FISPQCardProps {
  fispq: FISPQ;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const FISPQCard: React.FC<FISPQCardProps> = ({ 
  fispq, 
  onEdit, 
  onDelete,
  isAdmin = false
}) => {
  const [showPdf, setShowPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpiring = () => {
    const today = new Date();
    const validadeDate = new Date(fispq.validade);
    const diffDays = Math.ceil((validadeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = () => {
    const today = new Date();
    const validadeDate = new Date(fispq.validade);
    return validadeDate < today;
  };

  const getStatusBadge = () => {
    if (isExpired()) {
      return (
        <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400 flex items-center gap-1">
          <HiExclamation className="text-red-400" />
          Expirado
        </div>
      );
    } else if (isExpiring()) {
      return (
        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400 flex items-center gap-1">
          <HiExclamation className="text-yellow-400" />
          Expirando
        </div>
      );
    }
    return (
      <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 flex items-center gap-1">
        <HiDocumentText className="text-green-400" />
        Válido
      </div>
    );
  };

  const handleDownload = () => {
    try {
      if (!fispq.arquivoUrl) {
        setError('URL do arquivo não disponível');
        return;
      }
      
      window.open(fispq.arquivoUrl, '_blank');
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      setError('Erro ao baixar o arquivo. Tente novamente mais tarde.');
    }
  };

  const handleViewPdf = () => {
    if (!fispq.arquivoUrl) {
      setError('URL do arquivo não disponível');
      return;
    }
    setShowPdf(true);
  };

  return (
    <>
      <motion.div 
        className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 relative overflow-hidden hover:border-blue-800/50 transition-colors"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {getStatusBadge()}
        
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
            <HiDocumentText className="text-2xl text-blue-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">{fispq.produto}</h3>
            <p className="text-sm text-gray-400">Fabricante: {fispq.fabricante}</p>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Setor</p>
                <p className="text-sm text-white">{fispq.setor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Validade</p>
                <p className="text-sm text-white">{formatarData(fispq.validade)}</p>
              </div>
              {fispq.numeroCas && (
                <div>
                  <p className="text-xs text-gray-500">Número CAS</p>
                  <p className="text-sm text-white">{fispq.numeroCas}</p>
                </div>
              )}
              {fispq.tipoRisco && (
                <div>
                  <p className="text-xs text-gray-500">Tipo de Risco</p>
                  <p className="text-sm text-white">{fispq.tipoRisco}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/30 text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap justify-end gap-2">
          <button
            onClick={handleViewPdf}
            className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-800/40 text-blue-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <HiDocumentText /> Visualizar
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-green-900/30 hover:bg-green-800/40 text-green-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <HiDownload /> Baixar
          </button>
          
          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(fispq.id)}
              className="px-3 py-1.5 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
            >
              <HiOutlinePencil /> Editar
            </button>
          )}
          
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(fispq.id)}
              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-800/40 text-red-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
            >
              <HiTrash /> Excluir
            </button>
          )}
        </div>
      </motion.div>

      {showPdf && (
        <VisualizarPdf 
          filePath={fispq.arquivoUrl} 
          onClose={() => setShowPdf(false)} 
          title={`FISPQ - ${fispq.produto}`} 
        />
      )}
    </>
  );
};

export default FISPQCard;
