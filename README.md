# Gestor Monetário

Uma aplicação web moderna de gestão financeira pessoal, desenvolvida como Progressive Web App (PWA). O **Gestor Monetário** permite aos utilizadores registar, categorizar e analisar as suas receitas e despesas de forma segura e intuitiva, a partir de qualquer dispositivo.

## Sobre o Projeto

O **Gestor Monetário** foi desenhado com o objetivo de simplificar o controlo das finanças pessoais. Com uma interface limpa e responsiva, a aplicação permite acompanhar o fluxo de caixa diário, mensal e anual. Sendo uma PWA, pode ser instalada diretamente em dispositivos móveis ou desktop, oferecendo uma experiência semelhante a uma aplicação nativa.

### Principais Funcionalidades:
* **Dashboard Interativo:** Visão geral do saldo atual, total de receitas e total de despesas.
* **Gestão de Transações:** Adição, edição e remoção rápida de movimentos financeiros (entradas e saídas).
* **Autenticação Segura:** Sistema de login e registo protegido, garantindo a privacidade dos dados de cada utilizador.
* **Progressive Web App (PWA):** Instalável no telemóvel/computador e otimizada para carregamento rápido e funcionamento offline básico.
* **Filtros e Categorias:** (Estrutura preparada para organização avançada de gastos).

## Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas de desenvolvimento web:

* **Frontend:** React.js construído com Vite (para máxima performance de desenvolvimento).
* **Backend as a Service (BaaS):** Supabase (Gestão de Base de Dados PostgreSQL e Autenticação RLS).
* **Arquitetura PWA:** Configuração de *Service Workers* para cache e suporte offline.
* **Estilização:** CSS nativo moderno e responsivo.

## Estrutura do Repositório

A arquitetura do projeto está organizada de forma modular para facilitar a manutenção e escalabilidade:

```text
GestorMonetario/
├── gestor-monetario/
│   ├── public/                 # Assets públicos, ícones e manifesto PWA
│   ├── src/                    # Código fonte da aplicação
│   │   ├── assets/             # Imagens e recursos visuais
│   │   ├── components/         # Componentes React reutilizáveis (Header, Login, Modais, Sidebar)
│   │   ├── hooks/              # Custom Hooks com a lógica de negócio (ex: useFinance.js)
│   │   ├── services/           # Integração com APIs externas (ex: supabase.js)
│   │   ├── App.jsx             # Componente raiz da aplicação
│   │   └── main.jsx            # Ponto de entrada do React
│   ├── index.html              # Template principal HTML
│   ├── package.json            # Dependências e scripts do projeto
│   └── vite.config.js          # Configuração do Vite e plugins PWA
```

## Como Executar Localmente

Siga os passos abaixo para correr o projeto no seu ambiente de desenvolvimento local:

### 1. Clonar o repositório e instalar dependências
Navegue até à pasta do projeto e instale os pacotes Node necessários:
```bash
cd gestor-monetario
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um ficheiro `.env` na raiz da pasta `gestor-monetario` (este ficheiro está protegido pelo `.gitignore`). Adicione as suas chaves do Supabase:
```env
VITE_SUPABASE_URL=seu_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```
*(Nota: As credenciais de produção devem ser configuradas apenas no painel da plataforma de hosting, como a Vercel).*

### 3. Executar o Servidor de Desenvolvimento
Inicie a aplicação:
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

---
*Desenvolvido com foco na organização financeira, segurança de dados e experiência de utilizador fluida.*
