document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");
    const notificationIcon = document.getElementById("notification-icon");
    const notificationCount = document.getElementById("notification-count");
    const notificationMenu = document.getElementById("notification-menu");
    const notificationList = document.getElementById("notification-list");
    const icon = document.getElementById('darkmode-icon');

    // Define limite para não permitir seleção de datas futuras no relatório
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("startDate").max = today;
    document.getElementById("endDate").max = today;

    // Função para alternar o modo escuro
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    };

    // Função para alternar visibilidade do menu de notificações
    window.toggleNotifications = function() {
        notificationMenu.style.display = notificationMenu.style.display === "none" ? "block" : "none";
    };

    // Atualiza lista de alertas para produtos com validade próxima
    const alertas = [
        { produto: "Produto A", diasRestantes: 3, validade: "2024-12-01", estoque: 20 },
        { produto: "Produto B", diasRestantes: 5, validade: "2024-11-15", estoque: 15 }
    ];

    function atualizarAlertas() {
        notificationList.innerHTML = "";
        const alertListPage = document.getElementById("alert-list-page"); // Lista na página de alertas
        alertListPage.innerHTML = "";

        const alertasProximos = alertas.filter(alerta => alerta.diasRestantes <= 7);

        if (alertasProximos.length > 0) {
            alertasProximos.forEach(alerta => {
                const alertItem = document.createElement("li");
                alertItem.classList.add("alert-item");
                alertItem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${alerta.produto} - ${alerta.diasRestantes} dias restantes - Validade: ${alerta.validade}, Estoque: ${alerta.estoque}`;
                notificationList.appendChild(alertItem.cloneNode(true)); // Exibe no menu de notificação
                alertListPage.appendChild(alertItem); // Exibe na página de alertas
            });
            notificationCount.textContent = alertasProximos.length;
            notificationCount.style.display = "block";
        } else {
            notificationCount.style.display = "none";
            alertListPage.innerHTML = "<li class='alert-item'>Nenhum alerta de validade próximo.</li>";
        }
    }

    document.addEventListener("click", function(event) {
        if (!notificationIcon.contains(event.target)) {
            notificationMenu.style.display = "none";
        }
    });

    atualizarAlertas();

    function goToPage(pageId) {
        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(pageId).classList.add("active");
    }

    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const targetPageId = link.getAttribute("href").substring(1);
            goToPage(targetPageId);
        });
    });

    // Função para abrir e fechar o modal de feedback
    window.openFeedbackForm = function() {
        document.getElementById("feedbackModal").style.display = "block";
    };

    window.closeFeedbackForm = function() {
        document.getElementById("feedbackModal").style.display = "none";
    };

    // Envio de feedback com EmailJS
    window.sendFeedback = function() {
        const feedbackText = document.getElementById("feedbackText").value;

        if (feedbackText.trim()) {
            const emailParams = {
                message: feedbackText,
                email: "mercado.garibaldi1@gmail.com"
            };

            emailjs.send("service_6vkuzju", "template_d9ery8j", emailParams)
                .then(function(response) {
                    alert("Feedback enviado com sucesso!");
                    closeFeedbackForm();
                    document.getElementById("feedbackText").value = "";
                }, function(error) {
                    alert("Erro ao enviar feedback.");
                    console.error("Erro:", error);
                });
        } else {
            alert("Por favor, escreva seu feedback.");
        }
    };

    // Gráficos do Dashboard
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
            datasets: [{
                label: 'Vendas Mensais',
                data: [100, 150, 130, 200, 170, 210],
                borderColor: '#2A9D8F',
                backgroundColor: 'rgba(42, 157, 143, 0.2)',
                fill: true
            }]
        },
        options: { responsive: true }
    });

    const stockCtx = document.getElementById('stockChart').getContext('2d');
    new Chart(stockCtx, {
        type: 'doughnut',
        data: {
            labels: ['Bebidas', 'Laticínios', 'Grãos'],
            datasets: [{
                data: [30, 20, 50],
                backgroundColor: ['#FFB74D', '#4FC3F7', '#81C784']
            }]
        },
        options: { responsive: true }
    });

    const demandCtx = document.getElementById('demandChart').getContext('2d');
    new Chart(demandCtx, {
        type: 'bar',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
            datasets: [{
                label: 'Demanda Prevista',
                data: [100, 120, 90, 140, 110, 130],
                backgroundColor: '#2A9D8F',
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Função para gerar o Relatório de Vendas
    window.gerarRelatorio = function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const resultado = document.getElementById('relatorioResultado');

        if (startDate && endDate) {
            // Exibir relatório específico com dados de exemplo
            resultado.innerHTML = `
                <h3>Relatório de Vendas</h3>
                <p>Período: ${startDate} a ${endDate}</p>
                <div class="report-card">
                    <span class="report-item-title">Produto A</span>
                    <span>Quantidade em Estoque: 20 - Quantidade Vendida: 50 - Total: R$500</span>
                </div>
                <div class="report-card">
                    <span class="report-item-title">Produto B</span>
                    <span>Quantidade em Estoque: 15 - Quantidade Vendida: 30 - Total: R$300</span>
                </div>
                <div class="report-card">
                    <span class="report-item-title">Produto C</span>
                    <span>Quantidade em Estoque: 10 - Quantidade Vendida: 20 - Total: R$200</span>
                </div>
                <div class="report-buttons">
                    <button onclick="window.print()" class="btn-secondary">Imprimir Relatório</button>
                    <button onclick="compartilharRelatorio()" class="btn-secondary">Compartilhar Relatório</button>
                </div>
            `;
        } else {
            resultado.innerHTML = `<p style="color: red;">Por favor, selecione as datas de início e fim para gerar o relatório.</p>`;
        }
    };

    // Função para compartilhar relatório
    window.compartilharRelatorio = function() {
        const resultado = document.getElementById('relatorioResultado').innerText;
        if (navigator.share) {
            navigator.share({
                title: 'Relatório de Vendas',
                text: resultado,
            }).then(() => {
                console.log('Relatório compartilhado com sucesso!');
            }).catch((error) => {
                console.error('Erro ao compartilhar o relatório:', error);
            });
        } else {
            alert("O compartilhamento não é suportado neste navegador.");
        }
    };

    // Funções de escaneamento de código de barras
    const scannerOverlay = document.getElementById('scanner');
    const video = document.getElementById('video');

    window.startBarcodeScan = function() {
        scannerOverlay.style.display = 'flex';

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
                video.play();
            })
            .catch(error => {
                console.error("Erro ao acessar a câmera:", error);
                alert("Erro ao acessar a câmera.");
                stopBarcodeScan();
            });
    };

    window.stopBarcodeScan = function() {
        scannerOverlay.style.display = 'none';

        if (video.srcObject) {
            const stream = video.srcObject;
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    };

    // Função para verificar validade do produto
    const scannerValidityOverlay = document.getElementById('scanner-validity');
    const videoValidity = document.getElementById('video-validity');

    window.startBarcodeScanForValidity = function() {
        scannerValidityOverlay.style.display = 'flex';

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                videoValidity.srcObject = stream;
                videoValidity.play();
            })
            .catch(error => {
                console.error("Erro ao acessar a câmera: ", error);
                alert("Erro ao acessar a câmera.");
                stopBarcodeScanForValidity();
            });
    };

    window.stopBarcodeScanForValidity = function() {
        scannerValidityOverlay.style.display = 'none';

        if (videoValidity.srcObject) {
            const stream = videoValidity.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoValidity.srcObject = null;
        }
    };

    window.checkProductValidity = function() {
        const barcode = document.getElementById('validadeBarcodeInput').value;
        const validadeResult = document.getElementById('validadeResult');

        const produtos = [
            { codigoBarra: "123456789", nome: "Produto A", validade: "2024-12-31" },
            { codigoBarra: "987654321", nome: "Produto B", validade: "2024-11-15" },
            { codigoBarra: "456789123", nome: "Produto C", validade: "2025-01-10" }
        ];

        const produtoEncontrado = produtos.find(produto => produto.codigoBarra === barcode);

        if (produtoEncontrado) {
            const validade = new Date(produtoEncontrado.validade);
            const hoje = new Date();
            
            if (validade >= hoje) {
                validadeResult.textContent = `${produtoEncontrado.nome} está dentro da validade até ${produtoEncontrado.validade}.`;
                validadeResult.style.color = 'green';
            } else {
                validadeResult.textContent = `${produtoEncontrado.nome} está fora da validade desde ${produtoEncontrado.validade}.`;
                validadeResult.style.color = 'red';
            }
        } else {
            validadeResult.textContent = "Produto não encontrado para o código de barras inserido.";
            validadeResult.style.color = 'orange';
        }
    };
});
