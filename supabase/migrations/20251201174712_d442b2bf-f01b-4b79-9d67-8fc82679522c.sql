-- ========================================
-- TABELA DE PERFIS (vinculada ao auth.users)
-- ========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    crp VARCHAR(50),
    avatar_url TEXT,
    especializacao VARCHAR(150),
    dark_mode BOOLEAN DEFAULT FALSE,
    notificacoes_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
        NEW.email
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- TABELA DE CLIENTES
-- ========================================
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    tipo_sessao VARCHAR(20) NOT NULL CHECK (tipo_sessao IN ('Individual', 'Casal', 'Família')),
    valor_sessao DECIMAL(10,2) NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'Ativo' CHECK (status_pagamento IN ('Ativo', 'Inativo')),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
    ON public.clientes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
    ON public.clientes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
    ON public.clientes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
    ON public.clientes FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- TABELA DE SESSÕES
-- ========================================
CREATE TABLE public.sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    data_sessao TIMESTAMPTZ NOT NULL,
    duracao_minutos INT NOT NULL DEFAULT 50,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada', 'Cancelada', 'Faltou')),
    pagamento_status VARCHAR(20) DEFAULT 'Pendente' CHECK (pagamento_status IN ('Pendente', 'Pago', 'Atrasado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
    ON public.sessoes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
    ON public.sessoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON public.sessoes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON public.sessoes FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- TABELA DE TRANSAÇÕES
-- ========================================
CREATE TABLE public.transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_transacao DATE NOT NULL,
    sessao_id UUID REFERENCES public.sessoes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON public.transacoes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
    ON public.transacoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON public.transacoes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON public.transacoes FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- TABELA DE METAS
-- ========================================
CREATE TABLE public.metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo_meta VARCHAR(50) NOT NULL CHECK (tipo_meta IN ('Receita Mensal', 'Receita Anual', 'Sessões Mensais')),
    valor_alvo DECIMAL(10,2),
    sessoes_alvo INT,
    mes INT CHECK (mes BETWEEN 1 AND 12),
    ano INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
    ON public.metas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
    ON public.metas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.metas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.metas FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_sessoes_user_id ON public.sessoes(user_id);
CREATE INDEX idx_sessoes_cliente_id ON public.sessoes(cliente_id);
CREATE INDEX idx_sessoes_data ON public.sessoes(data_sessao);
CREATE INDEX idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX idx_transacoes_data ON public.transacoes(data_transacao);
CREATE INDEX idx_metas_user_id ON public.metas(user_id);