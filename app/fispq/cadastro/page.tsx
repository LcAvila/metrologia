'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fispqService } from '../services/fispqService';
import { FISPQFormData } from '../types/fispq';
import { FaUpload, FaTimes, FaSave } from 'react-icons/fa';
import Layout from '../../components/Layout';

export default function CadastroFISPQ() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FISPQFormData>({
    produto: '',
    fabricante: '',
    numeroCas: '',
    setor: '',
    tipoRisco: '',
    validade: new Date(),
    arquivoUrl: '', // Mantido para conformidade com o tipo, mas preenchido pelo serviço
    arquivo: null
  });
  const [error, setError] = useState<string | null>(null); // Adicionado estado para erro

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    if (!formData.arquivo) {
      setError('Por favor, selecione um arquivo PDF.');
      return;
    }

    setLoading(true);
    try {
      // A propriedade arquivoUrl será definida pelo serviço fispqService.create
      // Não é necessário passar formData.arquivoUrl explicitamente se o serviço a ignora e gera uma nova.
      // O tipo FISPQFormData inclui arquivoUrl, então está presente.
      await fispqService.create(formData, formData.arquivo);
      router.push('/fispq');
    } catch (err: any) {
      console.error('Erro ao cadastrar FISPQ:', err);
      setError(err.message || 'Erro ao cadastrar FISPQ. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        arquivo: e.target.files[0]
      });
    }
  }

  return (
    <Layout title="Cadastro de FISPQ">
      <div className="p-4">
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 inline-flex items-center">
            <FaUpload className="mr-2 text-[var(--primary)]" />
            Nova FISPQ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="produto" className="block text-sm font-medium mb-1">Produto</label>
                <input
                  id="produto"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  value={formData.produto}
                  onChange={e => setFormData({ ...formData, produto: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="fabricante" className="block text-sm font-medium mb-1">Fabricante</label>
                <input
                  id="fabricante"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  value={formData.fabricante}
                  onChange={e => setFormData({ ...formData, fabricante: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="numeroCas" className="block text-sm font-medium mb-1">Número CAS</label>
                <input
                  id="numeroCas"
                  type="text"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  value={formData.numeroCas || ''}
                  onChange={e => setFormData({ ...formData, numeroCas: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="setor" className="block text-sm font-medium mb-1">Setor</label>
                <input
                  id="setor"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  value={formData.setor}
                  onChange={e => setFormData({ ...formData, setor: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="tipoRisco" className="block text-sm font-medium mb-1">Tipo de Risco</label>
                <select
                  id="tipoRisco"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  value={formData.tipoRisco || ''}
                  onChange={e => setFormData({ ...formData, tipoRisco: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Físico">Físico</option>
                  <option value="Químico">Químico</option>
                  <option value="Biológico">Biológico</option>
                  <option value="Ergonômico">Ergonômico</option>
                  <option value="Acidental">Acidental</option>
                </select>
              </div>

              <div>
                <label htmlFor="validade" className="block text-sm font-medium mb-1">Validade</label>
                <input
                  id="validade"
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                  value={formData.validade.toISOString().split('T')[0]}
                  onChange={e => setFormData({ ...formData, validade: new Date(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="arquivo" className="block text-sm font-medium mb-1">Arquivo PDF</label>
              <input
                id="arquivo"
                type="file"
                accept=".pdf"
                required
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-light)] file:text-[var(--primary-dark)] hover:file:bg-[var(--primary)] hover:file:text-white"
                onChange={handleFileChange}
              />
              {formData.arquivo && <p className="text-sm text-[var(--muted)] mt-1">Arquivo selecionado: {formData.arquivo.name}</p>}
            </div>

            {error && (
              <div className="my-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push('/fispq')}
                className="px-4 py-2 text-[var(--foreground)] hover:bg-[var(--hover)] rounded-md transition-colors inline-flex items-center gap-2 border border-[var(--border)]"
              >
                <FaTimes /> Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] transition-colors inline-flex items-center gap-2"
              >
                <FaSave /> {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}