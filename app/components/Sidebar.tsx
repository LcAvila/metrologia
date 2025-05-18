'use client';
import { useState, memo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

interface SidebarProps {
  title: string;
}

// Usando memo para evitar renderizações desnecessárias do componente Sidebar
const Sidebar = memo(function Sidebar({ title }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'metrologista' | 'quimico' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserTypeAndEmail() {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      const email = data?.user?.email;
      if (userId) {
        const tipo = await (await import('../lib/supabaseClient')).getUserType(userId);
        setUserType(tipo);
      }
      if (email) {
        setUserEmail(email);
      }
    }
    fetchUserTypeAndEmail();
  }, []);

  useEffect(() => {
    // Verificar e atualizar o estado da sidebar após a montagem do componente
    const savedState = sessionStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setIsExpanded(savedState === 'true');
    }
  }, []);

  // Otimizando os handlers para melhorar a performance e persistir o estado
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    sessionStorage.setItem('sidebarOpen', 'false');
  }, []);
  
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    sessionStorage.setItem('sidebarOpen', 'true');
  }, []);
  
  const toggleSidebar = useCallback(() => {
    setIsExpanded(prev => {
      const newState = !prev;
      sessionStorage.setItem('sidebarExpanded', String(newState));
      return newState;
    });
  }, []);

  // Adicionando animações de abertura e fechamento com persistência de estado
  useEffect(() => {
    const sidebarElement = document.querySelector('.sidebar') as HTMLElement;
    if (!sidebarElement) return;
    
    // Aplicar transições mais suaves
    sidebarElement.style.transition = 'transform 0.3s ease-in-out';
    
    // Salvar o estado da sidebar no sessionStorage para persistência entre navegações
    const savedSidebarState = sessionStorage.getItem('sidebarOpen');
    if (savedSidebarState) {
      setSidebarOpen(savedSidebarState === 'true');
    }
    
    // Não vamos mais manipular a opacidade da sidebar inteira
    // para garantir que a logo permaneça visível mesmo quando fechada
    
    // Adicionar listener para quando a janela for redimensionada
    const handleResize = () => {
      // Podemos adicionar lógica adicional de responsividade aqui se necessário
    };
    
    window.addEventListener('resize', handleResize);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  // Previne o scroll quando a sidebar estiver aberta em dispositivos móveis
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Overlay com efeito de fade */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 md:hidden ${sidebarOpen ? 'opacity-50 z-40' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar com animações melhoradas e persistência */}
      <div 
        className={`sidebar fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-50 will-change-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${theme === 'dark' ? 'bg-black/20 backdrop-blur-md border-r border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'bg-[#464646] border-r border-[#6f6f6f]/50 shadow-lg'} text-[#f8f8f8]
          ${isExpanded ? 'w-[75vw] sm:w-64 md:w-64' : 'w-16'} flex flex-col`}
        style={{
          backfaceVisibility: 'hidden', // Melhora a performance da animação
          WebkitBackfaceVisibility: 'hidden',
          perspective: '1000px',
          WebkitPerspective: '1000px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-opacity-20 border-[var(--sidebar-text)]">
          <div className="flex flex-col items-center w-full py-2">
            <div className="flex items-center justify-center">
              <div className={`relative transition-all duration-300 ease-in-out ${isExpanded ? 'w-32' : 'w-12'}`}>
                <img 
                  src="/assets/logo.png" 
                  alt="Logo AVZ Quality" 
                  className={`w-full h-auto transform transition-all duration-300 ease-in-out hover:scale-105`}
                />
              </div>
              <span className={`text-lg font-semibold transition-all duration-300 ml-1 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                <span className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 bg-clip-text text-transparent font-bold">AVZ</span> Quality
              </span>
            </div>
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <button 
                className="transform transition-transform duration-200 hover:scale-110 focus:outline-none hidden md:block mr-2"
                onClick={toggleSidebar}
                title="Recolher menu"
              >
                <i className="bx bx-chevron-left text-xl text-white"></i>
              </button>
            ) : (
              <button 
                className="transform transition-transform duration-200 hover:scale-110 focus:outline-none hidden md:block mr-2"
                onClick={toggleSidebar}
                title="Expandir menu"
              >
                <i className="bx bx-chevron-right text-xl text-white"></i>
              </button>
            )}
            <button 
              className="md:hidden transform transition-transform duration-200 hover:scale-110 focus:outline-none"
              onClick={closeSidebar}
            >
              <i className="bx bx-x text-2xl text-white"></i>
            </button>
          </div>
        </div>
        <nav className="p-4 flex flex-col h-full justify-between flex-grow overflow-y-auto">
          <ul className="space-y-2">
            {/* Só renderiza os links quando userType está carregado */}
            {userType && (() => {
              const metrologiaLinks = [
                { href: '/metrologia', icon: 'bx-wrench', text: 'Equipamentos' },
                { href: '/metrologia/cadastro-equipamento', icon: 'bx-plus-circle', text: 'Cadastrar Equipamento' },
                { href: '/controle-emissao-certificado', icon: 'bxs-objects-horizontal-left', text: 'Controle de Emissão de Certificado' },
                { href: '/certificados', icon: 'bxs-report', text: 'Certificados' }
              ];
              // FISPQ usa agora um layout sem sidebar, então não listamos aqui
              const adminLinks = [
                { href: '/admin', icon: 'bx-grid-alt', text: 'Painel Admin' }
              ];
              let linksToShow: {href: string, icon: string, text: string}[] = [];
              if (userType === 'admin') {
                linksToShow = [
                  { href: '', icon: '', text: 'Metrologia' },
                  ...metrologiaLinks,
                  { href: '', icon: '', text: 'Administração' },
                  ...adminLinks
                ];
              } else if (userType === 'metrologista') {
                linksToShow = metrologiaLinks;
              }
              // FISPQ agora usa layout sem sidebar
              return linksToShow.map((item) => (
                item.href ? (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className="flex items-center p-2 rounded-lg hover:bg-[var(--sidebar-hover)] relative group"
                      title={!isExpanded ? item.text : ''}
                    >
                      {item.icon && <i className={`bx ${item.icon} ${isExpanded ? 'mr-2' : 'mx-auto'} text-xl text-[var(--sidebar-text)]`}></i>}
                      {isExpanded ? (
                        <span>{item.text}</span>
                      ) : (
                        <span className="absolute left-full ml-2 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-md">
                          {item.text}
                        </span>
                      )}
                    </Link>
                  </li>
                ) : (
                  <li key={item.text} className="mt-4 mb-1 text-xs font-bold text-[var(--sidebar-text)] uppercase tracking-widest opacity-70">
                    {item.text}
                  </li>
                )
              ));
            })()}
          </ul>
          <div className="p-2 mt-auto border-t border-opacity-20 border-[var(--sidebar-text)] w-full">
  <>
    <div 
      className="flex items-center justify-center w-full p-2 rounded-lg transition-all duration-200 cursor-pointer"
    >
      {/* Layout para sidebar expandida/recolhida */}
      {isExpanded ? (
        <div onClick={toggleTheme} className="flex items-center p-2 rounded-lg hover:bg-gray-700/20 cursor-pointer">
          {/* Light icon */}
          <i className={`bx bx-sun text-xl mr-2 ${theme === 'light' ? 'text-yellow-400' : 'text-gray-400 opacity-60'}`}></i>
          {/* Switch Interruptor */}
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={theme === 'dark'}
              onChange={(e) => {
                e.stopPropagation(); // Evitar duplo trigger
                toggleTheme();
              }}
              aria-label="Alternar tema"
            />
            <div className="relative w-8 h-4 bg-[var(--card-bg)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary)] scale-90"></div>
          </div>
          {/* Dark icon */}
          <i className={`bx bx-moon text-xl ml-2 ${theme === 'dark' ? 'text-[var(--primary)] opacity-100' : 'text-gray-400 opacity-60'}`}></i>
        </div>
      ) : (
        <div onClick={toggleTheme} className="flex flex-col items-center hover:bg-gray-700/20 rounded-lg p-2 cursor-pointer">
          <i className={`bx bx-sun text-xl ${theme === 'light' ? 'text-yellow-400' : 'text-gray-400 opacity-60'} mb-1`}></i>
          {/* Switch Interruptor */}
          <div className="relative flex items-center my-1">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={theme === 'dark'}
                onChange={(e) => {
                  e.stopPropagation(); // Evitar duplo trigger
                  toggleTheme();
                }}
                aria-label="Alternar tema"
              />
              <div className="relative w-8 h-4 bg-[var(--card-bg)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary)] scale-90"></div>
            </label>
          </div>
          {/* Dark icon */}
          <i className={`bx bx-moon text-xl mt-1 ${theme === 'dark' ? 'text-[var(--primary)] opacity-100' : 'text-gray-400 opacity-60'}`}></i>
        </div>
      )}
      
      {/* Tooltip para quando recolhido */}
      {!isExpanded && (
        <span className="absolute left-full ml-2 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
          Alternar tema
        </span>
      )}
    </div>
  </>
</div>
          <button
            className={`flex items-center justify-center w-full mt-4 p-2 rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 ${isExpanded ? 'justify-start' : 'justify-center'}`}
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            title="Sair"
          >
            <i className="bx bx-log-out text-xl" />
            {isExpanded && <span className="ml-2 font-medium">Sair</span>}
          </button>
        </nav>
      </div>

      {/* Mobile Header com animações */}
      <header className={`fixed top-0 left-0 right-0 z-40 md:hidden ${theme === 'dark' ? 'bg-black/20 backdrop-blur-md border-b border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'bg-white/70 backdrop-blur-md border-b border-gray-200/50'} text-[var(--sidebar-text)] px-3 py-2 flex items-center justify-between shadow-md`}>
        <button 
          onClick={openSidebar}
          className="transform transition-transform duration-200 hover:scale-110 focus:outline-none p-1 -ml-1"
          aria-label="Abrir menu"
        >
          {/* Use light/dark variants for menu icon color */}
          <i className={`bx bx-menu text-xl sm:text-2xl text-[var(--sidebar-text)] light:text-[var(--foreground)]`}></i>
        </button>
        <div className="flex items-center">
          <img 
            src="/assets/logo.png" 
            alt="Logo Metrologia Compactor" 
            className="h-5 sm:h-7 mr-1" 
          />
          <h1 className="text-sm sm:text-lg font-semibold transform transition-transform duration-200 truncate max-w-[140px] sm:max-w-[220px] md:max-w-none">{title || 'Metrologia Compactor'}</h1>
        </div>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </header>

      {/* Estilos globais para animações */}
      <style jsx global>{
        `
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        nav li {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
        `
      }</style>
    </>
  );
});

export default Sidebar;