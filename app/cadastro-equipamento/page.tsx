"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import InputFileUpload from '../components/InputFileUpload'; 
import { NotificationProvider, useNotification } from '../context/NotificationContext';

interface Equipment {
  id: string; 
  type: string;
  sector: string;
  status: string;
  lastCalibration: string;
  nextCalibration: string;
  standardLocation?: string;
  currentLocation?: string;
  measurementRange?: string; // Faixa de medida
  model?: string; // Modelo do equipamento
  serialNumber?: string; // Número de série
  manufacturer?: string; // Fabricante
  certificateFile?: string; // Certificado (nome do arquivo)
  dataRecordFile?: string; // Registro de dados (nome do arquivo)
  certificateFileObject?: File; // Objeto File para upload
  dataRecordFileObject?: File; // Objeto File para upload
}

// Mapeamento de tipos de equipamento para prefixos
const equipmentPrefixes: Record<string, string> = {
  'Paquímetro': 'PAQ',
  'Micrômetro Externo': 'MIC',
  'Micrômetro Interno': 'MIC',
  'Micrômetro de Profundidade': 'MIC-P',
  'Régua Milimetrada': 'REG',
  'Trena Metálica': 'TRE',
  'Calibrador de Folga': 'CAL-F',
  'Calibrador de Rosca': 'CAL-R',
  'Calibrador Tipo Anel': 'CAL-A',
  'Calibrador Tipo Tampão': 'CAL-T',
  'Pino Padrão': 'PIN',
  'Balança Analítica': 'BAL-A',
  'Balança de Precisão': 'BAL-P',
  'Balança Industrial': 'BAL-I',
  'Peso Padrão': 'PES',
  'Cronômetro': 'CRO',
  'Tacômetro': 'TAC',
  'Estroboscópio': 'EST',
  'Termômetro Digital': 'TER-D',
  'Termômetro Infravermelho': 'TER-I',
  'Termômetro de Mercúrio': 'TER-M',
  'Termopar': 'TER-P',
  'Pirômetro': 'PIR',
  'Sensor RTD': 'RTD',
  'Sensor PT100': 'PT100',
  'Manômetro': 'MAN',
  'Vacuômetro': 'VAC',
  'Transdutor de Pressão': 'TRA-P',
  'Medidor de Vazão': 'MED-V',
  'Medidor de Coluna de Líquido': 'MED-C',
  'Projetor de Perfil': 'PRO',
  'Microscópio de Medição': 'MIC-M',
  'Câmera de Inspeção': 'CAM',
  'Rugosímetro': 'RUG',
  'Durômetro': 'DUR',
  'Refratômetro': 'REF',
  'Torquímetro': 'TOR',
  'Medidor de Dureza Rockwell': 'DUR-R',
  'Medidor de Dureza Brinell': 'DUR-B',
  'Medidor de Dureza Vickers': 'DUR-V',
  'Medidor de Espessura Ultrassônico': 'MED-U',
  'Medidor de Espessura de Pintura': 'MED-P',
  'Medidor de pH': 'PH',
  'Data Logger de Temperatura': 'LOG-T',
  'Data Logger de Umidade': 'LOG-U',
  'Colorímetro': 'COL',
  'Espectrofotômetro': 'ESP'
};

// Componente interno que usa o hook useNotification
function CadastroEquipamentoContent() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [equipment, setEquipment] = useState<Equipment>({
    id: '',
    type: '',
    sector: '',
    status: '',
    lastCalibration: '',
    nextCalibration: '',
    standardLocation: '',
    currentLocation: '',
    measurementRange: '',
    model: '',
    serialNumber: '',
    manufacturer: '',
    certificateFile: '',
    dataRecordFile: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Verificar se há um equipamento para edição no localStorage
    const editingEquipment = localStorage.getItem('editingEquipment');
    if (editingEquipment) {
      const parsedEquipment = JSON.parse(editingEquipment);
      // Garante que todos os campos tenham um valor definido, usando '' como padrão
      setEquipment(prev => ({
        ...prev, // Mantém os padrões iniciais
        ...parsedEquipment, // Sobrescreve com os valores carregados
        id: parsedEquipment.id ?? '',
        type: parsedEquipment.type ?? '',
        sector: parsedEquipment.sector ?? '',
        status: parsedEquipment.status ?? '',
        lastCalibration: parsedEquipment.lastCalibration ?? '',
        nextCalibration: parsedEquipment.nextCalibration ?? '',
        standardLocation: parsedEquipment.standardLocation ?? '',
        currentLocation: parsedEquipment.currentLocation ?? '',
        measurementRange: parsedEquipment.measurementRange ?? '',
        model: parsedEquipment.model ?? '',
        serialNumber: parsedEquipment.serialNumber ?? '',
        manufacturer: parsedEquipment.manufacturer ?? '',
        certificateFile: parsedEquipment.certificateFile ?? '',
        dataRecordFile: parsedEquipment.dataRecordFile ?? ''
      }));
      // Limpar dados de edição após carregar
      localStorage.removeItem('editingEquipment');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEquipment(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fieldName = e.target.name;
      
      // Armazenar temporariamente o arquivo para upload posterior
      setEquipment(prev => ({
        ...prev,
        [fieldName]: file.name,
        [`${fieldName}Object`]: file // Armazenar o objeto File para upload posterior
      }));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      // Enviar o arquivo para a API de upload
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.filePath; // Retornar o caminho do arquivo
      } else {
        console.error('Erro ao fazer upload:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Falha na requisição de upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar ID
    const equipmentType = equipment.type;
    const prefix = equipmentPrefixes[equipmentType];
    const idRegex = new RegExp(`^${prefix}-\\d{3}$`);
    
    if (!idRegex.test(equipment.id)) {
      showNotification('error', `O ID deve seguir o padrão ${prefix}-XXX, onde XXX são números (ex: ${prefix}-001)`);
      return;
    }
    
    // Processar uploads de arquivos
    let equipmentToSave = { ...equipment };
    
    // Upload do certificado se existir
    if (equipment.certificateFileObject) {
      const certificatePath = await uploadFile(equipment.certificateFileObject, 'certificados');
      if (certificatePath) {
        equipmentToSave.certificateFile = certificatePath;
      }
      // Remover o objeto File antes de salvar
      delete equipmentToSave.certificateFileObject;
    }
    
    // Upload do registro de dados se existir
    if (equipment.dataRecordFileObject) {
      const dataRecordPath = await uploadFile(equipment.dataRecordFileObject, 'registros');
      if (dataRecordPath) {
        equipmentToSave.dataRecordFile = dataRecordPath;
      }
      // Remover o objeto File antes de salvar
      delete equipmentToSave.dataRecordFileObject;
    }

    // Carregar equipamentos existentes
    let equipments: Equipment[] = [];
    const storedEquipments = localStorage.getItem('equipments');
    if (storedEquipments) {
      equipments = JSON.parse(storedEquipments);
    }

    // Verificar se o ID já existe
    const existingIndex = equipments.findIndex(eq => eq.id === equipment.id);
    if (existingIndex >= 0) {
      equipments[existingIndex] = equipmentToSave;
      showNotification('success', 'Equipamento atualizado com sucesso!');
    } else {
      equipments.push(equipmentToSave);
      showNotification('success', 'Novo equipamento cadastrado com sucesso!');
    }

    // Salvar no localStorage
    localStorage.setItem('equipments', JSON.stringify(equipments));
    
    // Usar o router do Next.js para navegação sem recarregar a página
    setTimeout(() => {
      router.push('/');
    }, 1000); // Pequeno atraso para que o usuário veja a notificação
  };

  return (
    <Layout title="Cadastro de Equipamento">
      <div className="bg-[var(--card-bg)] p-2 sm:p-3 md:p-5 rounded-lg shadow transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <div className="col-span-1 sm:col-span-2 md:col-span-1">
                <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1">Tipo*</label>
                <select 
                  id="type" 
                  name="type" 
                  value={equipment.type}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-2.5 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  required
                >
                    <option value="">Selecione um tipo de equipamento</option>
                    <optgroup label="📏 Instrumentos de Medição Linear">
                      <option value="Paquímetro">Paquímetro</option>
                      <option value="Micrômetro Externo">Micrômetro Externo</option>
                      <option value="Micrômetro Interno">Micrômetro Interno</option>
                      <option value="Micrômetro de Profundidade">Micrômetro de Profundidade</option>
                      <option value="Régua Milimetrada">Régua Milimetrada</option>
                      <option value="Trena Metálica">Trena Metálica</option>
                      <option value="Calibrador de Folga">Calibrador de Folga</option>
                      <option value="Calibrador de Rosca">Calibrador de Rosca</option>
                      <option value="Calibrador Tipo Anel">Calibrador Tipo Anel</option>
                      <option value="Calibrador Tipo Tampão">Calibrador Tipo Tampão</option>
                      <option value="Pino Padrão">Pino Padrão</option>
                    </optgroup>
                    <optgroup label="⚖️ Instrumentos de Massa e Peso">
                      <option value="Balança Analítica">Balança Analítica</option>
                      <option value="Balança de Precisão">Balança de Precisão</option>
                      <option value="Balança Industrial">Balança Industrial</option>
                      <option value="Peso Padrão">Peso Padrão</option>
                    </optgroup>
                    <optgroup label="🕓 Instrumentos de Tempo e Velocidade">
                      <option value="Cronômetro">Cronômetro</option>
                      <option value="Tacômetro">Tacômetro</option>
                      <option value="Estroboscópio">Estroboscópio</option>
                    </optgroup>
                    <optgroup label="🌡️ Instrumentos de Temperatura">
                      <option value="Termômetro Digital">Termômetro Digital</option>
                      <option value="Termômetro Infravermelho">Termômetro Infravermelho</option>
                      <option value="Termômetro de Mercúrio">Termômetro de Mercúrio</option>
                      <option value="Termopar">Termopar</option>
                      <option value="Pirômetro">Pirômetro</option>
                      <option value="Sensor RTD">Sensor RTD</option>
                      <option value="Sensor PT100">Sensor PT100</option>
                    </optgroup>
                    <optgroup label="🌬️ Instrumentos de Pressão e Vazão">
                      <option value="Manômetro">Manômetro</option>
                      <option value="Vacuômetro">Vacuômetro</option>
                      <option value="Transdutor de Pressão">Transdutor de Pressão</option>
                      <option value="Medidor de Vazão">Medidor de Vazão</option>
                      <option value="Medidor de Coluna de Líquido">Medidor de Coluna de Líquido</option>
                    </optgroup>
                    <optgroup label="🔍 Instrumentos Ópticos e de Inspeção">
                      <option value="Projetor de Perfil">Projetor de Perfil</option>
                      <option value="Microscópio de Medição">Microscópio de Medição</option>
                      <option value="Câmera de Inspeção">Câmera de Inspeção</option>
                      <option value="Rugosímetro">Rugosímetro</option>
                      <option value="Durômetro">Durômetro</option>
                      <option value="Refratômetro">Refratômetro</option>
                    </optgroup>
                    <optgroup label="⚙️ Outros Equipamentos">
                      <option value="Torquímetro">Torquímetro</option>
                      <option value="Medidor de Dureza Rockwell">Medidor de Dureza Rockwell</option>
                      <option value="Medidor de Dureza Brinell">Medidor de Dureza Brinell</option>
                      <option value="Medidor de Dureza Vickers">Medidor de Dureza Vickers</option>
                      <option value="Medidor de Espessura Ultrassônico">Medidor de Espessura Ultrassônico</option>
                      <option value="Medidor de Espessura de Pintura">Medidor de Espessura de Pintura</option>
                      <option value="Medidor de pH">Medidor de pH</option>
                      <option value="Data Logger de Temperatura">Data Logger de Temperatura</option>
                      <option value="Data Logger de Umidade">Data Logger de Umidade</option>
                      <option value="Colorímetro">Colorímetro</option>
                      <option value="Espectrofotômetro">Espectrofotômetro</option>
                    </optgroup>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="id" className="block text-sm font-medium text-[var(--foreground)] mb-1">ID*</label>
                  <input 
                    type="text" 
                    id="id" 
                    name="id" 
                    value={equipment.id}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    required
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="sector" className="block text-sm font-medium text-[var(--foreground)] mb-1">Setor*</label>
                  <select 
                    id="sector" 
                    name="sector" 
                    value={equipment.sector}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    required
                  >
                    <option value="">Selecione um setor</option>
                    <option value="Injetoras">Injetoras</option>
                    <option value="Ferramentaria">Ferramentaria</option>
                    <option value="Controle da Qualidade">Controle da Qualidade</option>
                    <option value="Point Matic">Point Matic</option>
                    <option value="M1">Montagem 1 (M1)</option>
                    <option value="ALM1">Almoxarifado 1 (ALM 1)</option>
                    <option value="ALM2">Almoxarifado 2 (ALM 2)</option>
                    <option value="DPA">Depósito de Produtos Acabados (DPA)</option>
                    <option value="Manutencao">Manutenção</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="status" className="block text-sm font-medium text-[var(--foreground)] mb-1">Status*</label>
                  <select 
                    id="status" 
                    name="status" 
                    value={equipment.status}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    required
                  >
                    <option value="">Selecione um status</option>
                    <option value="available">Disponível</option>
                    <option value="maintenance">Em Manutenção</option>
                    <option value="calibration">Em Calibração</option>
                    <option value="discarded">Descartado</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="lastCalibration" className="block text-sm font-medium text-[var(--foreground)] mb-1">Última Calibração*</label>
                  <input 
                    type="date" 
                    id="lastCalibration" 
                    name="lastCalibration" 
                    value={equipment.lastCalibration}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    required
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="nextCalibration" className="block text-sm font-medium text-[var(--foreground)] mb-1">Próxima Calibração*</label>
                  <input 
                    type="date" 
                    id="nextCalibration" 
                    name="nextCalibration" 
                    value={equipment.nextCalibration}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    required
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="model" className="block text-sm font-medium text-[var(--foreground)] mb-1">Modelo do Equipamento</label>
                  <input 
                    type="text" 
                    id="model" 
                    name="model" 
                    value={equipment.model}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-[var(--foreground)] mb-1">Número de Série</label>
                  <input 
                    type="text" 
                    id="serialNumber" 
                    name="serialNumber" 
                    value={equipment.serialNumber}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-[var(--foreground)] mb-1">Fabricante</label>
                  <input 
                    type="text" 
                    id="manufacturer" 
                    name="manufacturer" 
                    value={equipment.manufacturer}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="measurementRange" className="block text-sm font-medium text-[var(--foreground)] mb-1">Faixa de Medida</label>
                  <input 
                    type="text" 
                    id="measurementRange" 
                    name="measurementRange" 
                    value={equipment.measurementRange}
                    onChange={handleChange}
                    className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)] focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    placeholder="Ex: 0-150mm, 0-10kg"
                  />
                </div>
                  <div className="col-span-1 sm:col-span-2 md:col-span-1">
                    <label htmlFor="certificateFile" className="block text-sm font-medium text-[var(--foreground)] mb-1">Certificado</label>
                      <InputFileUpload onChange={handleFileChange} name="certificateFile" accept=".pdf,.jpg,.jpeg,.png" /> 
                  </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <label htmlFor="dataRecordFile" className="block text-sm font-medium text-[var(--foreground)] mb-1">Registro de Dados</label>
                  <InputFileUpload onChange={handleFileChange} name="dataRecordFile" accept=".pdf,.csv,.xlsx,.xls,.txt" />
                </div>
              </div>
            </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Link 
                  href="/" 
                  className="px-4 py-2 bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] rounded-md hover:bg-[var(--button-secondary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-center"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 text-center w-full sm:w-auto"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </Layout>
  );
}

// Componente exportado que fornece o contexto de notificação
export default function CadastroEquipamento() {
  return (
    <NotificationProvider>
      <CadastroEquipamentoContent />
    </NotificationProvider>
  );
}