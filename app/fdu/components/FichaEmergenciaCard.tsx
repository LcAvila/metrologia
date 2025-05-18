'use client';
import { useState } from 'react';
import { HiShieldExclamation, HiDownload, HiDocumentText, HiOutlinePencil, HiTrash, HiExclamation } from 'react-icons/hi';
import { motion } from 'framer-motion';
import VisualizarPdf from '../../components/VisualizarPdf';

// Importar a interface FichaEmergencia em vez de redefini-la localmente
import { FichaEmergencia } from '../types/fichaEmergencia';

interface FichaEmergenciaCardProps {
  ficha: FichaEmergencia;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const FichaEmergenciaCard: React.FC<FichaEmergenciaCardProps> = ({ 
  ficha, 
  onEdit, 
  onDelete,
  isAdmin = false
}) => {
  const [showPdf, setShowPdf] = useState(false);

  const isExpiring = () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Garantir que a data seja convertida corretamente
      const validadeDate = typeof ficha.validade === 'string' 
        ? new Date(ficha.validade) 
        : ficha.validade;
      
      // Normalizar para comparar apenas as datas (sem horas)
      const validadeNormalizada = new Date(validadeDate);
      validadeNormalizada.setHours(0, 0, 0, 0);
      
      const diffDays = Math.ceil((validadeNormalizada.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    } catch (error) {
      console.error('Erro ao calcular data de expiração:', error);
      return false;
    }
  };

  const isExpired = () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Garantir que a data seja convertida corretamente
      const validadeDate = typeof ficha.validade === 'string' 
        ? new Date(ficha.validade) 
        : ficha.validade;
      
      // Normalizar para comparar apenas as datas (sem horas)
      const validadeNormalizada = new Date(validadeDate);
      validadeNormalizada.setHours(0, 0, 0, 0);
      
      return validadeNormalizada < today;
    } catch (error) {
      console.error('Erro ao verificar se data está expirada:', error);
      return true; // Assume expirado em caso de erro
    }
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
      <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400 flex items-center gap-1">
        <HiShieldExclamation className="text-purple-400" />
        Vigente
      </div>
    );
  };

  return (
    <>
      <motion.div 
        className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 relative overflow-hidden hover:border-purple-800/50 transition-colors"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {getStatusBadge()}
        
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4">
            <HiShieldExclamation className="text-2xl text-purple-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">{ficha.nome}</h3>
            <p className="text-sm text-gray-400">Produto: {ficha.produto}</p>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Número ONU</p>
                <p className="text-sm text-white">{ficha.numeroOnu}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Classe de Risco</p>
                <p className="text-sm text-white">{ficha.classeRisco}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Validade</p>
                <p className="text-sm text-white">
                  {(() => {
                    try {
                      // Tenta converter para Date e formatar, se falhar mostra o valor original
                      const data = typeof ficha.validade === 'string' 
                        ? new Date(ficha.validade) 
                        : ficha.validade;
                      return data.toLocaleDateString('pt-BR');
                    } catch (error) {
                      console.error('Erro ao formatar data de validade:', error);
                      return String(ficha.validade);
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end gap-2">
          <button
            onClick={() => setShowPdf(true)}
            className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-800/40 text-blue-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <HiDocumentText /> Visualizar
          </button>
          <button
            onClick={() => window.open(ficha.arquivoUrl, '_blank')}
            className="px-3 py-1.5 bg-green-900/30 hover:bg-green-800/40 text-green-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <HiDownload /> Baixar
          </button>
          
          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(ficha.id)}
              className="px-3 py-1.5 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
            >
              <HiOutlinePencil /> Editar
            </button>
          )}
          
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(ficha.id)}
              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-800/40 text-red-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
            >
              <HiTrash /> Excluir
            </button>
          )}
        </div>
      </motion.div>

      {showPdf && (
        <VisualizarPdf 
          filePath={ficha.arquivoUrl} 
          onClose={() => setShowPdf(false)}
          title={`Ficha de Emergência - ${ficha.nome}`}
        />
      )}
    </>
  );
};

export default FichaEmergenciaCard;
