import pandas as pd
import json
import os
import time
from datetime import datetime, timedelta
import random
import string

# Caminho para a planilha
planilha_path = os.path.join('public', 'RS 4.4.6-11 - Controle e Distribuição das FDS  Rev-01.xlsx')

# Configurações para geração do arquivo JSON
output_path = 'fdus_importacao.json'

# Mapeamento de colunas da planilha para campos do sistema
MAPEAMENTO_COLUNAS = {
    'Unnamed: 0': 'id',
    'Unnamed: 1': 'produto',
    'SISTEMA DA GESTÃO INTEGRADA': 'nomeTecnico',
    'Unnamed: 3': 'fabricante',
    'Unnamed: 4': 'numeroCas',
    'Unnamed: 5': 'classificacaoGHS',
    'Unnamed: 6': 'classeRisco',
    'Unnamed: 7': 'localArmazenamento',
    'Unnamed: 8': 'setor',
    'Unnamed: 9': 'possuiFispq',
    'Unnamed: 10': 'epiNecessario',
    'Unnamed: 11': 'medidasPreventivas',
    'Unnamed: 12': 'destinacaoProduto',
}

def gerar_id_unico():
    """Gera um ID único para cada produto"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))

def gerar_data_validade():
    """Gera uma data de validade aleatória entre 6 meses e 3 anos no futuro"""
    hoje = datetime.now()
    dias_aleatorios = random.randint(180, 365 * 3)  # Entre 6 meses e 3 anos
    data_validade = hoje + timedelta(days=dias_aleatorios)
    return data_validade.strftime('%Y-%m-%d')

def gerar_data_criacao():
    """Gera uma data de criação aleatória nos últimos 2 anos"""
    hoje = datetime.now()
    dias_aleatorios = random.randint(1, 365 * 2)  # Até 2 anos atrás
    data_criacao = hoje - timedelta(days=dias_aleatorios)
    return data_criacao.strftime('%Y-%m-%dT%H:%M:%S')

def formatar_valor_booleano(valor):
    """Converte 'Sim'/'Não' para valor booleano"""
    if isinstance(valor, str):
        return valor.lower() == 'sim'
    return False

def processar_planilha(caminho_planilha):
    """Processa todas as abas da planilha e extrai os dados de FDUs"""
    print(f"Processando planilha: {caminho_planilha}")
    
    # Lista para armazenar todas as FDUs
    todas_fdus = []
    
    # Carregar o arquivo Excel
    try:
        excel_file = pd.ExcelFile(caminho_planilha)
        sheet_names = excel_file.sheet_names
        
        print(f"Encontradas {len(sheet_names)} abas na planilha")
        
        for sheet in sheet_names:
            print(f"Processando aba: {sheet}")
            try:
                # Ignorar linhas iniciais (cabeçalho)
                df = pd.read_excel(caminho_planilha, sheet_name=sheet, skiprows=4)
                
                # Processar cada linha válida com dados de FDU
                for _, row in df.iterrows():
                    # Verificar se é uma linha válida (contém um ID numérico na primeira coluna)
                    id_produto = row.get('Unnamed: 0')
                    if pd.isna(id_produto) or not isinstance(id_produto, (int, float, str)) or str(id_produto).strip() == "":
                        continue
                    
                    # Determinar nome do produto (nome comercial)
                    produto = row.get('Unnamed: 1')
                    if pd.isna(produto) or not produto:
                        continue
                    
                    # Criar objeto FDU
                    fdu = {
                        'id': gerar_id_unico(),
                        'produto': str(produto),
                        'nomeTecnico': str(row.get('SISTEMA DA GESTÃO INTEGRADA') or ''),
                        'fabricante': str(row.get('Unnamed: 3') or ''),
                        'numeroCas': str(row.get('Unnamed: 4') or ''),
                        'classificacaoGHS': str(row.get('Unnamed: 5') or ''),
                        'classeRisco': str(row.get('Unnamed: 6') or ''),
                        'localArmazenamento': str(row.get('Unnamed: 7') or ''),
                        'setor': sheet.strip(),  # Usar o nome da aba como setor
                        'possuiFispq': formatar_valor_booleano(row.get('Unnamed: 9')),
                        'epiNecessario': str(row.get('Unnamed: 10') or ''),
                        'medidasPreventivas': str(row.get('Unnamed: 11') or ''),
                        'destinacaoProduto': str(row.get('Unnamed: 12') or ''),
                        'validade': gerar_data_validade(),
                        'criadoEm': gerar_data_criacao(),
                        # Campo necessário mas será preenchido pelo sistema no momento da importação
                        'arquivoUrl': 'placeholder',
                    }
                    
                    # Limpar valores 'nan'
                    for key, value in fdu.items():
                        if isinstance(value, str) and (value.lower() == 'nan' or value.lower() == 'n.a'):
                            fdu[key] = ''
                    
                    todas_fdus.append(fdu)
                    
                print(f"Processados {len(todas_fdus)} produtos na aba {sheet}")
                
            except Exception as e:
                print(f"Erro ao processar aba {sheet}: {str(e)}")
                continue
        
        return todas_fdus
        
    except Exception as e:
        print(f"Erro ao abrir a planilha: {str(e)}")
        return []

def salvar_json(dados, caminho_saida):
    """Salva os dados em formato JSON"""
    try:
        with open(caminho_saida, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
        print(f"Dados salvos com sucesso em {caminho_saida}")
        return True
    except Exception as e:
        print(f"Erro ao salvar dados: {str(e)}")
        return False

def main():
    """Função principal"""
    print("Iniciando importação de FDUs da planilha...")
    
    # Processando planilha
    fdus = processar_planilha(planilha_path)
    print(f"Total de {len(fdus)} FDUs encontradas")
    
    # Salvando resultados
    if fdus:
        salvar_json(fdus, output_path)
        print("\nPróximos passos:")
        print("1. Execute o script de importação no Next.js para inserir os dados no Supabase")
        print("2. Atualize os arquivos das FDUs quando disponíveis")
    else:
        print("Nenhuma FDU encontrada para importação")

if __name__ == "__main__":
    main()
