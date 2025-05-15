import Layout from '../../../components/Layout';
// Importação do componente sem extensão
import { FISPQEditForm } from './FISPQEditForm';

// Componente de página do lado do servidor (Server Component)
export default function FISPQEditPage({ params }: { params: { id: string } }) {
  return (
    <Layout title="Editar FISPQ">
      <div className="p-4">
        <FISPQEditForm id={params.id} />
      </div>
    </Layout>
  );
}
