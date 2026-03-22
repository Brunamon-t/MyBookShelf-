# 📚 MyBookShelf API - Gestão de Biblioteca com IA
**Projeto de Integração de Sistemas e Microserviços** 

Este projeto consiste numa aplicação distribuída baseada em microserviços, focada na catalogação de livros e recomendações inteligentes através de IA Generativa.

---

## 🏗️ Arquitetura do Sistema
A aplicação segue uma separação rigorosa de camadas para garantir modularidade e escalabilidade: 
* **Presentation Layer:** Interface desenvolvida em React.js. 
* **Application Layer:** Lógica de casos de uso via Cloud Functions (Node.js). 
* **Domain Layer:** Entidades e regras de negócio para gestão bibliográfica. 
* **Infrastructure Layer:** Persistência em Firestore (NoSQL) e consumo de APIs externas. 

## 🧩 Microserviços Identificados
Cada microserviço possui a sua própria API e base de dados (Database per Service): 
1. **Service_Auth:** Autenticação via Google OAuth 2.0 / JWT. 
2. **Service_Library:** Gestão da estante pessoal (CRUD) e persistência NoSQL.
3. **Service_Catalog:** Integração síncrona com a Google Books API. 
4.**Service_Recommendation:** Motor de IA síncrono utilizando Gemini 2.0 Flash via OpenRouter. 

## 🧠 Metodologia Vibe Coding
O desenvolvimento foi suportado por ferramentas de IA generativa, integrando as seguintes práticas: 
* **Debugging Inteligente:** Resolução de erros de integração e Model IDs.
* **Geração de Boilerplate:** Estrutura inicial de funções e estilos CSS. 
* **Diagramação Assistida:** Criação de mapas de sequência via Mermaid.
* **Revisão Crítica:** Todos os trechos de código gerados foram validados e ajustados manualmente pela equipa. 

## 🚥 Como Executar o Projeto (Modo de Avaliação)

Para simplificar a avaliação, o projeto utiliza **Firebase Emulators**. Isto permite correr toda a infraestrutura de microserviços localmente, sem necessidade de configurações na Cloud ou criação de projetos externos.

### 1. Pré-requisitos
* **Node.js** instalado (v18 ou superior).
* **Firebase CLI** instalado globalmente:
  ```bash
  npm install -g firebase-tools

## 🛠️ Instalação e Configuração

Para configurar o ambiente de desenvolvimento e executar a aplicação localmente, segue os passos abaixo:

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Brunamon-t/MyBookShelf-](https://github.com/Brunamon-t/MyBookShelf-)
cd MyBookShelf_Project

# Navegar até à pasta das funções
cd backend/api1
# Instalar dependências (Node.js)
npm install

# Abrir um novo terminal na raiz do projeto
cd frontend
# Instalar dependências da interface
npm install

# Executar na raiz do projeto para ligar todos os serviços
firebase emulators:start

# Na pasta frontend
npm start
