 // Variáveis globais
  let cart = [];
  let products = [];

  // Carregar produtos quando a página carregar
  document.addEventListener('DOMContentLoaded', function() {
      // Verificar se estamos na página PDV
      if (document.getElementById('products-list')) {
          loadProducts();
          setupCartEvents();
      }
  });

  // Carregar produtos da API
  function loadProducts() {
      // Mostrar indicador de carregamento
      document.getElementById('products-list').innerHTML = '<div class="loading">Carregando produtos...</div>';

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ > [Pasted text +145 lines]                                                                                                                        │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
                                                                                                               Context left until auto-compact: 27%



              }
          })
          .catch(error => {
              console.error('Erro ao carregar produtos:', error);
              document.getElementById('products-list').innerHTML = '<div class="error">Erro ao carregar produtos</div>';
          });
  }

  // Exibir produtos na interface
  function displayProducts(productsToDisplay) {
      const productsList = document.getElementById('products-list');
      productsList.innerHTML = '';

      if (productsToDisplay.length === 0) {
          productsList.innerHTML = '<div class="empty-products">Nenhum produto encontrado</div>';
          return;
      }

      productsToDisplay.forEach(product => {
          const productItem = document.createElement('div');
          productItem.className = 'product-item';
          productItem.innerHTML = `
              <div class="product-name">${product.nome}</div>
              <div class="product-price">R$ ${parseFloat(product.preco_venda).toFixed(2)}</div>
              <div class="product-stock">Estoque: ${product.estoque}</div>
          `;

          productItem.addEventListener('click', function() {
              addToCart(product);
          });

          productsList.appendChild(productItem);
      });
  }

  // Pesquisar produtos
  document.getElementById('search-btn')?.addEventListener('click', function() {
      const query = document.getElementById('product-search').value.trim();

      if (query === '') {
          loadProducts();
          return;
      }

      searchProducts(query)
          .then(response => {
              if (response.success && response.products) {
                  displayProducts(response.products);
              } else {
                  document.getElementById('products-list').innerHTML = '<div class="error">Erro na pesquisa</div>';
              }
          })
          .catch(error => {
              console.error('Erro na pesquisa:', error);
              document.getElementById('products-list').innerHTML = '<div class="error">Erro na pesquisa</div>';
          });
  });

  // Adicionar ao carrinho
  function addToCart(product) {
      // Verificar se o produto já está no carrinho
      const existingItemIndex = cart.findIndex(item => item.id === product.id);

      if (existingItemIndex >= 0) {
          // Incrementar quantidade
          if (cart[existingItemIndex].quantity < product.estoque) {
              cart[existingItemIndex].quantity++;
              cart[existingItemIndex].subtotal = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
          } else {
              alert('Estoque insuficiente!');
              return;
          }
      } else {
          // Adicionar novo item
          cart.push({
              id: product.id,
              name: product.nome,
              price: parseFloat(product.preco_venda),
              quantity: 1,
              subtotal: parseFloat(product.preco_venda)
          });
      }

      // Atualizar interface
      updateCartDisplay();
  }

  // Atualizar exibição do carrinho
  function updateCartDisplay() {
      const cartItemsDiv = document.getElementById('cart-items');
      const cartTotalSpan = document.getElementById('cart-total');
      const checkoutBtn = document.getElementById('checkout-btn');

      // Limpar carrinho atual
      cartItemsDiv.innerHTML = '';

      if (cart.length === 0) {
          cartItemsDiv.innerHTML = '<div class="empty-cart">Nenhum item adicionado</div>';
          cartTotalSpan.textContent = 'R$ 0,00';
          checkoutBtn.disabled = true;
          return;
      }

      // Calcular total
      let total = 0;

      // Adicionar itens
      cart.forEach((item, index) => {
          const cartItem = document.createElement('div');
          cartItem.className = 'cart-item';
          cartItem.innerHTML = `
              <div class="item-name">${item.name}</div>
              <div class="item-quantity">
                  <button class="qty-btn minus" data-index="${index}">-</button>
                  <span>${item.quantity}</span>
                  <button class="qty-btn plus" data-index="${index}">+</button>
              </div>
              <div class="item-price">R$ ${item.subtotal.toFixed(2)}</div>
              <button class="remove-btn" data-index="${index}">&times;</button>
          `;

          cartItemsDiv.appendChild(cartItem);
          total += item.subtotal;
      });

      // Atualizar total
      cartTotalSpan.textContent = `R$ ${total.toFixed(2)}`;

      // Habilitar botão de checkout
      checkoutBtn.disabled = false;

      // Adicionar event listeners
      setupCartButtons();
  }

  // Configurar eventos de botões do carrinho
  function setupCartButtons() {
      // Botões de diminuir quantidade
      document.querySelectorAll('.qty-btn.minus').forEach(btn => {
          btn.addEventListener('click', function() {
              const index = parseInt(this.getAttribute('data-index'));
              if (cart[index].quantity > 1) {
                  cart[index].quantity--;
                  cart[index].subtotal = cart[index].quantity * cart[index].price;
                  updateCartDisplay();
              }
          });
      });

      // Botões de aumentar quantidade
      document.querySelectorAll('.qty-btn.plus').forEach(btn => {
          btn.addEventListener('click', function() {
              const index = parseInt(this.getAttribute('data-index'));
              // Verificar estoque
              const product = products.find(p => p.id === cart[index].id);
              if (product && cart[index].quantity < product.estoque) {
                  cart[index].quantity++;
                  cart[index].subtotal = cart[index].quantity * cart[index].price;
                  updateCartDisplay();
              } else {
                  alert('Estoque insuficiente!');
              }
          });
      });

      // Botões de remover item
      document.querySelectorAll('.remove-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const index = parseInt(this.getAttribute('data-index'));
              cart.splice(index, 1);
              updateCartDisplay();
          });
      });
  }

  // Configurar eventos do carrinho
  function setupCartEvents() {
      // Botão limpar carrinho
      document.getElementById('clear-sale-btn')?.addEventListener('click', function() {
          if (cart.length > 0) {
              if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                  cart = [];
                  updateCartDisplay();
              }
          }
      });

      // Botão finalizar venda
      document.getElementById('checkout-btn')?.addEventListener('click', function() {
          if (cart.length > 0) {
              openPaymentModal();
          }
      });

      // Fechar modal
      document.querySelector('.close-modal')?.addEventListener('click', function() {
          document.getElementById('payment-modal').style.display = 'none';
      });

      // Cancelar pagamento
      document.getElementById('cancel-payment')?.addEventListener('click', function() {
          document.getElementById('payment-modal').style.display = 'none';
      });

      // Confirmar pagamento
      document.getElementById('confirm-payment')?.addEventListener('click', function() {
          finalizeSale();
      });
  }

  // Abrir modal de pagamento
  function openPaymentModal() {
      const modal = document.getElementById('payment-modal');
      const modalTotal = document.getElementById('modal-total');

      // Calcular total
      const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

      // Atualizar total no modal
      modalTotal.textContent = `R$ ${total.toFixed(2)}`;

      // Exibir modal
      modal.style.display = 'block';
  }

  // Finalizar venda
  function finalizeSale() {
      const paymentMethod = document.getElementById('payment-method').value;
      const customerId = document.getElementById('customer-id').value || null;

      // Criar objeto de venda
      const saleData = {
          payment_method: paymentMethod,
          customer_id: customerId,
          total: cart.reduce((sum, item) => sum + item.subtotal, 0),
          items: cart.map(item => ({
              product_id: item.id,
              quantity: item.quantity
          }))
      };

      // Processar venda
      processSale(saleData)
          .then(response => {
              if (response.success) {
                  alert('Venda finalizada com sucesso!');

                  // Limpar carrinho
                  cart = [];
                  updateCartDisplay();

                  // Fechar modal
                  document.getElementById('payment-modal').style.display = 'none';

                  // Recarregar produtos para atualizar estoque
                  loadProducts();
              } else {
                  alert('Erro ao finalizar venda: ' + response.message);
              }
          })
          .catch(error => {
              console.error('Erro ao finalizar venda:', error);
              alert('Erro ao processar a venda. Por favor, tente novamente.');
          });
  }
