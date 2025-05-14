import { redirect } from 'next/navigation';

export default function CertificadosRedirect() {
  redirect('/metrologia/certificados');
  return null;
}
