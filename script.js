document.addEventListener("DOMContentLoaded", function() {
    // Navegação entre páginas
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");
    const notificationIcon = document.getElementById("notification-icon");
    const notificationCount = document.getElementById("notification-count");
    const notificationMenu = document.getElementById("notification-menu");
    const notificationList = document.getElementById("notification-list");

    const alertas = [
        { produto: "Produto A", diasRestantes: 3 },
        { produto: "Produto B", diasRestantes: 5 }
    ];

    function atualizarAlertas() {
        notificationList.innerHTML = ""; // Limpa a lista de notificações

        if (alertas.length > 0) {
            alertas.forEach(alerta => {
                const alertItem = document.createElement("li");
                alertItem.classList.add("alert-item");
                alertItem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${alerta.produto} - ${alerta.diasRestantes} dias restantes`;
                notificationList.appendChild(alertItem);
            });

            notificationCount.textContent = alertas.length;
            notificationCount.style.display = "block"; // Mostra a bolinha vermelha
        } else {
            notificationCount.style.display = "none";
        }
    }

    // Alterna a visibilidade do menu de notificações
    window.toggleNotifications = function() {
        notificationMenu.style.display = notificationMenu.style.display === "none" ? "block" : "none";
    };

    // Oculta o menu de notificações se clicar fora
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

    // Modal de feedback
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

    // Geração de relatório
    window.gerarRelatorio = function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const resultado = document.getElementById('relatorioResultado');
        
        if (startDate && endDate) {
            resultado.innerHTML = `
                <h3>Relatório de Vendas</h3>
                <p>Período: ${startDate} a ${endDate}</p>
                <div class="report-card">
                    <span class="report-item-title">Produto A</span>
                    <span>Quantidade: 50 - Total: R$500</span>
                </div>
                <div class="report-card">
                    <span class="report-item-title">Produto B</span>
                    <span>Quantidade: 30 - Total: R$300</span>
                </div>
                <div class="report-card">
                    <span class="report-item-title">Produto C</span>
                    <span>Quantidade: 20 - Total: R$200</span>
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

    // Compartilhar relatório
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
});
