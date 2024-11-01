from flask import Flask, jsonify, render_template, request
import sqlite3
import logging
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime
from prophet import Prophet
from flask import Flask, jsonify, render_template, request
import sqlite3
import logging
import pandas as pd
import numpy as np
from datetime import datetime
from prophet import Prophet


app = Flask(__name__)


# Configurando o log para ver erros no console
logging.basicConfig(level=logging.DEBUG)


# Função para conectar ao banco de dados
def get_db_connection():
    conn = sqlite3.connect('database.db')  # Substitua 'seu_banco_de_dados.db' pelo nome correto do seu banco de dados
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/')
def dashboard():
    max_date = datetime.now().strftime('%Y-%m-%d')
    return render_template('dashboard.html', max_date=max_date)


@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    try:
        search = request.args.get('search', default='', type=str)
        categoria_id = request.args.get('categoria_id', default='', type=str)

        conn = get_db_connection()

        # Construir a consulta SQL dinamicamente
        query = '''
            SELECT p.*, c.nome AS categoria_nome
            FROM produto p
            LEFT JOIN categoria c ON p.categoriaId = c.id
            WHERE 1=1
        '''
        params = []

        if search:
            query += ' AND p.nome LIKE ?'
            params.append(f'%{search}%')

        if categoria_id:
            query += ' AND p.categoriaId = ?'
            params.append(categoria_id)

        produtos = conn.execute(query, params).fetchall()
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



def prever_demanda(produto_id):
    try:
        conn = get_db_connection()
        query = '''
            SELECT v.dataVenda, vp.quantidadeProduto
            FROM vendaProduto vp
            JOIN venda v ON vp.vendaId = v.id
            WHERE vp.produtoId = ?
            ORDER BY v.dataVenda ASC
        '''
        dados = conn.execute(query, (produto_id,)).fetchall()
        conn.close()

        # Converter os dados para um DataFrame do pandas
        datas = [datetime.fromtimestamp(row['dataVenda']/1000) for row in dados]
        quantidades = [row['quantidadeProduto'] for row in dados]
        df = pd.DataFrame({'data': datas, 'quantidade': quantidades})

        # Agregar as vendas por dia
        df = df.groupby('data').sum().reset_index()

        # Converter datas para valores numéricos
        df['data_ordinal'] = df['data'].map(datetime.toordinal)

        # Preparar dados para o modelo
        X = df[['data_ordinal']]
        y = df['quantidade']

        # Verificar se há dados suficientes
        if len(df) < 2:
            return {'mensagem': 'Dados insuficientes para previsão'}

        # Treinar o modelo de regressão linear
        modelo = LinearRegression()
        modelo.fit(X, y)

        # Prever demanda para os próximos 7 dias
        previsoes = []
        for i in range(1, 8):
            data_futura = datetime.now() + pd.Timedelta(days=i)
            data_ordinal = data_futura.toordinal()
            quantidade_prevista = modelo.predict([[data_ordinal]])
            previsoes.append({
                'data': data_futura.strftime('%Y-%m-%d'),
                'quantidade_prevista': max(0, quantidade_prevista[0])  # Evitar valores negativos
            })

        return previsoes

    except Exception as e:
        app.logger.error(f"Erro ao prever demanda: {e}")
        return {'erro': 'Erro ao prever demanda'}


@app.route('/api/previsao/<produto_id>', methods=['GET'])
def get_previsao(produto_id):
    periodo = request.args.get('periodo', default=7, type=int)
    previsao = prever_demanda(produto_id, periodo)
    return jsonify(previsao)


@app.route('/api/relatorio_vendas', methods=['GET'])
def relatorio_vendas():
    try:
        # Obter as datas de início e fim dos parâmetros da URL
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')

        if not data_inicio or not data_fim:
            return jsonify({'erro': 'Datas de início e fim são necessárias'}), 400

        # Converter as datas para timestamps
        formato_data = '%Y-%m-%d'
        data_inicio_timestamp = int(datetime.strptime(data_inicio, formato_data).timestamp() * 1000)
        data_fim_timestamp = int(datetime.strptime(data_fim, formato_data).timestamp() * 1000)

        # Verificar se as datas não são futuras
        data_atual_timestamp = int(datetime.now().timestamp() * 1000)
        if data_inicio_timestamp > data_atual_timestamp or data_fim_timestamp > data_atual_timestamp:
            return jsonify({'erro': 'Datas futuras não são permitidas'}), 400

        conn = get_db_connection()
        query = '''
            SELECT 
                p.nome AS nome_produto,
                p.estoqueAtual AS estoque_atual,
                SUM(vp.quantidadeProduto) AS quantidade_vendida,
                SUM(vp.precoVenda * vp.quantidadeProduto) AS total_vendas
            FROM vendaProduto vp
            JOIN produto p ON vp.produtoId = p.id
            JOIN venda v ON vp.vendaId = v.id
            WHERE v.dataVenda BETWEEN ? AND ?
            GROUP BY p.id
            ORDER BY quantidade_vendida DESC
        '''
        vendas = conn.execute(query, (data_inicio_timestamp, data_fim_timestamp)).fetchall()
        conn.close()

        return jsonify([dict(row) for row in vendas])
    except Exception as e:
        app.logger.error(f"Erro ao gerar relatório de vendas: {e}")
        return jsonify({'erro': 'Erro ao gerar relatório de vendas'}), 500

@app.route('/api/alertas_validade', methods=['GET'])
def alertas_validade():
    try:
        conn = get_db_connection()
        query = '''
            SELECT 
                nome, 
                estoqueAtual, 
                date(dataValidade / 1000, 'unixepoch') AS data_validade
            FROM produto
            WHERE dataValidade BETWEEN ? AND ?
        '''
        data_atual_timestamp = int(datetime.now().timestamp() * 1000)
        sete_dias_timestamp = data_atual_timestamp + (7 * 24 * 60 * 60 * 1000)

        produtos = conn.execute(query, (data_atual_timestamp, sete_dias_timestamp)).fetchall()
        conn.close()

        return jsonify([dict(row) for row in produtos])
    except Exception as e:
        app.logger.error(f"Erro ao obter alertas de validade: {e}")
        return jsonify({'erro': 'Erro ao obter alertas de validade'}), 500




def prever_demanda(produto_id, periodo=30):
    try:
        conn = get_db_connection()
        query = '''
            SELECT v.dataVenda, vp.quantidadeProduto
            FROM vendaProduto vp
            JOIN venda v ON vp.vendaId = v.id
            WHERE vp.produtoId = ?
            ORDER BY v.dataVenda ASC
        '''
        dados = conn.execute(query, (produto_id,)).fetchall()
        conn.close()

        # Converter os dados para um DataFrame do pandas
        datas = [datetime.fromtimestamp(row['dataVenda']/1000) for row in dados]
        quantidades = [row['quantidadeProduto'] for row in dados]
        df = pd.DataFrame({'ds': datas, 'y': quantidades})

        if df.empty or len(df) < 2:
            return {'mensagem': 'Dados insuficientes para previsão'}

        # Treinar o modelo Prophet
        modelo = Prophet(daily_seasonality=True)
        modelo.fit(df)

        # Criar dataframe futuro
        futuro = modelo.make_future_dataframe(periods=periodo)
        previsao = modelo.predict(futuro)

        # Selecionar previsões futuras
        previsoes_futuras = previsao[previsao['ds'] > df['ds'].max()][['ds', 'yhat']]

        # Preparar resultados
        resultados = []
        for _, row in previsoes_futuras.iterrows():
            resultados.append({
                'data': row['ds'].strftime('%Y-%m-%d'),
                'quantidade_prevista': max(0, row['yhat'])  # Evitar valores negativos
            })

        return resultados

    except Exception as e:
        app.logger.error(f"Erro ao prever demanda: {e}")
        return {'erro': 'Erro ao prever demanda'}

@app.route('/api/notificacoes', methods=['GET'])
def notificacoes():
    # Aqui podemos combinar os alertas de validade e outras notificações
    alertas = alertas_validade().json
    return jsonify({'alertas_validade': alertas})

@app.route('/dashboard')
def dashboard_redirect():
    return render_template('base.html')

@app.route('/relatorios')
def relatorios():
    max_date = datetime.now().strftime('%Y-%m-%d')
    return render_template('relatorios.html', max_date=max_date)

@app.route('/produtos')
def produtos():
    return render_template('produtos.html')

@app.route('/api/vendas_recentes', methods=['GET'])
def vendas_recentes():
    try:
        conn = get_db_connection()
        query = '''
            SELECT date(v.dataVenda / 1000, 'unixepoch') AS data_venda,
                   SUM(vp.quantidadeProduto) AS total_quantidade
            FROM vendaProduto vp
            JOIN venda v ON vp.vendaId = v.id
            WHERE v.dataVenda >= ?
            GROUP BY data_venda
            ORDER BY data_venda ASC
        '''
        data_inicio_timestamp = int((datetime.now() - pd.Timedelta(days=30)).timestamp() * 1000)
        vendas = conn.execute(query, (data_inicio_timestamp,)).fetchall()
        conn.close()

        labels = [row['data_venda'] for row in vendas]
        values = [row['total_quantidade'] for row in vendas]

        return jsonify({'labels': labels, 'values': values})
    except Exception as e:
        app.logger.error(f"Erro ao obter vendas recentes: {e}")
        return jsonify({'erro': 'Erro ao obter vendas recentes'}), 500

@app.route('/api/produtos_estoque_baixo', methods=['GET'])
def produtos_estoque_baixo():
    try:
        conn = get_db_connection()
        query = '''
            SELECT nome, estoqueAtual
            FROM produto
            WHERE estoqueAtual < ?
            ORDER BY estoqueAtual ASC
            LIMIT 5
        '''
        produtos = conn.execute(query, (50,)).fetchall()
        conn.close()

        labels = [row['nome'] for row in produtos]
        values = [row['estoqueAtual'] for row in produtos]

        return jsonify({'labels': labels, 'values': values})
    except Exception as e:
        app.logger.error(f"Erro ao obter produtos com estoque baixo: {e}")
        return jsonify({'erro': 'Erro ao obter produtos com estoque baixo'}), 500



@app.route('/scanner')
def scanner():
    return render_template('scanner.html')


@app.route('/api/produto/<produto_id>', methods=['GET'])
def get_produto(produto_id):
    try:
        conn = get_db_connection()
        query = '''
            SELECT p.*, c.nome AS categoria_nome
            FROM produto p
            JOIN categoria c ON p.categoriaId = c.id
            WHERE p.id = ?
        '''
        produto = conn.execute(query, (produto_id,)).fetchone()
        conn.close()
        if produto is None:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        return jsonify(dict(produto))
    except Exception as e:
        app.logger.error(f"Erro ao obter produto: {e}")
        return jsonify({'erro': 'Erro ao obter produto'}), 500


@app.route('/api/produtos_mais_vendidos', methods=['GET'])
def produtos_mais_vendidos():
    try:
        conn = get_db_connection()
        query = '''
            SELECT p.nome, SUM(vp.quantidadeProduto) AS quantidade_vendida
            FROM vendaProduto vp
            JOIN produto p ON vp.produtoId = p.id
            GROUP BY p.id
            ORDER BY quantidade_vendida DESC
            LIMIT 5
        '''
        produtos = conn.execute(query).fetchall()
        conn.close()

        labels = [row['nome'] for row in produtos]
        values = [row['quantidade_vendida'] for row in produtos]

        return jsonify({'labels': labels, 'values': values})
    except Exception as e:
        app.logger.error(f"Erro ao obter produtos mais vendidos: {e}")
        return jsonify({'erro': 'Erro ao obter produtos mais vendidos'}), 500


if __name__ == '__main__':
    app.run(debug=True)
