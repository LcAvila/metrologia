import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string; // 'certificados' ou 'registros'
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Criar um nome de arquivo único
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Caminho onde o arquivo será salvo
    const uploadDir = path.join(process.cwd(), 'public', folder);
    
    // Verificar se o diretório existe, se não, criar
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Converter o arquivo para um Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Salvar o arquivo
    await writeFile(filePath, buffer);
    
    // Retornar o caminho relativo para uso na API de visualização
    const relativePath = `/${folder}/${uniqueFilename}`;
    
    return NextResponse.json({ 
      success: true, 
      filePath: relativePath,
      fileName: file.name
    });
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    return NextResponse.json({ error: 'Falha ao processar o upload' }, { status: 500 });
  }
}
