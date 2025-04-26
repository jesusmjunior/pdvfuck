from flask import Flask, request, jsonify
  import os
  import psycopg2
  import psycopg2.extras
  import jwt
  import datetime
  from functools import wraps
  from flask_cors import CORS

  app = Flask(__name__)
  CORS(app)

  # Configurações
  app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'orion_pdv_secret')
  app.config['DB_HOST'] = os.environ.get('DB_HOST', '34.95.140.152')
  app.config['DB_USER'] = os.environ.get('DB_USER', 'orion_app')
  app.config['DB_PASSWORD'] = os.environ.get('DB_PASSWORD', '123456')
  app.config['DB_NAME'] = os.environ.get('DB_NAME', 'orion_pdv')
  app.config['DB_PORT'] = os.environ.get('DB_PORT', '5432')

  # Conexão com o PostgreSQL
  def get_db_connection():
      conn = psycopg2.connect(
          host=app.config['DB_HOST'],
          database=app.config['DB_NAME'],
          user=app.config['DB_USER'],
          password=app.config['DB_PASSWORD'],
          port=app.config['DB_PORT']
      )
      conn.autocommit = True
      return conn

  # Middleware para verificar token JWT
  def token_required(f):
      @wraps(f)
      def decorated(*args, **kwargs):
          token = None

          if 'Authorization' in request.headers:
              token = request.headers['Authorization'].split(" ")[1]

          if not token:
              return jsonify({'success': False, 'message': 'Token ausente'}), 401

          try:
              data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
              current_user = data['user_id']
          except:
              return jsonify({'success': False, 'message': 'Token inválido'}), 401

          return f(current_user, *args, **kwargs)

      return decorated

  # Rota de autenticação
  @app.route('/api/auth/login', methods=['POST'])
  def login():
      auth = request.json

      if not auth or not auth.get('username') or not auth.get('password'):
          return jsonify({'success': False, 'message': 'Dados de login incompletos'}), 401

      try:
          conn = get_db_connection()
          cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

          cur.execute('SELECT * FROM usuarios WHERE username = %s', (auth.get('username'),))
          user = cur.fetchone()

          if not user:
              return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 401

          # Em produção, use compare hash em vez de comparação direta
          if user['password'] == auth.get('password'):
              token = jwt.encode({
                  'user_id': user['id'],
                  'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
              }, app.config['SECRET_KEY'])

              return jsonify({
                  'success': True,
                  'token': token,
                  'user': {
                      'id': user['id'],
                      'name': user['nome'],
                      'role': user['role']
                  }
              })

          return jsonify({'success': False, 'message': 'Senha incorreta'}), 401

      except Exception as e:
          print(f"Erro de login: {e}")
          return jsonify({'success': False, 'message': 'Erro no servidor'}), 500
      finally:
          if 'cur' in locals():
              cur.close()
          if 'conn' in locals():
              conn.close()

  # Rota para buscar produtos
  @app.route('/api/products', methods=['GET'])
  @token_required
  def get_products(current_user):
      try:
          conn = get_db_connection()
          cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

          cur.execute('SELECT * FROM produtos ORDER BY nome')
          products = cur.fetchall()

          return jsonify({
              'success': True,
              'products': products
          })

      except Exception as e:
          print(f"Erro ao buscar produtos: {e}")
          return jsonify({'success': False, 'message': 'Erro ao buscar produtos'}), 500
      finally:
          if 'cur' in locals():
              cur.close()
          if 'conn' in locals():
              conn.close()

  # Rota para buscar produtos com pesquisa
  @app.route('/api/products/search', methods=['GET'])
  @token_required
  def search_products(current_user):
      query = request.args.get('query', '')

      try:
          conn = get_db_connection()
          cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

          search_pattern = f"%{query}%"
          cur.execute(
              'SELECT * FROM produtos WHERE nome ILIKE %s OR codigo_barras ILIKE %s ORDER BY nome',
              (search_pattern, search_pattern)
          )
          products = cur.fetchall()

          return jsonify({
              'success': True,
              'products': products
          })

      except Exception as e:
          print(f"Erro na busca de produtos: {e}")
          return jsonify({'success': False, 'message': 'Erro na busca de produtos'}), 500
      finally:
          if 'cur' in locals():
              cur.close()
          if 'conn' in locals():
              conn.close()

  # Rota para processar uma venda
  @app.route('/api/sales', methods=['POST'])
  @token_required
  def process_sale(current_user):
      data = request.json

      if not data or not data.get('items'):
          return jsonify({'success': False, 'message': 'Dados incompletos'}), 400

      try:
          conn = get_db_connection()
          cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

          # Inicia uma transação
          conn.autocommit = False

          # Cria a venda
          cur.execute(
              """
              INSERT INTO vendas (data, usuario, cliente_id, status, forma_pagamento, valor_total)
              VALUES (NOW(), %s, %s, 'FINALIZADA', %s, %s)
              RETURNING id
              """,
              (
                  current_user,
                  data.get('customer_id'),
                  data.get('payment_method', 'DINHEIRO'),
                  data.get('total', 0)
              )
          )

          sale_id = cur.fetchone()['id']

          # Adiciona os itens
          for item in data.get('items', []):
              # Verifica estoque
              cur.execute(
                  "SELECT estoque, preco_venda FROM produtos WHERE id = %s",
                  (item['product_id'],)
              )
              product = cur.fetchone()

              if not product:
                  conn.rollback()
                  return jsonify({'success': False, 'message': f'Produto ID {item["product_id"]} não encontrado'}), 400

              if product['estoque'] < item['quantity']:
                  conn.rollback()
                  return jsonify({'success': False, 'message': f'Estoque insuficiente para o produto ID {item["product_id"]}'}), 400

              # Adiciona o item à venda
              cur.execute(
                  """
                  INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
                  VALUES (%s, %s, %s, %s, %s)
                  """,
                  (
                      sale_id,
                      item['product_id'],
                      item['quantity'],
                      product['preco_venda'],
                      product['preco_venda'] * item['quantity']
                  )
              )

              # Atualiza estoque
              cur.execute(
                  "UPDATE produtos SET estoque = estoque - %s WHERE id = %s",
                  (item['quantity'], item['product_id'])
              )

              # Registra movimentação
              cur.execute(
                  """
                  INSERT INTO movimentacoes (produto_id, quantidade, tipo, data)
                  VALUES (%s, %s, 'VENDA', NOW())
                  """,
                  (item['product_id'], -item['quantity'])
              )

          # Commit da transação
          conn.commit()

          return jsonify({
              'success': True,
              'sale_id': sale_id,
              'message': 'Venda processada com sucesso'
          })

      except Exception as e:
          if 'conn' in locals():
              conn.rollback()
          print(f"Erro ao processar venda: {e}")
          return jsonify({'success': False, 'message': 'Erro ao processar venda'}), 500
      finally:
          if 'conn' in locals():
              conn.autocommit = True

          if 'cur' in locals():
              cur.close()
          if 'conn' in locals():
              conn.close()

  # Rota para verificar status
  @app.route('/api/status', methods=['GET'])
  def status():
      try:
          conn = get_db_connection()
          cur = conn.cursor()
          cur.execute('SELECT 1')

          return jsonify({
              'success': True,
              'status': 'online',
              'database': 'connected',
              'timestamp': datetime.datetime.now().isoformat()
          })
      except Exception as e:
          return jsonify({
              'success': False,
              'status': 'online',
              'database': 'error',
              'error': str(e),
              'timestamp': datetime.datetime.now().isoformat()
          }), 500
      finally:
          if 'cur' in locals():
              cur.close()
          if 'conn' in locals():
              conn.close()

  if __name__ == '__main__':
      port = int(os.environ.get('PORT', 8080))
      app.run(host='0.0.0.0', port=port)
