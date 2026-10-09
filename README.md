# 🚀 SocialPublisher (Node.js + MySQL)

Aplicativo moderno e direto ao ponto para **Instagram**, **Facebook** e **YouTube**, com suporte a **postagem direta**, **postagem agendada** e **galeria filtrada por plataforma**.

---

## 📋 Funcionalidades

- **3 Plataformas Unificadas**: Instagram, Facebook e YouTube em uma única interface.
- **Postagem Direta**: Envio imediato para qualquer combinação de redes com 1 clique.
- **Postagem Agendada**: Escolha o dia e a hora exatos; o scheduler interno em Node.js (`node-cron`) dispara automaticamente.
- **Upload de Fotos e Vídeos**: Suporte a arrastar e soltar (drag & drop), com validação e preview instantâneo.
- **Live Preview em Tempo Real**: Veja como sua publicação vai aparecer no feed do Instagram, na timeline do Facebook e no player do YouTube antes de postar.
- **Galeria com Filtro por Rede Social**:
  - Filtro dedicado: **Todas**, **Instagram**, **Facebook**, **YouTube**.
  - Filtro por status: **Publicadas**, **Agendadas**, **Com Erro**.
  - Ações rápidas: Visualizar mídia completa, botão "Postar Já" (para adiantar agendamentos) e exclusão.
- **Banco de Dados MySQL com Resiliência Automática**:
  - Conecta ao MySQL e cria automaticamente o banco `social_publisher_db` e as tabelas necessárias.
  - Caso o MySQL ainda não esteja ativo na sua máquina, o aplicativo funciona de forma imediata com armazenamento local seguro e tenta reconectar ao MySQL a cada 15 segundos sem travar.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express, MySQL2 (`mysql2/promise`), Multer, Node-Cron, Axios, Dotenv, CORS.
- **Banco de Dados**: MySQL (script de criação em `database/schema.sql`).
- **Frontend**: HTML5, CSS3 moderno (Dark UI clean, responsivo, sem dependências pesadas de build), JavaScript Vanilla, FontAwesome.

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js instalado (v18+)
- MySQL instalado e rodando (XAMPP, WampServer, Docker ou serviço MySQL nativo).

### 2. Configuração do `.env`
No arquivo `.env` localizado na raiz do projeto:

```env
PORT=3000

# Conexão MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=social_publisher_db

# Simulação das APIs (true para testar sem precisar cadastrar apps de desenvolvedor)
SIMULATE_API_PUBLISH=true

# Credenciais Meta Graph API (Instagram & Facebook - Opcional)
META_ACCESS_TOKEN=
FB_PAGE_ID=
IG_USER_ID=

# Credenciais Google / YouTube API (Opcional)
YOUTUBE_API_KEY=
YOUTUBE_ACCESS_TOKEN=
```

### 3. Iniciar o Aplicativo
No terminal dentro da pasta `social-publisher`:

```bash
npm start
```

Ou diretamente:
```bash
node server.js
```

### 4. Acessar no Navegador
Abra:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ Estrutura do Banco de Dados (`database/schema.sql`)

- **`posts`**: Armazena título, legenda, caminho do arquivo de mídia, tipo (`image`/`video`), status (`published`, `scheduled`, `failed`), datas de agendamento e publicação.
- **`post_platforms`**: Relacionamento 1:N que registra em quais redes o post foi publicado ou agendado (Instagram, Facebook, YouTube) e IDs retornados pelas APIs.
