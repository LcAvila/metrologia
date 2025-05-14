import { redirect } from 'next/navigation';

export default function CadastroEquipamentoRedirect() {
  redirect('/metrologia/cadastro-equipamento');
  return null;
}
