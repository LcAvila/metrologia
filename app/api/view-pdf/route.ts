import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Obter o parâmetro 'file' da URL
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath) {
      return new NextResponse('Arquivo não especificado', { status: 400 });
    }

    // Construir o caminho completo do arquivo
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
