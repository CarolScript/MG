async function fetchProdutos() {
    const response = await fetch('/api/produtos');
    const produtos = await response.json();
    renderRelatorio(produtos, 'Produtos');
}

async function fetchVendas() {
    const response = await fetch('/api/vendas');
    const vendas = await response.json();
    renderRelatorio(vendas, 'Vendas');
}

async function fetchCategorias() {
    const response = await fetch('/api/categorias');
    const categorias = await response.json();
    renderRelatorio(categorias, 'Categorias');
}

function renderRelatorio(data, title) {
    const relatorioDiv = document.getElementById('relatorio');
    relatorioDiv.innerHTML = `<h2 class="title">${title}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
}
