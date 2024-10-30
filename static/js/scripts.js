// static/js/scripts.js

// Funções para Dashboard
async function fetchNotificacoes() {
    const response = await fetch('/api/notificacoes');
    const data = await response.json();

    const listaNotificacoes = document.getElementById('lista_notificacoes');
    listaNotificacoes.innerHTML = '';

    if (data.alertas_validade && data.alertas_validade.length > 0) {
        data.alertas_validade.forEach(alerta => {
            const li = document.createElement('li');
            li.textContent = `O produto "${alerta.nome}" está próximo da validade (${alerta.data_validade}). Estoque atual: ${alerta.estoqueAtual}.`;
            listaNotificacoes.appendChild(li);
        });
    } else {
        listaNotificacoes.innerHTML = '<li>Sem notificações no momento.</li>';
    }
}

async function renderGraficosDashboard() {
    // Exemplo de gráfico de vendas recentes
    const response = await fetch('/api/vendas_recentes');
    const data = await response.json();

    const ctxVendas = document.getElementById('graficoVendas').getContext('2d');
    new Chart(ctxVendas, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Vendas',
                data: data.values,
                borderColor: '#3273dc',
                fill: false
            }]
        }
    });

    // Exemplo de gráfico de produtos em baixa
    const responseEstoque = await fetch('/api/produtos_estoque_baixo');
    const dataEstoque = await responseEstoque.json();

    const ctxEstoque = document.getElementById('graficoEstoqueBaixo').getContext('2d');
    new Chart(ctxEstoque, {
        type: 'bar',
        data: {
            labels: dataEstoque.labels,
            datasets: [{
                label: 'Estoque',
                data: dataEstoque.values,
                backgroundColor: '#ff3860'
            }]
        }
    });
}

// Funções para Relatórios
function inicializarRelatorios() {
    const tabs = document.querySelectorAll('.tabs ul li');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');

            tabContents.forEach(content => {
                content.classList.add('is-hidden');
                if (content.id === target) {
                    content.classList.remove('is-hidden');
                }
            });
        });
    });

    carregarProdutosSelect();
}

async function carregarProdutosSelect() {
    const response = await fetch('/api/produtos');
    const produtos = await response.json();
    const selectProduto = document.getElementById('selectProduto');

    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = produto.nome;
        selectProduto.appendChild(option);
    });
}

async function fetchRelatorioVendas() {
    const dataInicio = document.getElementById('data_inicio').value;
    const dataFim = document.getElementById('data_fim').value;

    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione as datas de início e fim.');
        return;
    }

    const response = await fetch(`/api/relatorio_vendas?data_inicio=${dataInicio}&data_fim=${dataFim}`);
    const data = await response.json();

    if (data.erro) {
        renderError(data.erro, 'relatorioVendas');
    } else {
        renderRelatorioVendas(data);
    }
}

function renderRelatorioVendas(data) {
    const relatorioDiv = document.getElementById('relatorioVendas');
    let htmlContent = `
        <table class="table is-striped is-fullwidth">
            <thead>
                <tr>
                    <th>Nome do Produto</th>
                    <th>Estoque Atual</th>
                    <th>Quantidade Vendida</th>
                    <th>Total de Vendas (R$)</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach(item => {
        htmlContent += `
            <tr>
                <td>${item.nome_produto}</td>
                <td>${item.estoque_atual}</td>
                <td>${item.quantidade_vendida}</td>
                <td>${item.total_vendas.toFixed(2)}</td>
            </tr>
        `;
    });
    htmlContent += '</tbody></table>';
    relatorioDiv.innerHTML = htmlContent;
}

async function fetchPrevisao() {
    const produtoId = document.getElementById('selectProduto').value;
    const periodo = document.getElementById('periodo').value;

    if (!produtoId) {
        alert('Por favor, selecione um produto.');
        return;
    }

    const response = await fetch(`/api/previsao/${produtoId}?periodo=${periodo}`);
    const data = await response.json();

    if (data.erro) {
        renderError(data.erro, 'relatorioPrevisao');
    } else if (data.mensagem) {
        renderError(data.mensagem, 'relatorioPrevisao');
    } else {
        renderPrevisao(data, produtoId);
    }
}

async function renderPrevisao(data, produtoId) {
    const responseProduto = await fetch(`/api/produtos`);
    const produtos = await responseProduto.json();
    const produto = produtos.find(p => p.id === produtoId);

    if (!produto) {
        renderError('Produto não encontrado.', 'relatorioPrevisao');
        return;
    }

    const estoqueAtual = produto.estoqueAtual;

    // Calcular a quantidade total prevista
    const quantidadePrevistaTotal = data.reduce((sum, item) => sum + item.quantidade_prevista, 0);

    // Calcular recomendação de reabastecimento
    const recomendacao = Math.max(0, quantidadePrevistaTotal - estoqueAtual);

    const relatorioDiv = document.getElementById('relatorioPrevisao');
    let htmlContent = `
        <h3 class="subtitle">Previsão de Demanda para: ${produto.nome}</h3>
        <p><strong>Estoque Atual:</strong> ${estoqueAtual}</p>
        <p><strong>Quantidade Prevista Total:</strong> ${quantidadePrevistaTotal.toFixed(2)}</p>
        <p><strong>Recomendação de Reabastecimento:</strong> ${recomendacao.toFixed(2)}</p>
        <canvas id="graficoPrevisao"></canvas>
    `;
    relatorioDiv.innerHTML = htmlContent;

    // Renderizar gráfico
    const ctx = document.getElementById('graficoPrevisao').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.data),
            datasets: [{
                label: 'Quantidade Prevista',
                data: data.map(item => item.quantidade_prevista),
                borderColor: '#00d1b2',
                fill: false
            }]
        }
    });
}

function renderError(errorMessage, elementId) {
    const relatorioDiv = document.getElementById(elementId);
    relatorioDiv.innerHTML = `<div class="notification is-danger">${errorMessage}</div>`;
}

// Funções para Produtos
async function fetchProdutos() {
    const response = await fetch('/api/produtos');
    const produtos = await response.json();
    renderListaProdutos(produtos);
}

function renderListaProdutos(produtos) {
    const listaDiv = document.getElementById('listaProdutos');
    let htmlContent = `
        <table class="table is-striped is-fullwidth">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Preço (R$)</th>
                    <th>Estoque Atual</th>
                    <th>Data de Validade</th>
                </tr>
            </thead>
            <tbody>
    `;
    produtos.forEach(produto => {
        const dataValidade = new Date(produto.dataValidade).toLocaleDateString();
        htmlContent += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.categoriaId}</td>
                <td>${produto.preco.toFixed(2)}</td>
                <td>${produto.estoqueAtual}</td>
                <td>${dataValidade}</td>
            </tr>
        `;
    });
    htmlContent += '</tbody></table>';
    listaDiv.innerHTML = htmlContent;
}

