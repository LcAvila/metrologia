// Script para importação direta dos dados da FDU para o Supabase
// Executa a importação sem depender da interface web

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase - substitua pelos valores reais
const supabaseUrl = 'https://fzuytdzwuwlywdbleysl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inicializa o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// ID do usuário para associar aos registros
const userId = '1ce76ad3-9577-4a85-b919-043e75024f4f'; // ID do Lucas Ávila (admin)

async function importarFDUs() {
  try {
    console.log('Iniciando importação direta das FDUs...');
    
    // Ler o arquivo JSON gerado pelo script Python
    const jsonPath = 'fdus_importacao.json';
    if (!fs.existsSync(jsonPath)) {
      console.error('Erro: Arquivo de importação não encontrado');
      return;
    }
    
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const fdus = JSON.parse(fileContent);
    
    console.log(`Total de ${fdus.length} FDUs encontradas no arquivo.`);
    
    // Resultados da importação
    const results = {
      total: fdus.length,
      success: 0,
      errors: 0,
      errorDetails: []
    };
    
    // Processar cada FDU
    for (const fdu of fdus) {
      try {
        // Criar objeto com apenas os campos que existem na tabela
        const fduData = {
          produto: fdu.produto || 'Produto sem nome',
          fabricante: fdu.fabricante || 'Não especificado',
          setor: fdu.setor || 'Geral',
          tipoRisco: fdu.tipoRisco || 'Não classificado',
          validade: fdu.validade || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          arquivoUrl: `/pdf-placeholder/${fdu.produto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          usuario_id: userId,
          criadoEm: new Date().toISOString()
        };
        
        // Converter possuiFispq para booleano
        const temFispq = typeof fdu.possuiFispq === 'boolean' 
          ? fdu.possuiFispq 
          : String(fdu.possuiFispq || '').toLowerCase() === 'sim' || 
            String(fdu.possuiFispq || '').toLowerCase() === 's' || 
            String(fdu.possuiFispq || '') === '1' || 
            String(fdu.possuiFispq || '').toLowerCase().includes('sim') || 
            String(fdu.possuiFispq || '').toLowerCase() === 'x';
        
        fduData.possuiFispq = temFispq;
        
        // Inserir no Supabase
        const { error } = await supabase
          .from('fdus')
          .insert([fduData]);
        
        if (error) {
          results.errors++;
          const errorMsg = `Erro ao importar ${fdu.produto}: ${error.message}`;
          results.errorDetails.push(errorMsg);
          console.error(errorMsg);
        } else {
          results.success++;
          if (results.success % 10 === 0) {
            console.log(`Progresso: ${results.success}/${fdus.length} FDUs importadas...`);
          }
        }
      } catch (err) {
        results.errors++;
        const errorMsg = `Exceção ao importar ${fdu.produto}: ${err.message}`;
        results.errorDetails.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    // Relatório final
    console.log('\n===== RELATÓRIO DE IMPORTAÇÃO =====');
    console.log(`Total de FDUs processadas: ${results.total}`);
    console.log(`Importadas com sucesso: ${results.success}`);
    console.log(`Erros: ${results.errors}`);
    
    if (results.errors > 0) {
      console.log('\nDetalhes dos erros:');
      results.errorDetails.forEach((err, index) => {
        console.log(`${index + 1}. ${err}`);
      });
    }
    
    console.log('\nImportação concluída!');
    
  } catch (error) {
    console.error('Erro fatal durante a importação:', error);
  }
}

// Executar a importação
importarFDUs();
