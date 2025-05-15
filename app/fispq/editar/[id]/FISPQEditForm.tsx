'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FISPQ, FISPQFormData } from '../../types/fispq';
import { fispqService } from '../../services/fispqService';
import { formatarData } from '../../../utils/formatters';
import { FaEdit, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface FISPQEditFormProps {
  id: string;
}

export function FISPQEditForm({ id }: FISPQEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FISPQFormData>({
    produto: '',
    fabricante: '',
    numeroCas: '',
    setor: '',
    tipoRisco: '',
    validade: new Date().toISOString().split('T')[0], // String no formato YYYY-MM-DD
    arquivoUrl: '',
    arquivo: null
  } as FISPQFormData); // Coerção para o tipo exato
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFISPQ();
  }, [id]);

  async function loadFISPQ() {
    try {
      const data = await fispqService.getById(id);
      if (data) {
        // Converter a data para formato ISO (YYYY-MM-DD) para compatibilidade com input date
        let validadeFormatada = '';
        if (data.validade) {
          const dataObj = new Date(data.validade);
          validadeFormatada = dataObj.toISOString().split('T')[0];
        }

        setFormData({
          ...data,
          validade: validadeFormatada,
          arquivo: null
        });
      } else {
        setError('FISPQ não encontrada');
        setTimeout(() => router.push('/fispq'), 2000);
      }
    } catch (err: any) {
      console.error('Erro ao carregar FISPQ:', err);
      setError(err.message || 'Erro ao carregar FISPQ. Por favor, tente novamente.');
      setTimeout(() => router.push('/fispq'), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Usando o formData como está, já que a interface FISPQ agora aceita string para validade
      const dadosAtualizados = { ...formData };
      
      // Se houver arquivo, faz upload
      if (formData.arquivo) {
        await fispqService.update(id, dadosAtualizados, formData.arquivo);
      } else {
        // Senão, só atualiza os dados
        await fispqService.update(id, dadosAtualizados);
      }
      
      // Feedback visual
      setError(null);
      // Redirecionamento mais suave, após mostrar mensagem de sucesso
      setTimeout(() => {
        router.push('/fispq');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao atualizar FISPQ:', err);
      setError(err.message || 'Erro ao atualizar FISPQ. Por favor, tente novamente.');
    } finally {
      setSaving(false);
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

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 inline-flex items-center">
        <FaEdit className="mr-2 text-[var(--primary)]" />
        Editar FISPQ
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Produto</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
              value={formData.produto}
              onChange={e => setFormData({ ...formData, produto: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fabricante</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
              value={formData.fabricante}
              onChange={e => setFormData({ ...formData, fabricante: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número CAS</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
              value={formData.numeroCas}
              onChange={e => setFormData({ ...formData, numeroCas: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Setor</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
              value={formData.setor}
              onChange={e => setFormData({ ...formData, setor: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Risco</label>
            <select
              className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
              value={formData.tipoRisco}
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
            <label className="block text-sm font-medium mb-1">Validade</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
              value={typeof formData.validade === 'string' ? formData.validade : formData.validade.toISOString().split('T')[0]}
              onChange={e => setFormData({ ...formData, validade: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Novo Arquivo PDF (opcional)</label>
          <input
            type="file"
            accept=".pdf"
            className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
            onChange={handleFileChange}
          />
          {formData.arquivoUrl && (
            <p className="mt-1 text-sm text-[var(--muted)]">
              Arquivo atual: <a href={formData.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Visualizar PDF</a>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/fispq')}
            className="px-4 py-2 text-[var(--foreground)] hover:bg-[var(--hover)] rounded-md transition-colors inline-flex items-center gap-2"
          >
            <FaTimes /> Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] transition-colors inline-flex items-center gap-2"
          >
            <FaSave /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
