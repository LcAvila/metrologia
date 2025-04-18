'use client';
import { useState, memo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  title: string;
}

// Usando memo para evitar renderizações desnecessárias do componente Sidebar
const Sidebar = memo(function Sidebar({ title }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

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
      />

      {/* Sidebar com animações melhoradas e persistência */}
      <div 
        className={`sidebar fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-50 will-change-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${theme === 'dark' ? 'bg-black/20 backdrop-blur-md border-r border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'bg-gray-900 border-r border-gray-200/50 shadow-lg'} text-white
          ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}
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
                  alt="Logo Metrologia Compactor" 
                  className={`w-full h-auto transform transition-all duration-300 ease-in-out hover:scale-105`}
                />
              </div>
              <span className={`text-lg font-semibold transition-all duration-300 ml-1 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Metrologia Compactor</span>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              className="transform transition-transform duration-200 hover:scale-110 focus:outline-none hidden md:block mr-2"
              onClick={toggleSidebar}
              title={isExpanded ? 'Recolher menu' : 'Expandir menu'}
            >
              <i className={`bx ${isExpanded ? 'bx-chevron-left' : 'bx-chevron-right'} text-xl`}></i>
            </button>
            <button 
              className="md:hidden transform transition-transform duration-200 hover:scale-110 focus:outline-none"
              onClick={closeSidebar}
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
        </div>
        <nav className="p-4 flex flex-col h-full justify-between flex-grow overflow-y-auto">
          <ul className="space-y-2">
            {[
              { href: '/', icon: 'bx-wrench', text: 'Equipamentos' },
              { href: '/cadastro-equipamento', icon: 'bx-plus-circle', text: 'Cadastrar Equipamento' },
              { href: '/controle-emissao-certificado', icon: 'bxs-objects-horizontal-left', text: 'Controle de Emissão de Certificado' },
              { href: '/certificados', icon: 'bxs-report', text: 'Certificados' }
            ].map((item, index) => (
              <li key={item.href} style={{ animationDelay: `${index * 100}ms` }}>
                <Link 
                  href={item.href} 
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:bg-[var(--sidebar-hover)] hover:shadow-md relative group"
                  title={!isExpanded ? item.text : ''}
                >
                  <i className={`bx ${item.icon} ${isExpanded ? 'mr-2' : 'mx-auto'} text-xl`}></i>
                  {isExpanded ? (
                    <span className="transition-opacity duration-300">{item.text}</span>
                  ) : (
                    <span className="absolute left-full ml-2 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
                      {item.text}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Theme Toggle Switch */}
          <div className="p-2 mt-auto border-t border-opacity-20 border-[var(--sidebar-text)] w-full">
            <div 
              className="flex items-center justify-center w-full p-2 rounded-lg transition-all duration-200 hover:bg-[var(--sidebar-hover)] hover:shadow-md relative group"
              title={!isExpanded ? 'Alternar tema' : ''}
            >
              {isExpanded ? (
                <>
                  {/* Layout para sidebar expandida */}
                  <i className={`bx bx-sun text-xl ${theme === 'light' ? 'text-[var(--warning)]' : 'opacity-50'} mr-2`}></i>
                  
                  {/* Switch Interruptor */}
                  <div className="relative flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        aria-label="Alternar tema"
                      />
                      <div className="relative w-11 h-6 bg-[var(--card-bg)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                  </div>
                  
                  <i className={`bx bx-moon text-xl ${theme === 'dark' ? 'text-[var(--primary)]' : 'opacity-50'} ml-2`}></i>
                </>
              ) : (
                <>
                  {/* Layout para sidebar recolhida - centralizado verticalmente */}
                  <div className="flex flex-col items-center">
                    <i className={`bx bx-sun text-xl ${theme === 'light' ? 'text-[var(--warning)]' : 'opacity-50'} mb-1`}></i>
                    
                    {/* Switch Interruptor */}
                    <div className="relative flex items-center my-1">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={theme === 'dark'}
                          onChange={toggleTheme}
                          aria-label="Alternar tema"
                        />
                        <div className="relative w-8 h-4 bg-[var(--card-bg)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary)] scale-90"></div>
                      </label>
                    </div>
                    
                    <i className={`bx bx-moon text-xl ${theme === 'dark' ? 'text-[var(--primary)]' : 'opacity-50'} mt-1`}></i>
                  </div>
                </>
              )}
              
              {/* Tooltip para quando recolhido */}
              {!isExpanded && (
                <span className="absolute left-full ml-2 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
                  
                </span>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Header com animações */}
      <header className={`md:hidden ${theme === 'dark' ? 'bg-black/20 backdrop-blur-md border-b border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'bg-white/70 backdrop-blur-md border-b border-gray-200/50'} text-[var(--sidebar-text)] p-4 flex items-center justify-between shadow-md`}>
        <button 
          onClick={openSidebar}
          className="transform transition-transform duration-200 hover:scale-110 focus:outline-none"
        >
          <i className="bx bx-menu text-2xl"></i>
        </button>
        <div className="flex items-center">
          <img 
            src="/assets/logo.png" 
            alt="Logo Metrologia Compactor" 
            className="h-8 mr-1" 
          />
          <h1 className="text-xl font-semibold transform transition-transform duration-200">Metrologia Compactor</h1>
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