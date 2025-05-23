'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiBeaker, 
  HiDocumentText, 
  HiOfficeBuilding, 
  HiExclamation, 
  HiChartPie,
  HiPlus,
  HiSearch
} from 'react-icons/hi';
import { fduService } from '../services/fduService';
import { fichaEmergenciaService } from '../services/fichaEmergenciaService';

interface DashboardStats {
  fdu: {
    total: number;
    expirando: number;
    setores: number;
  };
  fichaEmergencia: {
    total: number;
    expirando: number;
    classesRisco: number;
  };
}

const FDUDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    fdu: { total: 0, expirando: 0, setores: 0 },
    fichaEmergencia: { total: 0, expirando: 0, classesRisco: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const fduStats = await fduService.getStatistics();
        const fichaStats = await fichaEmergenciaService.getStatistics();
        
        setStats({
          fdu: fduStats,
          fichaEmergencia: fichaStats
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => (
    <motion.div 
      className={`bg-gray-900/70 border border-gray-800 rounded-xl p-5 relative overflow-hidden`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 ${color}`}></div>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          <Icon className={`text-xl ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  const FduCard = () => (
    <motion.div 
      className={`bg-blue-900/20 border border-blue-900/40 rounded-xl p-6`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-blue-300">FDUs</h3>
        <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-300">
          <HiDocumentText />
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-3xl font-bold text-white">{stats.fdu.total}</p>
          <div className="px-2 py-1 rounded-full bg-blue-900/30 text-xs text-blue-300">
            {stats.fdu.expirando} expirando
          </div>
        </div>
        <p className="text-sm text-gray-400">{stats.fdu.setores} setores</p>
      </div>
    </motion.div>
  );

  const ActionButton = ({ title, icon: Icon, onClick, color }: {
    title: string;
    icon: React.ElementType;
    onClick: () => void;
    color: string;
  }) => (
    <motion.button
      onClick={onClick}
      className={`p-4 bg-gradient-to-br ${color}/20 border ${color}/30 rounded-xl flex items-center gap-3 hover:${color}/40 transition-colors group w-full`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`p-3 rounded-lg ${color}/20 group-hover:${color}/30 transition-colors`}>
        <Icon className={color} />
      </div>
      <span className="font-medium text-white">{title}</span>
    </motion.button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total de FDUs"
          value={stats.fdu.total}
          icon={HiBeaker}
          color="text-purple-400"
          subtitle="Documentos cadastrados"
        />
        
        <StatCard
          title="FDUs Expirando"
          value={stats.fdu.expirando}
          icon={HiExclamation}
          color="text-yellow-400"
          subtitle="Vencendo em até 30 dias"
        />
        
        <StatCard
          title="Fichas de Emergência"
          value={stats.fichaEmergencia.total}
          icon={HiDocumentText}
          color="text-green-400"
          subtitle="Documentos cadastrados"
        />
        
        <StatCard
          title="Setores Atendidos"
          value={stats.fdu.setores}
          icon={HiOfficeBuilding}
          color="text-blue-400"
          subtitle="Áreas com documentação"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <ActionButton
          title="Nova FDU"
          icon={HiPlus}
          onClick={() => window.location.href = '/fdu/cadastro'}
          color="from-purple-900 to-purple-800 text-purple-400 border-purple-800"
        />
        
        <ActionButton
          title="Nova Ficha de Emergência"
          icon={HiPlus}
          onClick={() => window.location.href = '/fdu/emergencia/cadastro'}
          color="from-green-900 to-green-800 text-green-400 border-green-800"
        />
        
        <ActionButton
          title="Consultar FDU"
          icon={HiSearch}
          onClick={() => window.location.href = '/fdu/consulta'}
          color="from-blue-900 to-blue-800 text-blue-400 border-blue-800"
        />
        
        <ActionButton
          title="Relatórios"
          icon={HiChartPie}
          onClick={() => window.location.href = '/fdu/relatorios'}
          color="from-yellow-900 to-yellow-800 text-yellow-400 border-yellow-800"
        />
      </div>
    </div>
  );
};

export default FDUDashboard;
