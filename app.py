from flask import Flask, jsonify, render_template, request
import sqlite3
import logging

app = Flask(__name__)

# Configurando o log para ver erros no console
logging.basicConfig(level=logging.DEBUG)

# Função para conectar ao banco de dados
def get_db_connection():
    conn = sqlite3.connect('database.db')  # Substitua 'seu_banco_de_dados.db' pelo nome correto do seu banco de dados
    conn.row_factory = sqlite3.Row
    return conn

# Rota principal - Página HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para obter produtos
@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    try:
        conn = get_db_connection()
        produtos = conn.execute('SELECT * FROM produto').fetchall()
        conn.close()
        return jsonify([dict(row) for row in produtos])
    except Exception as e:
        app.logger.error(f"Erro ao obter produtos: {e}")
        return jsonify({"error": "Erro ao obter produtos"}), 500

# Rota para obter vendas
@app.route('/api/vendas', methods=['GET'])
def get_vendas():
    try:
        conn = get_db_connection()
        vendas = conn.execute('SELECT * FROM venda').fetchall()
        conn.close()
        return jsonify([dict(row) for row in vendas])
    except Exception as e:
        app.logger.error(f"Erro ao obter vendas: {e}")
        return jsonify({"error": "Erro ao obter vendas"}), 500

# Rota para obter categorias
@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    try:
        conn = get_db_connection()
        categorias = conn.execute('SELECT * FROM categoria').fetchall()
        conn.close()
        return jsonify([dict(row) for row in categorias])
    except Exception as e:
        app.logger.error(f"Erro ao obter categorias: {e}")
        return jsonify({"error": "Erro ao obter categorias"}), 500

if __name__ == '__main__':
    app.run(debug=True)
