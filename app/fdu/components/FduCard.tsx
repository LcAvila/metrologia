'use client';
import { useState } from 'react';
import { FDU } from '../types/fdu';
import { HiDocumentText, HiDownload, HiOutlinePencil, HiTrash, HiExclamation, HiShieldExclamation } from 'react-icons/hi';
import { motion } from 'framer-motion';
import VisualizarPdf from '../../components/VisualizarPdf';
import { formatarData } from '../../utils/formatters';

interface FDUCardProps {
  fdu: FDU;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const FDUCard: React.FC<FDUCardProps> = ({ 
  fdu, 
  onEdit, 
  onDelete,
  isAdmin = false
}) => {
  const [showPdf, setShowPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpiring = () => {
    const today = new Date();
    const validadeDate = new Date(fdu.validade);
    const diffDays = Math.ceil((validadeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = () => {
    const today = new Date();
    const validadeDate = new Date(fdu.validade);
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
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = fdu.arquivoUrl;
    link.download = `FDU_${fdu.produto}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPdf = () => {
    if (!fdu.arquivoUrl) {
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
          <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
            <HiDocumentText size={20} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium truncate">{fdu.produto}</h3>
            <p className="text-gray-500 text-sm truncate">Fabricante: {fdu.fabricante}</p>
            
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-400">
              <div>
                <p className="font-medium">Setor</p>
                <p className="text-white">{fdu.setor}</p>
              </div>
              {fdu.numeroCas && (
                <div>
                  <p className="font-medium">CAS</p>
                  <p className="text-white">{fdu.numeroCas}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Validade</p>
                <p className="text-white">{formatarData(fdu.validade)}</p>
              </div>
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
            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-full transition-colors"
            title="Visualizar FDU"
          >
            <HiDocumentText /> Visualizar
          </button>
          <a 
            href={fdu.arquivoUrl} 
            download
            className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-full transition-colors"
            title="Baixar FDU"
          >
            <HiDownload /> Baixar
          </a>
          
          {isAdmin && onEdit && (
            <button
              onClick={() => fdu.id && onEdit(fdu.id)}
              className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-full transition-colors"
              title="Editar FDU"
            >
              <HiOutlinePencil /> Editar
            </button>
          )}
          
          {isAdmin && onDelete && (
            <button
              onClick={() => fdu.id && onDelete(fdu.id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
              title="Excluir FDU"
            >
              <HiTrash /> Excluir
            </button>
          )}
        </div>
      </motion.div>

      {showPdf && (
        <VisualizarPdf
          filePath={fdu.arquivoUrl}
          title={`FDU - ${fdu.produto}`}
          onClose={() => setShowPdf(false)}
        />
      )}
    </>
  );
};

export default FDUCard;
