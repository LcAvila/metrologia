import pandas as pd
import json
import os

# Caminho para a planilha
planilha_path = os.path.join('public', 'RS 4.4.6-11 - Controle e Distribuição das FDS  Rev-01.xlsx')

try:
    # Tenta ler o arquivo Excel
    # Primeiro, vamos obter os nomes das abas (sheets)
    excel_file = pd.ExcelFile(planilha_path)
    sheet_names = excel_file.sheet_names
    
    resultados = {"sheets": {}}
    
    for sheet in sheet_names:
        try:
            # Tenta ler cada aba
            df = pd.read_excel(planilha_path, sheet_name=sheet)
            
            # Converte NaN para None para melhor serialização em JSON
            df = df.where(pd.notna(df), None)
            
            # Obtém cabeçalhos e algumas linhas de amostra
            colunas = df.columns.tolist()
            
            # Pega até 10 linhas de amostra
            amostra = df.head(10).to_dict('records')
            
            # Conta total de linhas com dados (excluindo vazias)
            total_linhas = len(df.dropna(how='all'))
            
            resultados["sheets"][sheet] = {
                "colunas": colunas,
                "amostra": amostra,
                "total_linhas": total_linhas
            }
        except Exception as e:
            resultados["sheets"][sheet] = {"erro": str(e)}
    
    # Salva a análise em um arquivo JSON
    with open('analise_planilha_fdu.json', 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2, default=str)
    
    print("Análise concluída com sucesso. Resultados salvos em 'analise_planilha_fdu.json'")
    
except Exception as e:
    print(f"Erro ao analisar a planilha: {str(e)}")
