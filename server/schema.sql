
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel ENUM('admin','operador') DEFAULT 'operador',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo ENUM('pasto','curral','maternidade') DEFAULT 'pasto',
  area_ha DECIMAL(10,2),
  capacidade INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brinco VARCHAR(20) NOT NULL UNIQUE,
  sisbov VARCHAR(20),
  sexo ENUM('Fêmea','Macho') NOT NULL,
  raca VARCHAR(50) NOT NULL,
  data_nascimento DATE,
  origem ENUM('nascido_aqui','comprado') DEFAULT 'nascido_aqui',
  mae_id INT,
  pai_id INT,
  situacao ENUM('ativo','vendido','morto','quarentena','prenhe') DEFAULT 'ativo',
  lote_id INT,
  foto_url VARCHAR(500),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mae_id) REFERENCES animais(id) ON DELETE SET NULL,
  FOREIGN KEY (pai_id) REFERENCES animais(id) ON DELETE SET NULL,
  FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pesagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  data DATE NOT NULL,
  peso_kg DECIMAL(8,2) NOT NULL,
  local VARCHAR(100),
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eventos_sanitarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('vacina','vermifugo','exame') NOT NULL,
  aplicado_em ENUM('animal','lote') NOT NULL,
  animal_id INT,
  lote_id INT,
  produto VARCHAR(150) NOT NULL,
  dose VARCHAR(50),
  data DATE NOT NULL,
  data_proxima_dose DATE,
  responsavel VARCHAR(100),
  custo DECIMAL(10,2),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS coberturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  femea_id INT NOT NULL,
  metodo ENUM('IA','monta') NOT NULL,
  touro_info VARCHAR(150),
  data_cobertura DATE NOT NULL,
  data_prevista_parto DATE,
  status ENUM('aguardando','confirmada','parto_proximo','concluida') DEFAULT 'aguardando',
  data_parto DATE,
  bezerro_id INT,
  bezerro_situacao ENUM('vivo','natimorto'),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (femea_id) REFERENCES animais(id) ON DELETE CASCADE,
  FOREIGN KEY (bezerro_id) REFERENCES animais(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS movimentacoes_lote (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  lote_origem_id INT,
  lote_destino_id INT,
  motivo VARCHAR(150),
  data DATE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  FOREIGN KEY (lote_origem_id) REFERENCES lotes(id) ON DELETE SET NULL,
  FOREIGN KEY (lote_destino_id) REFERENCES lotes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  escopo ENUM('geral','lote','animal') DEFAULT 'geral',
  lote_id INT,
  animal_id INT,
  tipo ENUM('venda','compra','custo') NOT NULL,
  categoria VARCHAR(100),
  valor DECIMAL(12,2) NOT NULL,
  data DATE NOT NULL,
  recorrencia ENUM('unica','mensal') DEFAULT 'unica',
  descricao TEXT,
  lancamento_pai_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE SET NULL,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE SET NULL,
  FOREIGN KEY (lancamento_pai_id) REFERENCES lancamentos_financeiros(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('vacina','parto','pesagem','sincronizacao','lote_cheio') NOT NULL,
  urgencia ENUM('vencido','proximo','agendado') DEFAULT 'agendado',
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  data DATE,
  lido BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
