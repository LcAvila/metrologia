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
      // Determinar qual bucket usar com base no caminho do arquivo
      let bucket = 'certificados'; // Mudando para 'certificados' como bucket padrão
      
      // Tentar adivinhar o bucket correto com base no nome do arquivo
      if (filePath.includes('fispq') || filePath.includes('quimico')) {
        bucket = 'fisqps';
      } else if (filePath.includes('certificado') || filePath.includes('metrologista')) {
        bucket = 'certificados';
      } else if (filePath.includes('emergencia')) {
        bucket = 'fichas_emergencia';
      } else if (filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
        bucket = 'fotos';
      }
      
      console.log(`Tentando acessar no bucket: ${bucket}`);
      
      try {
        // Tentativa 1: Caminho direto no bucket determinado
        const { data: directData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (directData?.publicUrl) {
          console.log('Redirecionando para URL direta:', directData.publicUrl);
          return NextResponse.redirect(directData.publicUrl);
        }
      } catch (err) {
        console.log(`Falha na tentativa de URL direta no bucket ${bucket}:`, err);
      }
      
      // Tentativa 2: Adicionar prefixos comuns se não existirem
      // Usando o mesmo bucket já determinado acima
      const possiblePaths = [
        filePath, // Caminho original
        filePath.startsWith('/') ? filePath.substring(1) : filePath, // Remover barra inicial se houver
        filePath.includes('/') ? filePath.split('/').pop() : filePath, // Apenas nome do arquivo
        
        // Teste com estruturas comuns para cada tipo de bucket
        bucket === 'certificados' ? `certificados/${filePath}` : null,
        bucket === 'fisqps' ? `fispqs/${filePath}` : null,
        
        // Certificado específico que está causando erro
        filePath.includes('Certificado') ? 
          `${filePath.replace(/^Certificado\s*-\s*/, '')}` : 
          null
      ].filter(Boolean); // Remove valores nulos
      
      for (const tryPath of possiblePaths) {
        try {
          console.log(`Tentando caminho alternativo no bucket ${bucket}:`, tryPath);
          const { data } = supabase.storage.from(bucket).getPublicUrl(tryPath as string);
          if (data?.publicUrl) {
            console.log('Redirecionando para URL:', data.publicUrl);
            return NextResponse.redirect(data.publicUrl);
          }
        } catch (err) {
          console.log(`Falha ao tentar caminho ${tryPath} no bucket ${bucket}:`, err);
        }
      }
      
      // Se chegamos aqui, nenhuma tentativa funcionou
      return new NextResponse(`Arquivo não encontrado no Storage: ${filePath}. Por favor, verifique se o arquivo foi carregado corretamente.`, { status: 404 });
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
