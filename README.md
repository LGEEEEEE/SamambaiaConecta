# 📍 Samambaia Conecta – Radar Comunitário

Plataforma web colaborativa desenvolvida como Projeto de Extensão Universitária da **Universidade Católica de Brasília (UCB)** para mapear demandas de infraestrutura urbana e divulgar eventos comunitários na Região Administrativa de **Samambaia (DF)**, com piloto implantado em parceria com a **GS Locações e Festas (QR 406, Samambaia Norte)**.

---

## 🎥 Demonstração e Acesso

* **Vídeo Demonstrativo:** [Assista à apresentação do sistema](COLE_AQUI_O_LINK_DO_SEU_VIDEO)
* **Aplicação em Produção (Render):** [Acessar Samambaia Conecta](COLE_AQUI_O_LINK_DO_RENDER)

---

## 🎯 Objetivo do Projeto

Facilitar a comunicação e a visibilidade das demandas locais entre moradores, comerciantes e visitantes das quadras de Samambaia, permitindo o registro georreferenciado de problemas urbanos (buracos, iluminação pública, descarte irregular, saneamento) e a divulgação de ações comunitárias em tempo real, com acesso rápido via QR Code.

---

## ✨ Funcionalidades Principais

* **Mapa Interativo Georreferenciado:** Visualização com alternância entre camada **Satélite** e **Mapa**, marcadores coloridos por status (`Aberto`, `Resolvido`, `Evento`) e pino arrastável para ajuste fino de localização.
* **Geolocalização Inteligente (GPS + ViaCEP):**
  * Captura automática de coordenadas via GPS do navegador.
  * Consulta oficial na API **ViaCEP** nos dois sentidos (`CEP → Quadra/Conjunto` e `Quadra → CEP`) adaptada ao endereçamento do Distrito Federal.
* **Registro de Ocorrências Urbanas:** Cadastro categorizado com suporte a **denúncia anônima**, upload com compressão automática de imagens no navegador, confirmação comunitária (*apoios*) e atualização de status para resolvido.
* **Agenda Comunitária:** Divulgação e busca de eventos locais filtrados por quadra, CEP ou título.
* **Pesquisa de Satisfação Nativa:** Formulário integrado diretamente à interface e conectado ao Google Forms/Sheets para coleta de feedback dos moradores.
* **Onboarding para Novos Usuários:** Modal de boas-vindas exibido automaticamente no primeiro acesso (controlado via `localStorage`).

---

## 🛠️ Stack Tecnológica

### Frontend
* **React + Vite**
* **Bootstrap 5** (Tema escuro responsivo *mobile-first*)
* **Leaflet / React-Leaflet** (Mapas interativos)
* **Lucide React** (Ícones)
* **ViaCEP & Nominatim API** (Geocodificação e endereçamento)

### Backend & Banco de Dados
* **Node.js + Express**
* **Prisma ORM**
* **PostgreSQL (Supabase)**
* **Deploy:** Render

---

## 🗂️ Estrutura do Projeto

```text
SamambaiaConecta/
├── backend/
│   ├── prisma/              # Schema e migrações do banco PostgreSQL
│   └── src/                 # Rotas da API REST (ocorrências e eventos)
├── frontend/
│   ├── public/              # Ativos estáticos e identidade visual
│   └── src/
│       ├── components/      # MapaRegiao, FormularioAvaliacao, ModalBoasVindas
│       ├── utils/           # geoCepService (ViaCEP/GPS) e imageCompressor
│       └── App.jsx          # Interface principal e gerenciamento de estado
└── package.json
🚀 Como Executar Localmente
1. Clonar o repositório
Bash
git clone [https://github.com/LGEEEEEE/SamambaiaConecta.git](https://github.com/LGEEEEEE/SamambaiaConecta.git)
cd SamambaiaConecta
2. Configurar e rodar o Backend
Bash
cd backend
npm install
Crie um arquivo .env na pasta backend com as credenciais do PostgreSQL:

Snippet de código
DATABASE_URL="postgresql://usuario:senha@host:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:senha@host:5432/postgres"
PORT=3001
Execute as migrações e inicie o servidor:

Bash
npx prisma generate
npm start
3. Configurar e rodar o Frontend
Em outro terminal:

Bash
cd frontend
npm install
npm start
Acesse http://localhost:5173 no navegador.

👥 Autores e Instituição
Luiz Gustavo Balbino Serra dos Santos — Matrícula UC25102260

João Vítor Gomes de Farias — Matrícula UC25102217

Curso: Análise e Desenvolvimento de Sistemas — Universidade Católica de Brasília (UCB)

Comunidade Parceira: GS Locações e Festas (QR 406, Samambaia Norte – Brasília/DF)