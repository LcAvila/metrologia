import { redirect } from 'next/navigation';

export default function ControleEmissaoCertificadoRedirect() {
  redirect('/metrologia/controle-emissao-certificado');
  return null;
}
