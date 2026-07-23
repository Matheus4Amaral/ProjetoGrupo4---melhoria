# Avalia.ai

O Avalia.ai é uma aplicação web desenvolvida para centralizar e gerenciar processos de avaliação de desempenho entre colaboradores dentro de uma organização.

A plataforma permite que gestores organizem ciclos de avaliação, definam equipes, acompanhem o progresso das avaliações e consolidem os resultados em um único ambiente.

## Principais funcionalidades

- Autenticação de usuários;
- Gerenciamento de Times;
- Cadastro e gerenciamento de colaboradores;
- Gerenciamento de ciclos de avaliação;
- Definição de formulários e critérios de avaliação;
- Envio e preenchimento de avaliações entre colaboradores;
- Consolidação e visualização dos resultados das avaliações;

## Stack

- React;
- Vite;
- Tailwind CSS;
- Supabase;
- React Hook Form;
- Zod.

## Como executar

### 1. Pré-requisitos

- Node.js 20 ou superior;
- npm.

### 2. Baixe o projeto

Clone o repositório.

```bash
git clone <URL_DO_REPOSITORIO>
cd Projeto_Feedback
```

### 3. Adicione as configurações

Crie o arquivo `.env.local`.

O arquivo terá as configurações de acesso ao Supabase:

```env
VITE_SUPABASE_URL=URL_FORNECIDA_PELA_EQUIPE
VITE_SUPABASE_PUBLISHABLE_KEY=CHAVE_FORNECIDA_PELA_EQUIPE
```

Não altere, publique ou compartilhe esse arquivo.

### 4. Instale as dependências

```bash
npm install
```

### 5. Inicie a aplicação

```bash
npm run dev
```

O terminal mostrará o endereço local da aplicação, normalmente:

```text
http://localhost:5173
```
