import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import fs from 'fs';
import path from 'path';
import { FDU } from '@/app/fdu/types/fdu';

export async function GET() {
  try {
    // MODO MANUTENÇÃO: Sem verificação de autenticação
    // Importação direta de dados, permitida para qualquer usuário durante a manutenção
    // Usar um ID fixo para criação dos registros
    const userId = '1ce76ad3-9577-4a85-b919-043e75024f4f'; // ID do Lucas Ávila (admin)

    // Caminho para o arquivo JSON
    const jsonPath = path.join(process.cwd(), 'fdus_importacao.json');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Arquivo de importação não encontrado' 
      }, { status: 404 });
    }

    // Ler o arquivo JSON
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const fdus: FDU[] = JSON.parse(fileContent);

    if (!fdus || !Array.isArray(fdus) || fdus.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum dado válido encontrado no arquivo de importação' 
      }, { status: 400 });
    }

    // Resultados da importação
    const results = {
      total: fdus.length,
      success: 0,
      errors: 0,
      errorDetails: [] as string[]
    };

    // Processar cada FDU
    for (const fdu of fdus) {
      try {
        // Criar um objeto completo com todos os campos da tabela
        const fduData = {
          produto: fdu.produto || 'Produto sem nome',
          fabricante: fdu.fabricante || 'Não especificado',
          setor: fdu.setor || 'Geral',
          tipoRisco: fdu.tipoRisco || 'Não classificado',
          validade: fdu.validade || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          arquivoUrl: `/pdf-placeholder/${fdu.produto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          usuario_id: userId, // ID de Lucas Ávila (admin)
          criadoEm: new Date().toISOString(),
          // Campos adicionais
          nomeTecnico: fdu.nomeTecnico || '',
          numeroCas: fdu.numeroCas || '',
          classificacaoGHS: fdu.classificacaoGHS || '',
          classeRisco: fdu.classeRisco || '',
          localArmazenamento: fdu.localArmazenamento || '',
          epiNecessario: fdu.epiNecessario || '',
          medidasPreventivas: fdu.medidasPreventivas || '',
          destinacaoProduto: fdu.destinacaoProduto || '',
          possuiFispq: typeof fdu.possuiFispq === 'boolean' 
            ? fdu.possuiFispq 
            : String(fdu.possuiFispq || '').toLowerCase() === 'sim' || 
              String(fdu.possuiFispq || '').toLowerCase() === 's' || 
              String(fdu.possuiFispq || '') === '1' || 
              String(fdu.possuiFispq || '').toLowerCase().includes('sim') || 
              String(fdu.possuiFispq || '').toLowerCase() === 'x'
        };

        // Inserir no Supabase
        const { error } = await supabase
          .from('fdus')
          .insert([fduData]);

        if (error) {
          results.errors++;
          results.errorDetails.push(`Erro ao importar ${fdu.produto}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (err: any) {
        results.errors++;
        results.errorDetails.push(`Exceção ao importar ${fdu.produto}: ${err.message}`);
      }
    }

    // Retornar resultado da importação
    return NextResponse.json({ 
      success: true, 
      message: `Importação concluída: ${results.success} FDUs importadas com sucesso, ${results.errors} erros.`,
      results 
    });
  } catch (error: any) {
    console.error('Erro na importação:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Erro durante a importação: ${error.message}` 
    }, { status: 500 });
  }
}
