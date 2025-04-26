
  // URL base da API (desabilitada para simulação)
  // const API_URL = 'https://orion-pdv-api.onrender.com/api';

  // Dados simulados
  const mockProducts = [
    {
      id: '1',
      nome: 'Arroz 5kg',
      codigo_barras: '7891234567890',
      preco_venda: 22.50,
      estoque: 50
    },
    {
      id: '2',
      nome: 'Feijão 1kg',
      codigo_barras: '7891234567891',
      preco_venda: 8.90,
      estoque: 30
    },
    {
      id: '3',
      nome: 'Óleo de Soja 900ml',
      codigo_barras: '7891234567892',
      preco_venda: 7.50,
      estoque: 40
    }
  ];

  // Função para login (mock)
  async function login(username, password) {
    try {
      // Simular login bem-sucedido com qualquer credencial
      return {
        success: true,
        token: 'mock-token-123',
        user: {
          id: '1',
          name: username,
          role: 'admin'
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro ao conectar com o servidor'
      };
    }
  }

  // Demais funções usando os dados mock...
  // (implemente as outras funções de forma similar)
