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

    // Verificar se estamos em ambiente de produção (Vercel)
    const isProduction = process.env.VERCEL === '1';

    // Em produção, redirecionamos para a URL pública do Supabase Storage
    if (isProduction) {
      // Se o caminho já é um caminho do Supabase Storage (uid/tipo/arquivo)
      if (filePath.includes('/certificados/') || filePath.includes('/registros/')) {
        // Usar o caminho diretamente no Supabase Storage
        const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);
        return NextResponse.redirect(data.publicUrl);
      } else {
        // Se for um caminho relativo da pasta public, não podemos acessá-lo em produção
        return new NextResponse('Formato de arquivo não suportado em produção', { status: 400 });
      }
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
