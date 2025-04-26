  // URL base da API
  const API_URL = 'https://orion-pdv-api.onrender.com/api';

  // Função para login
  async function login(username, password) {
      try {
          const response = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password })
          });

          return await response.json();
      } catch (error) {
          console.error('Erro no login:', error);
          return {
              success: false,
              message: 'Erro ao conectar com o servidor'
          };
      }
  }

  // Função para obter produtos
  async function getProducts() {
      try {
          const token = localStorage.getItem('auth_token');

          const response = await fetch(`${API_URL}/products`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          return await response.json();
      } catch (error) {
          console.error('Erro ao buscar produtos:', error);
          return {
              success: false,
              message: 'Erro ao buscar produtos'
          };
      }
  }

  // Função para buscar produtos
  async function searchProducts(query) {
      try {
          const token = localStorage.getItem('auth_token');

          const response = await fetch(`${API_URL}/products/search?query=${encodeURIComponent(query)}`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          return await response.json();
      } catch (error) {
          console.error('Erro na busca:', error);
          return {
              success: false,
              message: 'Erro ao buscar produtos'
          };
      }
  }

  // Função para processar uma venda
  async function processSale(saleData) {
      try {
          const token = localStorage.getItem('auth_token');

          const response = await fetch(`${API_URL}/sales`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(saleData)
          });

          return await response.json();
      } catch (error) {
          console.error('Erro ao processar venda:', error);
          return {
              success: false,
              message: 'Erro ao processar venda'
          };
      }
  }

  // Verificar se o usuário está autenticado
  function isAuthenticated() {
      return localStorage.getItem('auth_token') !== null;
  }

  // Função para logout
  function logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
      window.location.href = 'login.html';
  }

  5. js/barcode-scanner.js

  // Configurações do scanner de código de barras
  const barcodeConfig = {
      inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#interactive"),
          constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: "environment"
          },
      },
      locator: {
          patchSize: "medium",
          halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency || 2,
      frequency: 10,
      decoder: {
          readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader"
          ]
      },
      locate: true
  };

  // Inicializa o scanner
  function initBarcodeScanner() {
      Quagga.init(barcodeConfig, function(err) {
          if (err) {
              console.error("Erro ao iniciar o scanner:", err);
              alert("Não foi possível acessar a câmera. Verifique as permissões.");
              return;
          }
          Quagga.start();
      });

      // Evento para detectar código de barras
      Quagga.onDetected(function(result) {
          const code = result.codeResult.code;
          console.log("Código de barras detectado:", code);

          // Tocar som de beep
          const beep = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2Ec
  Bj+a2/LDciUFLHOw8uuwRwURRoXO8tiJKwpBdPL9/7JBBiBYw/f7/scqFglHpvv/9NJ6HQMvab39/+2dKAsEMn3g/v/zsz4LCDWH7P7/8J8kDRE+lvDr9tORLRohWLDo3taqTSU1WZbayr
  6MVFxleqCkmo2NgY+apZ+JbF1qiLTLvZFUNUyR1ezNgjgZMHnN+OF8FQssjenw56cuFyF8y9rRpE04RHm74dCiWDhEa6/Wy7KETjxQgMbRu6BIETR3ttfRwJJJLlCe0vnoyHwdHz+r4vj5
  w1kMFzOa2PXvtE0PO47n/P/LXBUQQncQAFUQAVYRAFUQAFYRAAEAAwABAAMAAwABAAEAAwABAAEAAQADAAEAAwABAAEAAQABAAEAAQABAAEAAQABAAEAAQBkYXRhPAUAAPLz9vn3/P3/AQ
  IEBgcJCgsMDQ0ODQ0MDAsKCQgHBgUFBAMCAQEAAAD//v38+/r5+Pf29fTz8vHx8O/u7e3s6+vq6eno6Ofn5+fn5+fo6Onp6uvs7e7v8PHy8/T19vf4+fr7/P3+//8AAQIDBAUGBggJCQoL
  DAwNDQ4ODg4ODQ0MDAsKCgkIBwYFBAMCAQD///79/Pv6+fj39vX08/Lx8O/u7e3s6+rq6eno5+fm5ubl5eXl5ebm5ufo6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7///8BAgMEBQYHCAkKCg
  sLDA0NDg4ODg4ODQ0MCwoKCQgHBgUEAwIBAP///v38+/r5+Pf29fTz8vHw7+7t7Ovr6uno6Ofn5ubm5eXl5eXl5ebm5+fo6Onq6+zt7u/w8fLz9PX29/j5+vv8/f3+/wABAgMEBQYHCAkJ
  CgoLDAwNDQ0ODg4ODQwMCwsKCQgIBwYFBAMCAQEAAP/+/fz7+vn49/b19PPy8fDv7u3s7Ovq6eno5+fm5uXl5eXk5OXl5ebm5+jn6Onq6+zt7u/w8fLz9PX29/j5+vv7/P3+//8AAQIDBA
  UGBwgICQoKCwsMDA0NDQ0NDQ0MDAsLCgkJCAgHBgUEAwMCAQD//v79/Pv6+fj39vX08/Ly8fDv7u3t7Ovq6eno5+fm5uXl5OTk5OTk5eXl5ufn6Ojp6uvs7e7v8PHx8vP09fb3+Pn6+/v8
  /f7+/wABAgMDBAUGBwcICQoKCwsMDAwNDQ0NDQ0MDAwLCwoKCQgIBwcGBQQEAwIBAQD//v79/Pv6+fj39vb18/Py8fDv7u7t7Ovr6uno6Ofm5uXl5OTj4+Pk5OTl5ebm5+fo6erq6+zt7e
  7v8PHx8vP09fb2+Pn5+vv8/f3+/v8AAQECAwQEBQYHBwgJCQoKCwsMDAwMDQ0NDAwMDAsLCgoJCQgHBwYFBAQDAgEBAP//CF9JUyAnVU5BTUUgLWEn");
          beep.play();

          // Fechar scanner
          closeScanner();

          // Buscar produto pelo código de barras
          document.getElementById('product-search').value = code;
          searchProductByBarcode(code);
      });
  }

  // Buscar produto pelo código de barras
  function searchProductByBarcode(barcode) {
      // Mostrar feedback visual
      const searchInput = document.getElementById('product-search');
      searchInput.classList.add('barcode-scanned');

      // Usar a API para buscar o produto
      searchProducts(barcode)
          .then(response => {
              if (response.success && response.products && response.products.length > 0) {
                  // Pegar o primeiro produto que corresponde ao código de barras
                  const product = response.products.find(p => p.codigo_barras === barcode) || response.products[0];

                  // Adicionar o produto ao carrinho automaticamente
                  addToCart(product);

                  // Limpar a busca depois de um momento
                  setTimeout(() => {
                      searchInput.value = '';
                      searchInput.classList.remove('barcode-scanned');
                  }, 1500);
              } else {
                  // Produto não encontrado
                  searchInput.classList.add('barcode-not-found');
                  alert('Produto não encontrado para o código: ' + barcode);

                  setTimeout(() => {
                      searchInput.classList.remove('barcode-scanned');
                      searchInput.classList.remove('barcode-not-found');
                  }, 1500);
              }
          })
          .catch(error => {
              console.error('Erro ao buscar produto:', error);
              searchInput.classList.remove('barcode-scanned');
          });
  }

  // Abrir scanner
  function openScanner() {
      const scannerContainer = document.getElementById('scanner-container');
      scannerContainer.style.display = 'block';
      initBarcodeScanner();
  }

  // Fechar scanner
  function closeScanner() {
      Quagga.stop();
      const scannerContainer = document.getElementById('scanner-container');
      scannerContainer.style.display = 'none';
  }

  // Inicializar quando o documento estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
      // Botão para abrir scanner
      const scannerBtn = document.getElementById('barcode-scanner-btn');
      if (scannerBtn) {
          scannerBtn.addEventListener('click', openScanner);
      }

      // Botão para fechar scanner
      const closeBtn = document.getElementById('close-scanner');
      if (closeBtn) {
          closeBtn.addEventListener('click', closeScanner);
      }

      // Também podemos detectar códigos de barras do input de busca
      const searchInput = document.getElementById('product-search');
      if (searchInput) {
          searchInput.addEventListener('keypress', function(e) {
              // Se pressionar Enter e o valor tiver pelo menos 8 caracteres (possível código de barras)
              if (e.key === 'Enter' && this.value.length >= 8) {
                  searchProductByBarcode(this.value);
              }
          });
      }
  });
