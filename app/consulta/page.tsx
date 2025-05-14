"use client";
import { useEffect, useState } from "react";
import VisualizarPdf from '../components/VisualizarPdf';
import { getPublicUrl } from '../lib/getPublicUrl';
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HiDocumentText, HiCollection } from 'react-icons/hi';
import { HiExclamationTriangle } from 'react-icons/hi2'; // Corrigindo o import
import PublicFISPQList from './components/PublicFISPQList';
import PublicFichaEmergenciaList from './components/PublicFichaEmergenciaList';

// Constantes para os filtros
const TIPOS = ["Todos", "certificado", "fispq", "emergencia", "laudo"];
const SETORES = ["Todos", "Injetoras", "Ferramentaria", "Qualidade", "Montagem", "Almoxarifado", "Manutenção", "Outros"];

// Interfaces
interface Documento {
  id: string;
  tipo: string;
  nome: string;
  numero?: string;
  setor?: string;
  validade?: string;
  arquivoUrl: string;
}

interface Equipment {
  id: string;
  type: string;
  sector: string;
  status: string;
  nextCalibration: string;
  model?: string;
  serialNumber?: string;
}

// MOCK de equipamentos cadastrados
const MOCK_EQUIPAMENTOS: Equipment[] = [
  {
    id: "EQP-001",
    type: "Paquímetro",
    sector: "Qualidade",
    status: "available",
    nextCalibration: "2025-06-10",
    model: "Mitutoyo 530-104",
    serialNumber: "A12345"
  },
  {
    id: "EQP-002",
    type: "Micrômetro",
    sector: "Ferramentaria",
    status: "expiring",
    nextCalibration: "2025-05-15",
    model: "Starrett 436",
    serialNumber: "B98765"
  },
  {
    id: "EQP-003",
    type: "Balança",
    sector: "Montagem",
    status: "expired",
    nextCalibration: "2025-04-01",
    model: "Toledo Prix 3",
    serialNumber: "C54321"
  }
];

export default function ConsultaPage() {
  // Estados
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [setor, setSetor] = useState("Todos");
  const [validadeIni, setValidadeIni] = useState("");
  const [validadeFim, setValidadeFim] = useState("");
  const [ordenar, setOrdenar] = useState("validade");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [activeTab, setActiveTab] = useState("certificados"); // Nova variável para controlar as abas

  // Efeito para buscar documentos
  useEffect(() => {
    const fetchDocumentos = async () => {
      setLoading(true);
      setErro(null);
      
      try {
        const { data, error } = await supabase
          .from("documentos_publicos")
          .select("id, tipo, nome, numero, setor, validade, arquivoUrl")
          .order("validade", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setDocumentos(data as Documento[]);
      } catch (error: any) {
        console.error('Erro ao buscar documentos:', error.message);
        setErro("Não foi possível carregar os documentos. Por favor, tente novamente mais tarde.");
        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentos();
  }, []);

  // Filtragem de documentos
  const documentosFiltrados = documentos.filter((doc) => {
    const termo = busca.toLowerCase();
    let valido = true;
    
    if (tipo !== "Todos" && doc.tipo !== tipo) valido = false;
    if (setor !== "Todos" && doc.setor !== setor) valido = false;
    if (validadeIni && doc.validade && new Date(doc.validade) < new Date(validadeIni)) valido = false;
    if (validadeFim && doc.validade && new Date(doc.validade) > new Date(validadeFim)) valido = false;
    
    if (termo && 
        !(doc.nome.toLowerCase().includes(termo) || 
          (doc.numero && doc.numero.toLowerCase().includes(termo)) || 
          (doc.setor && doc.setor.toLowerCase().includes(termo)) || 
          doc.tipo.toLowerCase().includes(termo)))
      valido = false;
      
    return valido;
  }).sort((a, b) => {
    if (ordenar === "validade") {
      return (a.validade || "").localeCompare(b.validade || "");
    }
    if (ordenar === "nome") {
      return a.nome.localeCompare(b.nome);
    }
    if (ordenar === "tipo") {
      return a.tipo.localeCompare(b.tipo);
    }
    return 0;
  });

  // Função para determinar o status baseado na validade
  const getStatus = (doc: Documento) => {
    if (!doc.validade) return "sem_data";
    
    const dataValidade = new Date(doc.validade);
    const hoje = new Date();
    const umMes = new Date();
    umMes.setMonth(hoje.getMonth() + 1);
    
    if (dataValidade < hoje) return "vencido";
    if (dataValidade < umMes) return "expirando";
    return "valido";
  };

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Renderização principal
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 relative">
              <Image 
                src="/logo.png"
                alt="Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Metrologia</h1>
              <p className="text-xs text-gray-400">Sistema de Documentação Técnica</p>
            </div>
          </Link>
          
          <div className="flex gap-2">
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Área Restrita
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Sistema de abas */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("certificados")}
              className={`inline-flex items-center p-4 border-b-2 font-medium text-sm ${activeTab === "certificados" ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300"}`}
            >
              <HiCollection className="mr-2 h-5 w-5" />
              Certificados
            </button>
            <button
              onClick={() => setActiveTab("fispqs")}
              className={`inline-flex items-center p-4 border-b-2 font-medium text-sm ${activeTab === "fispqs" ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300"}`}
            >
              <HiDocumentText className="mr-2 h-5 w-5" />
              FISPQs
            </button>
            <button
              onClick={() => setActiveTab("fichas_emergencia")}
              className={`inline-flex items-center p-4 border-b-2 font-medium text-sm ${activeTab === "fichas_emergencia" ? "text-purple-500 border-purple-500" : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300"}`}
            >
              <HiExclamationTriangle className="mr-2 h-5 w-5" />
              Fichas de Emergência
            </button>
          </div>
        </div>

        {/* Barra de busca principal */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, número, setor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-500"
            />
          </div>
          
          <button 
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-gray-700/60 transition-colors"
          >
            <i className={`bx bx-filter text-lg ${filtrosAbertos ? 'text-blue-400' : ''}`}></i>
            Filtros avançados
          </button>
        </div>

        {/* Filtros avançados - mostrados apenas quando ativados */}
        <AnimatePresence>
          {filtrosAbertos && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-5 rounded-xl bg-gray-800/30 border border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de documento</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Setor</label>
                  <select
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
                  >
                    {SETORES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Validade após</label>
                  <input
                    type="date"
                    value={validadeIni}
                    onChange={(e) => setValidadeIni(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Validade até</label>
                  <input
                    type="date"
                    value={validadeFim}
                    onChange={(e) => setValidadeFim(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
                  />
                </div>
                
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Ordenar por</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ordenar"
                        checked={ordenar === "validade"}
                        onChange={() => setOrdenar("validade")}
                        className="sr-only"
                      />
                      <span className={`p-2 rounded-lg ${ordenar === "validade" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"} transition-colors`}>Validade</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ordenar"
                        checked={ordenar === "nome"}
                        onChange={() => setOrdenar("nome")}
                        className="sr-only"
                      />
                      <span className={`p-2 rounded-lg ${ordenar === "nome" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"} transition-colors`}>Nome</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ordenar"
                        checked={ordenar === "tipo"}
                        onChange={() => setOrdenar("tipo")}
                        className="sr-only"
                      />
                      <span className={`p-2 rounded-lg ${ordenar === "tipo" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"} transition-colors`}>Tipo</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Espaçamento */}
        <div className="mb-8"></div>

        {/* Resultados */}
        <div className="mb-3 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-200">
            {documentosFiltrados.length} {documentosFiltrados.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
          </h3>
          
          {documentosFiltrados.length > 0 && (
            <div className="text-sm text-gray-400">
              {busca && <span className="mr-2">Busca: "{busca}"</span>}
              {tipo !== "Todos" && <span className="px-2 py-1 mr-2 rounded-full bg-blue-800/30 text-blue-300 text-xs">{tipo}</span>}
              {setor !== "Todos" && <span className="px-2 py-1 rounded-full bg-purple-800/30 text-purple-300 text-xs">{setor}</span>}
            </div>
          )}
        </div>

        {/* Lista de documentos */}
        {activeTab === "fispqs" ? (
          <PublicFISPQList />
        ) : activeTab === "fichas_emergencia" ? (
          <PublicFichaEmergenciaList />
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : erro ? (
          <div className="p-5 rounded-xl bg-red-900/20 border border-red-800 text-center">
            <p className="text-red-300">{erro}</p>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl overflow-hidden shadow-xl">
            {documentosFiltrados.length === 0 ? (
              <div className="p-10 text-center">
                <i className="bx bx-search-alt text-4xl text-gray-500 mb-2"></i>
                <p className="text-lg text-gray-400">Nenhum documento encontrado com os filtros selecionados.</p>
                <button 
                  onClick={() => {
                    setBusca("");
                    setTipo("Todos");
                    setSetor("Todos");
                    setValidadeIni("");
                    setValidadeFim("");
                  }}
                  className="mt-3 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {documentosFiltrados.map((doc, idx) => {
                  const status = getStatus(doc);
                  
                  return (
                    <motion.div
                      key={doc.id}
                      className={`p-4 hover:bg-gray-800/30 transition-colors ${status === "vencido" ? "border-l-4 border-red-600" : status === "expirando" ? "border-l-4 border-yellow-600" : ""}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone do tipo de documento */}
                        <div className={`p-2 rounded-full flex-shrink-0 ${doc.tipo === "certificado" ? "bg-blue-800/30 text-blue-300" : doc.tipo === "fispq" ? "bg-green-800/30 text-green-300" : doc.tipo === "emergencia" ? "bg-red-800/30 text-red-300" : "bg-purple-800/30 text-purple-300"}`}>
                          <i className={`bx ${doc.tipo === "certificado" ? "bx-certification" : doc.tipo === "fispq" ? "bx-file-blank" : doc.tipo === "emergencia" ? "bx-error-circle" : "bx-folder"} text-lg`}></i>
                        </div>
                        
                        {/* Conteúdo principal */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base text-gray-100 truncate">{doc.nome}</h3>
                            {status === "vencido" && <span className="text-xs bg-red-700/80 text-white px-1.5 py-0.5 rounded-full">Vencido</span>}
                            {status === "expirando" && <span className="text-xs bg-yellow-600/80 text-white px-1.5 py-0.5 rounded-full">A vencer</span>}
                          </div>
                          
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <i className="bx bx-purchase-tag"></i> {doc.tipo.charAt(0).toUpperCase() + doc.tipo.slice(1)}
                            </span>
                            
                            {doc.numero && (
                              <span className="inline-flex items-center gap-1">
                                <i className="bx bx-hash"></i> {doc.numero}
                              </span>
                            )}
                            
                            {doc.setor && (
                              <span className="inline-flex items-center gap-1">
                                <i className="bx bx-building"></i> {doc.setor}
                              </span>
                            )}
                            
                            {doc.validade && (
                              <span className={`inline-flex items-center gap-1 ${status === "vencido" ? "text-red-400" : status === "expirando" ? "text-yellow-400" : "text-green-400"}`}>
                                <i className={`bx ${status === "vencido" ? "bx-calendar-x" : status === "expirando" ? "bx-calendar-exclamation" : "bx-calendar-check"}`}></i> {formatarData(doc.validade)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {/* Usar o componente VisualizarPdf que já tem tratamento de erro */}
                          <VisualizarPdf filePath={doc.arquivoUrl} />
                          
                          <button
                            onClick={() => {
                              try {
                                // Imprime o valor para debug
                                console.log('Valor de arquivoUrl:', doc.arquivoUrl);
                                
                                const url = getPublicUrl(doc.arquivoUrl);
                                if (url.includes('erro.url')) {
                                  alert(`Não foi possível encontrar o arquivo: ${doc.arquivoUrl}\nVerifique se o bucket existe no Supabase.`);
                                  return;
                                }
                                
                                // Url válida, abrir para download
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = doc.nome || 'documento.pdf';
                                a.target = '_blank';
                                a.click();
                              } catch (error) {
                                console.error('Erro ao baixar arquivo:', error);
                                alert('Não foi possível baixar o arquivo. Verifique o console para mais detalhes.');
                              }
                            }}
                            className="text-gray-400 hover:text-blue-400 p-1.5 rounded transition-colors"
                            title="Baixar PDF"
                          >
                            <i className="bx bx-download text-lg"></i>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rodapé fixo */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 bg-black/80 backdrop-blur-sm border-t border-gray-800 text-center text-gray-400 text-sm z-10">
        <div className="max-w-7xl mx-auto">
          <p>Sistema de Documentação Técnica &copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
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
