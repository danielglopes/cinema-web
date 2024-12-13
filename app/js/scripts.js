// js/scripts.js

document.addEventListener("DOMContentLoaded", () => {
  // URLs das APIs (ajuste conforme necessário)
  const sessoesApiUrl = "http://localhost:8080";

  // Função para criar um atraso (opcional)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Funções para População das Tabelas e Configuração dos Botões
  const initialize = async () => {
    try {
      await fetchSessoes(); // Executa fetchSessoes() e aguarda sua conclusão
      await fetchProdutos(); // Executa fetchProdutos() após fetchSessoes() ter concluído
      setupAddToCartButtons(); // Configura os botões após ambas as tabelas serem populadas
    } catch (error) {
      console.error("Erro durante a inicialização:", error);
    }
  };

  // Chamar initialize() para executar as funções sequencialmente
  initialize();

  // Função para Buscar e Popular a Tabela de Sessões
  async function fetchSessoes() {
    try {
      const response = await fetch(`${sessoesApiUrl}/tickets`, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro na requisição: ${response.status} ${response.statusText}`
        );
      }

      const sessoes = await response.json();
      console.log("🚀 ~ fetchSessoes ~ sessoes:", sessoes);
      populateSessoesTable(sessoes);
    } catch (error) {
      console.error("Falha ao buscar sessões:", error);
      alert(
        "Não foi possível carregar as sessões no momento. Por favor, tente novamente mais tarde."
      );
    }
  }

  // Função para Buscar e Popular a Tabela de Produtos
  async function fetchProdutos() {
    try {
      const response = await fetch(`${sessoesApiUrl}/products`, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro na requisição: ${response.status} ${response.statusText}`
        );
      }

      const produtos = await response.json();
      console.log("🚀 ~ fetchProdutos ~ produtos:", produtos);
      populateProdutosTable(produtos);
    } catch (error) {
      console.error("Falha ao buscar produtos:", error);
      alert(
        "Não foi possível carregar os produtos no momento. Por favor, tente novamente mais tarde."
      );
    }
  }

  // Função para Popular a Tabela de Sessões
  function populateSessoesTable(sessoes) {
    const sessoesTableBody = document.querySelector("#sessoesTable tbody");

    sessoes.forEach((sessao) => {
      const tr = document.createElement("tr");

      // Formatar data e hora
      const startTime = new Date(sessao.movieSession.startTime);
      const formattedDate = startTime.toLocaleDateString("pt-BR");
      const formattedTime = startTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      tr.innerHTML = `
                <td>${sessao.movie}</td>
                <td>${sessao.cinemaHall}</td>
                <td>${formattedDate}</td>
                <td>${formattedTime}</td>
                <td>${sessao.price}</td>
                <td>
                    <button class="btn btn-success btn-sm add-to-cart" data-product='${JSON.stringify(
                      sessao
                    )}'>
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </td>
            `;

      sessoesTableBody.appendChild(tr);
    });
  }

  // Função para Popular a Tabela de Produtos
  function populateProdutosTable(produtos) {
    const produtosTableBody = document.querySelector("#produtosTable tbody");

    produtos.forEach((produto) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${produto.name}</td>
                <td>R$ ${produto.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-success btn-sm add-to-cart" data-product='${JSON.stringify(
                      produto
                    )}'>
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </td>
            `;

      produtosTableBody.appendChild(tr);
    });
  }

  // Função para Configurar os Botões "Adicionar ao Carrinho"
  function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart");

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productData = button.getAttribute("data-product");
        const product = JSON.parse(productData);
        addItemToCart(product);
      });
    });
  }

  // Carrinho de compras armazenado no localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Função para salvar o carrinho no localStorage
  const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  // Função para atualizar a tabela do carrinho
  const updateCartTable = () => {
    const cartTableBody = document.querySelector("#cartTable tbody");
    const cartTotalElement = document.getElementById("cartTotal");

    // Limpar o conteúdo atual da tabela
    cartTableBody.innerHTML = "";

    // Variável para calcular o total
    let total = 0;

    cart.forEach((item, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${item.produto}</td>
                <td>${item.descricao}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${
                      item.quantidade
                    }" class="form-control form-control-sm quantity-input" data-index="${index}">
                </td>
                <td>R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm remove-item" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;

      cartTableBody.appendChild(tr);

      // Atualizar o total
      total += item.preco * item.quantidade;
    });

    cartTotalElement.textContent = total.toFixed(2);

    // Adicionar eventos aos novos elementos
    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", removeItem);
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", updateQuantity);
    });
  };

  // Função para adicionar um item ao carrinho
  const addItemToCart = (product) => {
    // Verificar se o produto já está no carrinho
    const existingIndex = cart.findIndex(
      (item) => item.produto === product.produto
    );

    if (existingIndex !== -1) {
      // Incrementar a quantidade se já existir
      cart[existingIndex].quantidade += 1;
    } else {
      // Adicionar novo produto ao carrinho
      cart.push({ ...product, quantidade: 1 });
    }

    saveCart();
    updateCartTable();

    // Mostrar Toast de Sucesso
    const successToast = new bootstrap.Toast(
      document.getElementById("successToast")
    );
    successToast.show();
  };

  // Função para remover um item do carrinho
  const removeItem = (e) => {
    const index = e.currentTarget.getAttribute("data-index");
    cart.splice(index, 1);
    saveCart();
    updateCartTable();
  };

  // Função para atualizar a quantidade de um item
  const updateQuantity = (e) => {
    const index = e.currentTarget.getAttribute("data-index");
    const newQuantity = parseInt(e.currentTarget.value);

    if (newQuantity < 1) {
      e.currentTarget.value = 1;
      return;
    }

    cart[index].quantidade = newQuantity;
    saveCart();
    updateCartTable();
  };

  // Selecionar o botão de limpar carrinho
  const clearCartButton = document.getElementById("clearCartButton");

  // Adicionar evento de clique para limpar o carrinho
  clearCartButton.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar o carrinho?")) {
      cart = [];
      saveCart();
      updateCartTable();
    }
  });

  // Inicializar a tabela do carrinho ao carregar a página
  updateCartTable();
});
