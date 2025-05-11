"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import InputFileUpload from '../components/InputFileUpload';
import { NotificationProvider, useNotification } from '../context/NotificationContext';
import DatePicker from '../components/DatePicker';
import { FaCalendarAlt, FaTools, FaBuilding, FaIdCard, FaRuler, FaMapMarkerAlt, FaIndustry, FaBarcode, FaFileAlt, FaFileUpload, FaToggleOn, FaCube, FaPlusCircle, FaEdit } from 'react-icons/fa';

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
  const [equipment, setEquipment] = useState<Equipment>({
    id: '',
    type: '',
    sector: '',
    status: 'available', // Default status
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

  const router = useRouter();
  const { showNotification } = useNotification();

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
        status: parsedEquipment.status ?? 'available',
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
    if (name === 'type') {
      const prefix = equipmentPrefixes[value] || '';
      if (prefix) {
        let equipments: Equipment[] = [];
        const storedEquipments = localStorage.getItem('equipments');
        if (storedEquipments) {
          equipments = JSON.parse(storedEquipments);
        }
        const sameTypeEquipments = equipments.filter(eq => eq.id.startsWith(prefix));
        let nextNumber = 1;
        if (sameTypeEquipments.length > 0) {
          const existingNumbers = sameTypeEquipments
            .map(eq => {
              const match = eq.id.match(new RegExp(`^${prefix}-(\\d{3})$`));
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => !isNaN(num));
          if (existingNumbers.length > 0) {
            nextNumber = Math.max(...existingNumbers) + 1;
          }
        }
        const formattedNumber = nextNumber.toString().padStart(3, '0');
        setEquipment(prev => ({
          ...prev,
          type: value,
          id: `${prefix}-${formattedNumber}`
        }));
      } else {
        setEquipment(prev => ({
          ...prev,
          type: value,
          id: ''
        }));
      }
    } else {
      setEquipment(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  const sectionTitleClass = "text-lg font-bold text-[var(--foreground)] mt-3 mb-3 border-b border-[var(--input-border)] pb-2 col-span-1 sm:col-span-2 lg:col-span-3 first:mt-0";

  return (
    <Layout title={equipment.id ? "Editar Equipamento" : "Cadastro de Equipamento"}>
      <div className="bg-[var(--card-bg)] p-4 md:p-8 rounded-lg shadow-xl transition-colors duration-300 max-w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Informações Básicas */}
          <h3 className={sectionTitleClass}>Informações Básicas</h3>
          <div className="flex gap-4 flex-wrap">
            <div className='flex flex-col min-w-[120px] max-w-[200px] flex-1'>
              <label htmlFor="type" className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaTools /></span>
                Equipamento {equipment.id ? null : <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                name="type"
                id="type"
                value={equipment.type}
                onChange={handleChange}
                className="w-full max-w-[200px] px-3 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-sm"
                required
              >
                <option value="">Selecione o equipamento</option>
                {Object.keys(equipmentPrefixes).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[200px] flex-1'>
              <label htmlFor="id" className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaIdCard /></span>
                ID {equipment.id ? null : <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                name="id"
                id="id"
                value={equipment.id}
                onChange={handleChange}
                className="w-full max-w-[200px] px-3 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-sm"
                required
                readOnly={!!equipment.id && !localStorage.getItem('editingEquipment')}
                placeholder="Ex: PAQ-001"
              />
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[200px] flex-1'>
              <label htmlFor="sector" className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaBuilding /></span>
                Setor {equipment.id ? null : <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                name="sector"
                id="sector"
                value={equipment.sector}
                onChange={handleChange}
                className="w-full max-w-[200px] px-3 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-sm"
                required
              >
                <option value="">Selecione o setor</option>
                <option value="Injetoras">Injetoras</option>
                <option value="Ferramentaria">Ferramentaria</option>
                <option value="Controle da Qualidade">Controle da Qualidade</option>
                <option value="Point Matic">Point Matic</option>
                <option value="Montagem 1 (M1)">Montagem 1 (M1)</option>
                <option value="Almoxarifado 1 (ALM 1)">Almoxarifado 1 (ALM 1)</option>
                <option value="Almoxarifado 2 (ALM 2)">Almoxarifado 2 (ALM 2)</option>
                <option value="Depósito de Produtos Acabados (DPA)">Depósito de Produtos Acabados (DPA)</option>
                <option value="Manutenção">Manutenção</option>
              </select>
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[200px] flex-1'>
              <label htmlFor="status" className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaToggleOn /></span>
                Status {equipment.id ? null : <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                name="status"
                id="status"
                value={equipment.status}
                onChange={handleChange}
                className="w-full max-w-[200px] px-3 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-sm"
                required
              >
                <option value="available">Disponível</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="calibration">Em Calibração</option>
                <option value="discarded">Descartado</option>
              </select>
            </div>
          </div>

          {/* Seção: Datas de Calibração */}
          <h3 className={sectionTitleClass}>Datas de Calibração</h3>
          <div className="flex gap-2 flex-wrap">
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <DatePicker
                id="lastCalibration"
                label="Última Calibração"
                value={equipment.lastCalibration}
                onChange={(date) => setEquipment(prev => ({ ...prev, lastCalibration: date }))}
                icon={<FaCalendarAlt />}
                required
              />
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <DatePicker
                id="nextCalibration"
                label="Próxima Calibração"
                value={equipment.nextCalibration}
                onChange={(date) => setEquipment(prev => ({ ...prev, nextCalibration: date }))}
                icon={<FaCalendarAlt />}
                required
              />
            </div>
          </div>

          {/* Seção: Localização */}
          <h3 className={sectionTitleClass}>Localização</h3>
          <div className="flex gap-2 flex-wrap">
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <label htmlFor="standardLocation" className="block text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaMapMarkerAlt /></span>
                Local Padrão
              </label>
              <input
                type="text"
                name="standardLocation"
                id="standardLocation"
                value={equipment.standardLocation}
                onChange={handleChange}
                className="w-full max-w-[160px] px-2 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-xs"
                placeholder="Ex: Bancada 3, Armário 2"
              />
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <label htmlFor="currentLocation" className="block text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaMapMarkerAlt /></span>
                Localização Atual
              </label>
              <input
                type="text"
                name="currentLocation"
                id="currentLocation"
                value={equipment.currentLocation}
                onChange={handleChange}
                className="w-full max-w-[160px] px-2 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-xs"
                placeholder="Ex: Em uso na Injetora 5"
              />
            </div>
          </div>

          {/* Seção: Detalhes Técnicos */}
          <h3 className={sectionTitleClass}>Detalhes Técnicos</h3>
          <div className="flex gap-2 flex-wrap">
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <label htmlFor="measurementRange" className="block text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaRuler /></span>
                Faixa de Medida
              </label>
              <input
                type="text"
                name="measurementRange"
                id="measurementRange"
                value={equipment.measurementRange}
                onChange={handleChange}
                className="w-full max-w-[160px] px-2 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-xs"
                placeholder="Ex: 0-150mm, 0-25kg"
              />
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <label htmlFor="model" className="block text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaCube /></span>
                Modelo
              </label>
              <input
                type="text"
                name="model"
                id="model"
                value={equipment.model}
                onChange={handleChange}
                className="w-full max-w-[160px] px-2 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-xs"
                placeholder="Ex: Mitutoyo 500-196-30B"
              />
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <label htmlFor="serialNumber" className="block text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaBarcode /></span>
                Número de Série
              </label>
              <input
                type="text"
                name="serialNumber"
                id="serialNumber"
                value={equipment.serialNumber}
                onChange={handleChange}
                className="w-full max-w-[160px] px-2 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-xs"
                placeholder="Ex: SN123456789"
              />
            </div>
            <div className='flex flex-col min-w-[120px] max-w-[160px] flex-1'>
              <label htmlFor="manufacturer" className="block text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center">
                <span className="mr-1 text-[var(--primary)]"><FaIndustry /></span>
                Fabricante
              </label>
              <input
                type="text"
                name="manufacturer"
                id="manufacturer"
                value={equipment.manufacturer}
                onChange={handleChange}
                className="w-full max-w-[160px] px-2 py-2 border border-[var(--input-border)] rounded bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors duration-200 text-xs"
                placeholder="Ex: Mitutoyo"
              />
            </div>
          </div>

          {/* Seção: Documentos */}
          <h3 className={sectionTitleClass}>Documentos</h3>
          <div className="space-y-4">
            <div className="w-full max-w-md">
              <InputFileUpload
                label="Certificado do Equipamento"
                icon={<FaFileAlt />}
                fileName={equipment.certificateFile}
                onFileChange={handleFileChange}
                name="certificateFile"
                accept=".pdf,.doc,.docx,.jpg,.png"
                currentFileUrl={equipment.certificateFile && !equipment.certificateFile.startsWith('blob:') && !equipment.certificateFileObject ? `/api/download-file?filePath=${encodeURIComponent(equipment.certificateFile)}` : undefined}
              />
            </div>
            <div className="w-full max-w-md">
              <InputFileUpload
                label="Registro de Dados"
                icon={<FaFileUpload />}
                fileName={equipment.dataRecordFile}
                onFileChange={handleFileChange}
                name="dataRecordFile"
                accept=".pdf,.csv,.xls,.xlsx,.txt"
                currentFileUrl={equipment.dataRecordFile && !equipment.dataRecordFile.startsWith('blob:') && !equipment.dataRecordFileObject ? `/api/download-file?filePath=${encodeURIComponent(equipment.dataRecordFile)}` : undefined}
              />
            </div>
          </div>

          {/* Botão de Submit */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="w-full max-w-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 flex items-center justify-center text-base"
            >
              <span className="mr-2">
                {equipment.id ? <FaEdit /> : <FaPlusCircle />}
              </span>
              {equipment.id ? 'Atualizar Equipamento' : 'Cadastrar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default function CadastroEquipamentoPage() {
  return (
    <NotificationProvider>
      <CadastroEquipamentoContent />
    </NotificationProvider>
  );
}
