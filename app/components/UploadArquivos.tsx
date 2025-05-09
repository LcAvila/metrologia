import React, { useState } from 'react';
import { uploadToStorage } from '../lib/uploadToStorage';

export default function UploadArquivos() {
  const [loading, setLoading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>, tipo: 'certificados' | 'registros') {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const filePath = await uploadToStorage(file, tipo);
      alert(`Arquivo enviado com sucesso! Caminho: ${filePath}`);
      // Aqui você pode salvar o filePath no banco, se necessário
    } catch (err: any) {
      alert('Erro ao enviar arquivo: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div>
      <div>
        <label>Upload de Certificado:</label>
        <input type="file" accept="application/pdf" onChange={e => handleUpload(e, 'certificados')} disabled={loading} />
      </div>
      <div>
        <label>Upload de Registro de Dados:</label>
        <input type="file" accept="application/pdf" onChange={e => handleUpload(e, 'registros')} disabled={loading} />
      </div>
    </div>
  );
}
