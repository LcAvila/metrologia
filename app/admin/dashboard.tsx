'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  HiUsers, 
  HiDocumentText, 
  HiClock, 
  HiChartPie, 
  HiViewGrid, 
  HiBeaker, 
  HiCalendar,
  HiCube,
  HiOfficeBuilding,
  HiCog,
  HiPlus,
  HiExclamation,
  HiCheck,
  HiOutlineChevronDown
} from 'react-icons/hi';

// Importar componentes do dashboard
import StatCard from './components/StatCard';
import ModuleCard from './components/ModuleCard';
import ActivityCard from './components/ActivityCard';
import AlertItem from './components/AlertItem';

interface Stats {
  metrologia: {
    totalCertificados: number;
    certificadosRecentes: number;
    equipamentos: number;
    equipamentosVencidos: number;
    proximasCalibracoes: number;
  };
  fispq: {
    totalFispqs: number;
    fispqsExpirando: number;
    setores: number;
    fichasEmergencia: number;
  };
  usuarios: {
    total: number;
    metrologistas: number;
    quimicos: number;
    admin: number;
    ativos: number;
  };
  atividades: Activity[];
}

interface Activity {
  id: string;
  tipo: 'fispq' | 'certificado' | 'usuario' | 'equipamento';
  acao: 'criacao' | 'atualizacao' | 'exclusao';
  descricao: string;
  data: string;
  usuario: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    metrologia: { 
      totalCertificados: 0, 
      certificadosRecentes: 0, 
      equipamentos: 0,
      equipamentosVencidos: 0,
      proximasCalibracoes: 0
    },
    fispq: { 
      totalFispqs: 0, 
      fispqsExpirando: 0, 
      setores: 0,
      fichasEmergencia: 0
    },
    usuarios: { 
      total: 0, 
      metrologistas: 0, 
      quimicos: 0,
      admin: 0,
      ativos: 0
    },
    atividades: []
  });
  
  // Dados simulados para expiração
  const [expirandoCertificados] = useState([
    { id: '1', nome: 'Calibração Micrômetro 25mm', data: '2025-06-15', tipo: 'Certificado' },
    { id: '2', nome: 'Calibração Balança Analítica', data: '2025-06-10', tipo: 'Certificado' },
    { id: '3', nome: 'Calibração Paquímetro Digital', data: '2025-06-22', tipo: 'Certificado' }
  ]);
  
  const [expirandoFispqs] = useState([
    { id: '1', nome: 'FISPQ Acetona PA', data: '2025-06-05', tipo: 'FISPQ' },
    { id: '2', nome: 'FISPQ Álcool Etílico 70%', data: '2025-06-12', tipo: 'FISPQ' },
    { id: '3', nome: 'FISPQ Ácido Clorídrico', data: '2025-06-18', tipo: 'FISPQ' },
    { id: '4', nome: 'FISPQ Hipoclorito de Sódio', data: '2025-06-24', tipo: 'FISPQ' }
  ]);

  useEffect(() => {
    loadStats();
    // Simulação de atividades recentes
    const mockActivities: Activity[] = [
      {
        id: '1',
        tipo: 'fispq',
        acao: 'criacao',
        descricao: 'FISPQ Acetona PA adicionada',
        data: '2025-05-11T15:30:00',
        usuario: 'maria.silva'
      },
      {
        id: '2',
        tipo: 'certificado',
        acao: 'atualizacao',
        descricao: 'Certificado de Paquímetro atualizado',
        data: '2025-05-11T14:15:00',
        usuario: 'joao.pereira'
      },
      {
        id: '3',
        tipo: 'usuario',
        acao: 'criacao',
        descricao: 'Novo usuário cadastrado: Carlos Santos',
        data: '2025-05-10T16:45:00',
        usuario: 'admin'
      },
      {
        id: '4',
        tipo: 'equipamento',
        acao: 'exclusao',
        descricao: 'Equipamento removido: Balança antiga',
        data: '2025-05-10T10:20:00',
        usuario: 'ana.ferreira'
      },
      {
        id: '5',
        tipo: 'fispq',
        acao: 'atualizacao',
        descricao: 'FISPQ Álcool Etílico atualizada',
        data: '2025-05-09T11:05:00',
        usuario: 'carlos.quimico'
      }
    ];
    
    setStats(prev => ({...prev, atividades: mockActivities}));
  }, []);

  async function loadStats() {
    try {
      // Aqui implementaria a lógica real para buscar dados do Supabase
      // Estatísticas de Metrologia - Simplificado para demonstração
      const metrologia = {
        totalCertificados: 42,
        certificadosRecentes: 8,
        equipamentos: 35,
        equipamentosVencidos: 3,
        proximasCalibracoes: 5
      };

      // Estatísticas de FISPQ - Simplificado para demonstração
      const fispq = {
        totalFispqs: 68,
        fispqsExpirando: 12,
        setores: 6,
        fichasEmergencia: 24
      };

      // Estatísticas de Usuários - Simplificado para demonstração
      const usuarios = {
        total: 15,
        metrologistas: 5,
        quimicos: 4,
        admin: 2,
        ativos: 12
      };

      setStats({
        metrologia,
        fispq,
        usuarios,
        atividades: stats.atividades
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header com logo e informações de usuário */}
      <header className="sticky top-0 z-30 w-full py-4 px-6 md:px-10 bg-black/40 backdrop-blur-sm border-b border-gray-800 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <HiViewGrid className="text-xl" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <HiCog className="text-xl text-gray-300" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
              LA
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Lucas Ávila</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo geral - Cards de estatísticas principais */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Visão Geral</h2>
            <div className="text-sm text-gray-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Usuários"
              value={stats.usuarios.total}
              icon={HiUsers}
              color="text-blue-400"
              change={8}
              subtitle={`${stats.usuarios.ativos} ativos`}
            />
            
            <StatCard
              title="Certificados"
              value={stats.metrologia.totalCertificados}
              icon={HiDocumentText}
              color="text-green-400"
              change={15}
              subtitle={`${stats.metrologia.certificadosRecentes} novos este mês`}
            />
            
            <StatCard
              title="FISPQ"
              value={stats.fispq.totalFispqs}
              icon={HiBeaker}
              color="text-purple-400"
              change={-3}
              subtitle={`${stats.fispq.fispqsExpirando} a expirar`}
            />
            
            <StatCard
              title="Equipamentos"
              value={stats.metrologia.equipamentos}
              icon={HiCube}
              color="text-yellow-400"
              change={5}
              subtitle={`${stats.metrologia.equipamentosVencidos} com calibração vencida`}
            />
          </div>
        </div>
        
        {/* Alertas e documentos expirando */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-5">Alertas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <AlertItem
                title="Certificados Expirando"
                items={expirandoCertificados}
              />
              
              <AlertItem
                title="FISPQs Expirando"
                items={expirandoFispqs}
              />
            </div>
            
            <ActivityCard activities={stats.atividades} />
          </div>
        </div>
        
        {/* Módulos principais */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-5">Módulos</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Módulo de Metrologia */}
            <ModuleCard
              title="Metrologia"
              icon={HiCube}
              statItems={[
                { label: 'Certificados', value: stats.metrologia.totalCertificados, icon: HiDocumentText, color: 'text-blue-400' },
                { label: 'Equipamentos', value: stats.metrologia.equipamentos, icon: HiCube, color: 'text-green-400' },
                { label: 'Próx. Calibrações', value: stats.metrologia.proximasCalibracoes, icon: HiCalendar, color: 'text-yellow-400' }
              ]}
              actions={[
                { label: 'Acessar Módulo', onClick: () => router.push('/metrologia') },
                { label: 'Novo Certificado', onClick: () => router.push('/metrologia/certificados/novo') },
                { label: 'Novo Equipamento', onClick: () => router.push('/metrologia/equipamentos/novo') }
              ]}
            />
            
            {/* Módulo de FISPQ */}
            <ModuleCard
              title="FISPQ e Fichas de Emergência"
              icon={HiBeaker}
              statItems={[
                { label: 'FISPQs', value: stats.fispq.totalFispqs, icon: HiDocumentText, color: 'text-purple-400' },
                { label: 'Fichas Emergência', value: stats.fispq.fichasEmergencia, icon: HiExclamation, color: 'text-red-400' },
                { label: 'Setores', value: stats.fispq.setores, icon: HiOfficeBuilding, color: 'text-indigo-400' }
              ]}
              actions={[
                { label: 'Acessar Módulo', onClick: () => router.push('/fispq') },
                { label: 'Nova FISPQ', onClick: () => router.push('/fispq/novo') },
                { label: 'Nova Ficha', onClick: () => router.push('/fispq/ficha-emergencia/novo') }
              ]}
            />
          </div>
        </div>
        
        {/* Botões de ações rápidas */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-white mb-5">Ações Rápidas</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/usuarios/novo')} 
              className="p-4 bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-800/30 rounded-xl flex items-center gap-3 hover:bg-blue-800/30 transition-colors group"
            >
              <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <HiPlus className="text-blue-400" />
              </div>
              <span className="font-medium">Novo Usuário</span>
            </button>
            
            <button 
              onClick={() => router.push('/admin/relatorios')} 
              className="p-4 bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-800/30 rounded-xl flex items-center gap-3 hover:bg-green-800/30 transition-colors group"
            >
              <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <HiChartPie className="text-green-400" />
              </div>
              <span className="font-medium">Relatórios</span>
            </button>
            
            <button 
              onClick={() => router.push('/admin/configuracoes')} 
              className="p-4 bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-800/30 rounded-xl flex items-center gap-3 hover:bg-purple-800/30 transition-colors group"
            >
              <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <HiCog className="text-purple-400" />
              </div>
              <span className="font-medium">Configurações</span>
            </button>
            
            <button 
              onClick={() => router.push('/consulta')} 
              className="p-4 bg-gradient-to-br from-gray-700/40 to-gray-600/20 border border-gray-600/30 rounded-xl flex items-center gap-3 hover:bg-gray-600/30 transition-colors group"
            >
              <div className="p-3 rounded-lg bg-gray-500/20 group-hover:bg-gray-500/30 transition-colors">
                <HiCheck className="text-gray-400" />
              </div>
              <span className="font-medium">Área Pública</span>
            </button>
          </div>
        </div>
      </main>

      {/* Rodapé fixo */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-black/80 backdrop-blur-sm border-t border-gray-800 text-center text-gray-400 text-sm z-10">
        <div className="max-w-7xl mx-auto">
          <p>Sistema de Documentação Técnica &copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <div className="flex flex-wrap justify-center gap-4 mt-1 text-xs">
            <Link href="/politica-privacidade" className="hover:text-gray-200 transition-colors">Política de Privacidade</Link>
            <Link href="/termos-uso" className="hover:text-gray-200 transition-colors">Termos de Uso</Link>
            <Link href="/faq" className="hover:text-gray-200 transition-colors">FAQ</Link>
            <span className="text-blue-400">Desenvolvido por Lucas Ávila</span>
          </div>
        </div>
      </footer>
      
      {/* Espaço para evitar que o conteúdo fique atrás do footer fixo */}
      <div className="h-24"></div>
    </div>
  );
}
