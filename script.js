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

    // Atualiza lista de alertas de exemplo
    const alertas = [
        { produto: "Produto A", diasRestantes: 3 },
        { produto: "Produto B", diasRestantes: 5 }
    ];

    function atualizarAlertas() {
        notificationList.innerHTML = "";
        if (alertas.length > 0) {
            alertas.forEach(alerta => {
                const alertItem = document.createElement("li");
                alertItem.classList.add("alert-item");
                alertItem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${alerta.produto} - ${alerta.diasRestantes} dias restantes`;
                notificationList.appendChild(alertItem);
            });
            notificationCount.textContent = alertas.length;
            notificationCount.style.display = "block";
        } else {
            notificationCount.style.display = "none";
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

    // Função para salvar o produto no cadastro
    window.saveProduct = function() {
        const product = {
            codigoBarras: document.getElementById('barcodeInput').value,
            nome: document.getElementById('productName').value,
            categoria: document.getElementById('productCategory').value,
            quantidade: document.getElementById('productQuantity').value,
            preco: document.getElementById('productPrice').value,
            validade: document.getElementById('productExpiration').value,
            dataCadastro: document.getElementById('productDate').value,
            fornecedor: document.getElementById('productSupplier').value
        };

        console.log("Produto cadastrado:", product);
        alert("Produto cadastrado com sucesso!");
        
        // Limpa os campos do formulário
        document.getElementById('barcodeInput').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('productQuantity').value = '';
        document.getElementById('productPrice').value = '';
    // Função para registrar uma venda
    window.registerSale = function() {
        const sale = {
            dataVenda: document.getElementById('saleDate').value,
            produto: document.getElementById('saleProduct').value,
            quantidadeVendida: document.getElementById('productQuantitySold').value,
            precoVenda: document.getElementById('salePrice').value
        };
        if (feedbackText.trim()) {
            const emailParams = {
                message: feedbackText,
        console.log("Venda registrada:", sale);
        alert("Venda registrada com sucesso!");

        // Limpa os campos do formulário
        document.getElementById('saleDate').value = '';
        document.getElementById('saleProduct').value = '';
        document.getElementById('productQuantitySold').value = '';
        document.getElementById('salePrice').value = '';
    };

    // Função para atualizar lista de alertas
    const alertas = [
        { produto: "Produto A", diasRestantes: 3 },
        { produto: "Produto B", diasRestantes: 5 }
    ];

    function atualizarAlertas() {
        notificationList.innerHTML = "";
        if (alertas.length > 0) {
            alertas.forEach(alerta => {
                const alertItem = document.createElement("li");
                alertItem.classList.add("alert-item");
                alertItem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${alerta.produto} - ${alerta.diasRestantes} dias restantes`;
                notificationList.appendChild(alertItem);
            });
            notificationCount.textContent = alertas.length;
    document.addEventListener("click", function(event) {
        if (!notificationIcon.contains(event.target)) {
            notificationMenu.style.display = "none";
        }
    });

    atualizarAlertas();
});
