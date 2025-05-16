import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Obter o parâmetro 'file' da URL
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath) {
      return new NextResponse('Arquivo não especificado', { status: 400 });
    }
    
    console.log('Tentando acessar arquivo:', filePath);

    // Verificar se estamos em ambiente de produção (Vercel)
    const isProduction = process.env.VERCEL === '1';

    // Em produção, tentamos várias abordagens
    if (isProduction) {
      // Verificar se o arquivo está no bucket 'documentos'
      // Limpar e codificar o caminho do arquivo
      // Remover caracteres problemáticos do nome do arquivo
      let cleanedPath = filePath
        .replace(/\s+/g, '_')          // Substitui espaços por underscores
        .normalize('NFD')              // Normaliza caracteres especiais
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-zA-Z0-9_\-.]/g, '_'); // Substitui caracteres não alfanuméricos
        
      console.log('Nome de arquivo limpo:', cleanedPath);
      
      // Determinar qual bucket usar com base no caminho do arquivo
      let bucket = 'certificados'; // Mudando para 'certificados' como bucket padrão
      
      // Tentar adivinhar o bucket correto com base no nome do arquivo
      if (filePath.toLowerCase().includes('fispq') || filePath.toLowerCase().includes('quimico')) {
        bucket = 'fisqps';
      } else if (filePath.toLowerCase().includes('certificado') || filePath.toLowerCase().includes('metrologista')) {
        bucket = 'certificados';
      } else if (filePath.toLowerCase().includes('emergencia')) {
        bucket = 'fichas_emergencia';
      } else if (filePath.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)) {
        bucket = 'fotos';
      }
      
      console.log(`Tentando acessar no bucket: ${bucket}`);
      
      // Codificar adequadamente para URL
      const encodedPath = encodeURIComponent(cleanedPath).replace(/%2F/g, '/'); // Mantém as barras
      
      try {
        // Tentativa 1: Caminho direto no bucket determinado com codificação URL
        const { data: directData } = supabase.storage.from(bucket).getPublicUrl(encodedPath);
        if (directData?.publicUrl) {
          console.log('Redirecionando para URL direta:', directData.publicUrl);
          return NextResponse.redirect(directData.publicUrl);
        }
      } catch (err) {
        console.log(`Falha na tentativa de URL direta no bucket ${bucket}:`, err);
      }
      
      // Se falhar com o caminho codificado, tente com o caminho simples limpo
      try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(cleanedPath);
        if (data?.publicUrl) {
          console.log('Redirecionando para URL com caminho limpo:', data.publicUrl);
          return NextResponse.redirect(data.publicUrl);
        }
      } catch (err) {
        console.log(`Falha na tentativa com caminho limpo no bucket ${bucket}:`, err);
      }
      
      // Tentativa 2: Adicionar prefixos comuns se não existirem
      // Usar o caminho limpo para todas as tentativas
      // Extrair apenas o nome do arquivo para tentativas simplificadas
      const fileNameOnly = cleanedPath.includes('/') ? 
        cleanedPath.split('/').pop() : 
        cleanedPath;
      
      const possiblePaths = [
        // Caminhos simplificados
        fileNameOnly,
        
        // Certificados específicos
        cleanedPath.toLowerCase().includes('certificado') ? 
          fileNameOnly?.replace(/^certificado_/, '') : null,
          
        // Caminhos com prefixos comuns  
        bucket === 'certificados' ? `certificados/${fileNameOnly}` : null,
        bucket === 'fisqps' ? `fisqps/${fileNameOnly}` : null,
        
        // Para certificados especificamente
        fileNameOnly?.replace(/^certificado_-_/, ''),
        fileNameOnly?.replace(/^certificado_/, ''),
      ].filter(Boolean); // Remove valores nulos
      
      // Tente cada caminho possível
      for (const tryPath of possiblePaths) {
        try {
          // Codificar corretamente para URL
          const encodedTryPath = encodeURIComponent(tryPath as string).replace(/%2F/g, '/');
          
          console.log(`Tentando caminho alternativo no bucket ${bucket}:`, encodedTryPath);
          const { data } = supabase.storage.from(bucket).getPublicUrl(encodedTryPath);
          if (data?.publicUrl) {
            console.log('Redirecionando para URL:', data.publicUrl);
            return NextResponse.redirect(data.publicUrl);
          }
        } catch (err) {
          console.log(`Falha ao tentar caminho ${tryPath} no bucket ${bucket}:`, err);
        }
      }
      
      // Tentativa 3: Verificar se o arquivo existe localmente mesmo em produção
      // Isso é útil para arquivos de demonstração/exemplo que devem estar disponíveis
      
      console.log('Tentando servir arquivo local como fallback mesmo em produção');
      
      // Lista de arquivos de demonstração que devem estar disponíveis
      const demoFiles = [
        'certificado-exemplo.pdf',
        'certificado-micrometro-25mm.pdf',
        'Certificado - Introdução Orientada a Objetos - Lucas Ávila - Fundação Bradesco.pdf'
      ];
      
      // Se o arquivo requisitado é um desses arquivos de demonstração
      const fileName = filePath.split('/').pop() || filePath;
      
      if (demoFiles.some(demo => fileName.includes(demo) || demo.includes(fileName))) {
        try {
          // Servir um arquivo de demonstração local
          // Essa é uma solução de contorno para permitir testes sem upload
          const demoPath = 'demo-certificado.pdf';
          const fullPath = path.join(process.cwd(), 'public', demoPath);
          
          if (fs.existsSync(fullPath)) {
            console.log('Servindo arquivo de demonstração local:', demoPath);
            const fileBuffer = fs.readFileSync(fullPath);
            
            return new NextResponse(fileBuffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
                'Cache-Control': 'public, max-age=3600',
              },
            });
          }
        } catch (error) {
          console.error('Erro ao tentar servir arquivo local de demonstração:', error);
        }
      }
      
      // Se chegamos aqui, nenhuma tentativa funcionou
      return new NextResponse(`Arquivo não encontrado: ${filePath}. Por favor, verifique se o arquivo foi carregado corretamente no Storage.`, { status: 404 });
    }

    // Em desenvolvimento, continuamos usando o sistema de arquivos local
    // Remover a barra inicial se existir para evitar problemas de caminho
    const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(process.cwd(), 'public', cleanFilePath);

    // Verificar se o arquivo existe
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(fullPath);

    // Retornar o arquivo como resposta
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao processar o PDF:', error);
    return new NextResponse('Erro ao processar o arquivo', { status: 500 });
  }
}
