# ⚡ Smart Plug - Monitoramento Inteligente de Energia

Aplicação web integrada a um dispositivo inteligente para **acompanhar, analisar e otimizar o consumo de energia elétrica em tempo real**.

---

## 📌 Sobre o projeto

O **Smart Plug** é uma solução completa que combina **hardware + software** para oferecer controle detalhado do consumo energético.

A aplicação permite que usuários:

- 📊 Visualizem consumo em tempo real
- 📈 Analisem histórico de uso
- ⚙️ Otimizem o consumo de energia
- 🔌 Gerenciem dispositivos conectados

---

## 🚀 Tecnologias utilizadas

### Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- React Hook Form + Zod

### Backend / Auth

- Better Auth
- Prisma ORM

### Banco de Dados

- PostgreSQL (ou outro compatível com Prisma)

### Infraestrutura

- Vercel (deploy)
- Node.js

---

## 🧠 Funcionalidades

- ✅ Cadastro e autenticação de usuários
- ✅ Login seguro
- ✅ Dashboard de consumo energético
- ✅ Integração com dispositivo inteligente (Smart Plug)
- ✅ Monitoramento em tempo real
- ✅ Histórico de consumo
- ✅ Interface moderna e responsiva

---

## 📷 Preview

> (Em construção...)

---

## ⚙️ Como rodar o projeto

````bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
´´´

### 1. Clone o repositório

```bash
git clone https://github.com/Heitor-Bello/smart-plug.git
cd smart-plug
````

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="sua_url_do_banco"
BETTER_AUTH_SECRET="seu_secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

### 4. Rode as migrations

```bash
npx prisma migrate dev
```

---

### 5. Gere o Prisma Client

```bash
npx prisma generate
```

---

### 6. Inicie o projeto

```bash
npm run dev
```

---

## 🌍 Deploy

O projeto está preparado para deploy na **Vercel**.

### Variáveis obrigatórias na Vercel:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_BASE_URL`

---

## 🧩 Estrutura do projeto

```
src/
 ├── app/
 ├── components/
 ├── lib/
 │    ├── prisma.ts
 │    └── auth-client.ts
 ├── hooks/
 ├── styles/
 └── utils/
```

---

## 🔐 Autenticação

O projeto utiliza **Better Auth** com integração ao Prisma.

---

## 📈 Futuras melhorias

- 🔔 Alertas de consumo excessivo
- 📱 Aplicativo mobile
- 🤖 Recomendações inteligentes com IA
- 📊 Relatórios avançados
- 🏠 Integração com casas inteligentes (IoT)

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido por **Heitor Bello**

- GitHub: [https://github.com/Heitor-Bello](https://github.com/Heitor-Bello)

---

## ⚡ Status do projeto

🚧 Em desenvolvimento
