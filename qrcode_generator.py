import qrcode
import os
import sqlite3

def gerar_qr_codes():
    try:
        # Conectar ao banco de dados
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row  # Permite acessar os resultados como dicionários
        cursor = conn.cursor()

        # Executar a consulta
        cursor.execute('SELECT id FROM produto')
        produtos = cursor.fetchall()

        # Fechar a conexão
        conn.close()

        if not produtos:
            print("Nenhum produto encontrado na tabela 'produto'.")
            return

        # Criar o diretório se não existir
        qrcodes_path = os.path.join('static', 'qrcodes')
        if not os.path.exists(qrcodes_path):
            os.makedirs(qrcodes_path)
            print(f"Diretório '{qrcodes_path}' criado.")

        # Gerar QR Codes
        for produto in produtos:
            produto_id = produto['id']
            data = str(produto_id)
            img = qrcode.make(data)
            img_path = os.path.join(qrcodes_path, f'{produto_id}.png')
            img.save(img_path)
            print(f"QR Code para o produto ID {produto_id} salvo em '{img_path}'.")

        print("Todos os QR Codes foram gerados com sucesso.")

    except sqlite3.Error as e:
        print(f"Erro ao acessar o banco de dados: {e}")
    except Exception as e:
        print(f"Ocorreu um erro: {e}")

if __name__ == "__main__":
    gerar_qr_codes()
