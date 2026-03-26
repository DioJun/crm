#!/bin/bash
# SQL Schema para Supabase - CRM Clínica de Estética
# Execute esta query no Supabase SQL Editor

-- Criar tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  data_nascimento DATE,
  historico_clinico TEXT DEFAULT '',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de Procedimentos
CREATE TABLE IF NOT EXISTS procedimentos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT DEFAULT '',
  preco DECIMAL(10, 2) NOT NULL,
  duracao INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  procedimento_id BIGINT NOT NULL REFERENCES procedimentos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'agendado',
  observacoes TEXT DEFAULT '',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_procedimento ON agendamentos(procedimento_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Habilitar RLS (Row Level Security) - apenas quando tiver autenticação
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Inserir dados de exemplo
INSERT INTO clientes (nome, whatsapp, data_nascimento, historico_clinico) VALUES
('Ana Silva', '11987654321', '1995-03-15', 'Alérgica a ácido hialurônico'),
('Carla Santos', '11988765432', '1988-07-22', 'Pele sensível, reações a peeling');

INSERT INTO procedimentos (nome, descricao, preco, duracao) VALUES
('Limpeza de Pele', 'Limpeza facial profunda com higienização', 150.00, 60),
('Peeling Químico', 'Peeling com ácido glicólico 30%', 250.00, 45),
('Microagulhamento', 'Tratamento com dermaroller 1.5mm', 300.00, 90);

INSERT INTO agendamentos (cliente_id, procedimento_id, data, hora, status) VALUES
(1, 1, '2024-03-28', '10:00', 'agendado'),
(2, 2, '2024-03-29', '14:00', 'agendado');

-- Habilitar realtime para as tabelas (permite atualizações em tempo real)
-- Vá em Supabase Dashboard → Realtime → Source tables
-- Ative os checkboxes para: clientes, procedimentos, agendamentos
