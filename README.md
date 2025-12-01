# Psi Finance - Sistema de Gerenciamento Financeiro

## Descrição

Psi Finance é uma aplicação web completa para gerenciamento financeiro pessoal e empresarial. A plataforma oferece ferramentas intuitivas para controle de receitas, despesas, categorização de transações e relatórios analíticos para auxiliar na tomada de decisões financeiras.

## Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript server-side
- **Express.js** - Framework web para Node.js
- **TypeScript** - Superset JavaScript com tipagem estática
- **Prisma ORM** - ORM para banco de dados com type-safety
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via JSON Web Tokens
- **Bcrypt** - Criptografia de senhas
- **Zod** - Validação de schemas e dados
- **Cors** - Middleware para habilitar CORS

### Frontend
- **React.js** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server rápido
- **React Router DOM** - Roteamento para aplicação SPA
- **Axios** - Cliente HTTP para requisições à API
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação integrada com React Hook Form
- **Context API** - Gerenciamento de estado global
- **Tailwind CSS** - Framework CSS utilitário
- **React Icons** - Biblioteca de ícones

### Desenvolvimento e Qualidade
- **ESLint** - Linter para padronização de código
- **Prettier** - Formatador de código automático
- **Git** - Controle de versão

## Funcionalidades

### Autenticação e Segurança
- Registro e login de usuários
- Autenticação JWT com refresh tokens
- Proteção de rotas
- Criptografia de senhas

### Gerenciamento Financeiro
- Cadastro de transações (receitas e despesas)
- Categorização de transações
- Filtros por data, categoria e tipo
- Dashboard com métricas financeiras
- Gráficos e visualizações de dados
- Histórico completo de transações

### Recursos Avançados
- Relatórios personalizados
- Exportação de dados
- Metas financeiras
- Orçamento mensal
- Notificações e lembretes

## Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn
- Git

## Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/GabrielSantiago-estudo/psi-finance-complete.git
cd psi-finance-complete
```

### 2. Configurar Ambiente

#### Backend
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/psi_finance"
JWT_SECRET="sua_chave_secreta_jwt_aqui"
PORT=3001
NODE_ENV="development"
```

#### Frontend
```bash
cd ../frontend
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Psi Finance
```

### 3. Instalar Dependências

#### Backend
```bash
cd backend
npm install
# ou
yarn install
```

#### Frontend
```bash
cd frontend
npm install
# ou
yarn install
```

### 4. Configurar Banco de Dados

```bash
# Navegue até a pasta backend
cd backend

# Criar o banco de dados (certifique-se que o PostgreSQL está rodando)
npx prisma db push
# ou
yarn prisma db push

# Opcional: Popular com dados iniciais
npx prisma db seed
```

### 5. Executar a Aplicação

#### Opção A: Separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# ou
yarn dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# ou
yarn dev
```

#### Opção B: Usando Scripts Combinados

Execute na raiz do projeto (se disponível):
```bash
npm run start:dev
# ou
yarn start:dev
```

### 6. Acessar a Aplicação

- Frontend: http://localhost:5173 (ou porta configurada)
- Backend API: http://localhost:3001
- Prisma Studio (visualização do banco): http://localhost:5555

## Scripts Disponíveis

### Backend
```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm run build        # Compila TypeScript
npm start           # Inicia servidor em produção
npm run lint        # Executa ESLint
npm run lint:fix    # Corrige problemas de lint
npx prisma studio   # Abre interface do Prisma Studio
```

### Frontend
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm run preview      # Visualiza build de produção localmente
npm run lint        # Executa ESLint
npm run lint:fix    # Corrige problemas de lint
```

## Estrutura do Projeto

```
psi-finance-complete/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Controladores da API
│   │   ├── middleware/    # Middlewares (auth, validation)
│   │   ├── models/        # Modelos de dados
│   │   ├── routes/        # Definição de rotas
│   │   ├── services/      # Lógica de negócio
│   │   ├── utils/         # Funções utilitárias
│   │   └── app.ts         # Configuração do Express
│   ├── prisma/
│   │   └── schema.prisma  # Schema do banco de dados
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (autenticação, tema)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços API
│   │   ├── styles/        # Estilos globais
│   │   ├── types/         # Tipos TypeScript
│   │   ├── utils/         # Funções utilitárias
│   │   └── App.tsx        # Componente principal
│   └── package.json
└── README.md
```

## API Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Transações
- `GET /api/transactions` - Listar transações
- `GET /api/transactions/:id` - Obter transação específica
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Excluir transação

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria

### Dashboard
- `GET /api/dashboard/summary` - Resumo financeiro
- `GET /api/dashboard/charts` - Dados para gráficos

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato através das informações do perfil do mantenedor.

## Status do Projeto

🚧 Em desenvolvimento ativo. Novas funcionalidades serão adicionadas regularmente.

---
Desenvolvido por [Gabriel Santiago](https://github.com/GabrielSantiago-estudo)
