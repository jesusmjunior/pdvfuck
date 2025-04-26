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
