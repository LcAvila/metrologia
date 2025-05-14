"use client";
import React, { useState, useEffect } from "react";
import { fispqService } from "../services/fispqService";
import { FISPQ, FISPQFilter } from "../types/fispq";
import InputFileUpload from "../../components/InputFileUpload";
import DatePicker from "../../components/DatePicker";
import VisualizarPdf from "../../components/VisualizarPdf";
import { TextField, Button, MenuItem, CircularProgress, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const setores = ["Laboratório", "Produção", "Qualidade", "Segurança", "Outros"];
const tiposRisco = ["Inflamável", "Tóxico", "Corrosivo", "Explosivo", "Outros"];

type FISPQForm = Omit<FISPQ, 'id' | 'criadoEm' | 'validade'> & { validade: string; arquivo?: File | null };

export default function FispqsPage() {
  // Formulário
  const [form, setForm] = useState<Partial<FISPQForm>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Listagem
  const [fispqs, setFispqs] = useState<FISPQ[]>([]);
  const [filtros, setFiltros] = useState<FISPQFilter>({});
  const [fetching, setFetching] = useState(false);

  // Buscar FISPQs
  const fetchFispqs = async () => {
    setFetching(true);
    try {
      const data = await fispqService.list(filtros);
      setFispqs(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => { fetchFispqs(); }, [filtros]);

  // Manipuladores de formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, arquivo: e.target.files[0] });
    }
  };
  const handleDateChange = (date: string) => {
    // Garante sempre string ou vazio
    setForm({ ...form, validade: typeof date === 'string' ? date : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!form.produto || !form.fabricante || !form.setor || !form.validade || !form.arquivo) {
        setError("Preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }
      await fispqService.create({
        produto: form.produto,
        fabricante: form.fabricante,
        numeroCas: form.numeroCas,
        setor: form.setor,
        tipoRisco: form.tipoRisco,
        validade: new Date(form.validade!),
        arquivoUrl: "",
      }, form.arquivo!);
      setForm({});
      fetchFispqs();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Cadastro e Consulta de FISPQs</h1>
      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg mb-8">
        <TextField label="Produto" name="produto" value={form.produto || ''} onChange={handleChange} required fullWidth size="small" />
        <TextField label="Fabricante" name="fabricante" value={form.fabricante || ''} onChange={handleChange} required fullWidth size="small" />
        <TextField label="Número CAS" name="numeroCas" value={form.numeroCas || ''} onChange={handleChange} fullWidth size="small" />
        <TextField select label="Setor" name="setor" value={form.setor || ''} onChange={handleChange} required fullWidth size="small">
          {setores.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField select label="Tipo de Risco" name="tipoRisco" value={form.tipoRisco || ''} onChange={handleChange} fullWidth size="small">
          <MenuItem value="">Nenhum</MenuItem>
          {tiposRisco.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <DatePicker id="validade" value={typeof form.validade === 'string' ? form.validade.substring(0, 10) : ''} onChange={handleDateChange} label="Validade" required />
        <InputFileUpload name="arquivo" label="Laudo (PDF)" accept="application/pdf" onFileChange={handleFileChange} fileName={form.arquivo?.name} />
        <div className="col-span-1 md:col-span-3 flex gap-2 items-center mt-2">
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Cadastrar"}
          </Button>
          {error && <span className="text-red-400 ml-2">{error}</span>}
        </div>
      </form>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <TextField label="Produto" name="produto" value={filtros.produto || ''} onChange={handleFiltroChange} size="small" />
        <TextField label="Fabricante" name="fabricante" value={filtros.fabricante || ''} onChange={handleFiltroChange} size="small" />
        <TextField label="Setor" name="setor" value={filtros.setor || ''} onChange={handleFiltroChange} size="small" select style={{ minWidth: 120 }}>
          <MenuItem value="">Todos</MenuItem>
          {setores.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField label="CAS" name="numeroCas" value={filtros.numeroCas || ''} onChange={handleFiltroChange} size="small" />
      </div>
      {/* Tabela de FISPQs */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg">
        {fetching ? (
          <div className="p-6 flex justify-center"><CircularProgress /></div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2">Produto</th>
                <th className="p-2">Fabricante</th>
                <th className="p-2">CAS</th>
                <th className="p-2">Setor</th>
                <th className="p-2">Tipo de Risco</th>
                <th className="p-2">Validade</th>
                <th className="p-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {fispqs.length === 0 && (
                <tr><td colSpan={7} className="text-center p-4">Nenhum registro encontrado.</td></tr>
              )}
              {fispqs.map((f) => (
                <tr key={f.id} className="border-b border-gray-700 hover:bg-gray-700/40">
                  <td className="p-2">{f.produto}</td>
                  <td className="p-2">{f.fabricante}</td>
                  <td className="p-2">{f.numeroCas}</td>
                  <td className="p-2">{f.setor}</td>
                  <td className="p-2">{f.tipoRisco}</td>
                  <td className="p-2">{new Date(f.validade).toLocaleDateString()}</td>
                  <td className="p-2">
                    {f.arquivoUrl ? (
                      <a href={f.arquivoUrl} target="_blank" rel="noopener noreferrer">
                        <IconButton size="small" color="primary"><DownloadIcon /></IconButton>
                      </a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
