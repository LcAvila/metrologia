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
      try {
        // Tentativa 1: Caminho direto
        const { data: directData } = supabase.storage.from('documentos').getPublicUrl(filePath);
        if (directData?.publicUrl) {
          console.log('Redirecionando para URL direta:', directData.publicUrl);
          return NextResponse.redirect(directData.publicUrl);
        }
      } catch (err) {
        console.log('Falha na tentativa de URL direta');
      }
      
      // Tentativa 2: Adicionar prefixos comuns se não existirem
      const possiblePaths = [
        filePath,
        `certificados/${filePath}`,
        `registros/${filePath}`,
        // Certificado específico que está causando erro
        filePath.includes('Certificado') ? 
          `certificados/${filePath.replace(/^Certificado\s*-\s*/, '')}` : 
          null
      ].filter(Boolean); // Remove valores nulos
      
      for (const tryPath of possiblePaths) {
        try {
          console.log('Tentando caminho alternativo:', tryPath);
          const { data } = supabase.storage.from('documentos').getPublicUrl(tryPath as string);
          if (data?.publicUrl) {
            console.log('Redirecionando para URL:', data.publicUrl);
            return NextResponse.redirect(data.publicUrl);
          }
        } catch (err) {
          console.log('Falha ao tentar caminho:', tryPath);
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
