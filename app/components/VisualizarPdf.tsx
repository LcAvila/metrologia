import { getPublicUrl } from '../lib/getPublicUrl';

interface VisualizarPdfProps {
  filePath: string;
}

export default function VisualizarPdf({ filePath }: VisualizarPdfProps) {
  const url = getPublicUrl(filePath);
  return url ? (
    <iframe src={url} width="100%" height="600px" title="Visualizar PDF" />
  ) : (
    <span>Arquivo não encontrado</span>
  );
}
