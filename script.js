document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");
    const notificationIcon = document.getElementById("notification-icon");
    const notificationCount = document.getElementById("notification-count");
    const notificationMenu = document.getElementById("notification-menu");
    const notificationList = document.getElementById("notification-list");
    const icon = document.getElementById('darkmode-icon');

    // Função para alternar o modo escuro
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        
        // Alterna entre os ícones de sol e lua
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

    // Alertas de exemplo
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

    // Oculta o menu de notificações ao clicar fora
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

    // Função para o feedback
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
});
