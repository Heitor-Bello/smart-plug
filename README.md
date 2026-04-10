# Smart Plug / VoltMetric

Aplicacao web para cadastro de usuarios, gerenciamento de dispositivos inteligentes e ingestao de leituras de consumo energetico.

O repositorio mistura dois nomes de produto na interface e na documentacao existente:

- Smart Plug: nome mais direto ligado ao dominio do projeto
- VoltMetric: nome usado na identidade visual das telas

Na pratica, o sistema atual e um painel web em Next.js com autenticacao, perfil, cadastro de dispositivos e endpoint para receber leituras enviadas por hardware.

## Visao Geral

O projeto foi construido com App Router do Next.js e separa tres responsabilidades principais:

- camada web: landing page, telas de autenticacao e area autenticada
- camada de dados: Prisma ORM com PostgreSQL
- camada de acesso: Better Auth para sessao, login, cadastro e redefinicao de senha

Hoje o fluxo principal funciona assim:

1. O usuario cria uma conta ou entra com e-mail/senha ou Google.
2. Depois de autenticado, acessa a area de dashboard.
3. Na area autenticada, pode cadastrar dispositivos e copiar seus IDs.
4. Um dispositivo externo pode enviar leituras para a API usando o ID do dispositivo.
5. O usuario tambem pode editar nome e avatar do perfil.

## Stack Tecnica

### Frontend

- Next.js 16.2.0
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- Lucide React

### Formularios e validacao

- React Hook Form
- Zod
- @hookform/resolvers

### Backend e autenticacao

- Better Auth
- Better Auth React Client
- Better Auth Next.js handler

### Banco e persistencia

- Prisma ORM 6.19.2
- PostgreSQL
- pg
- @prisma/adapter-pg

### Servicos externos

- Resend para envio de e-mail de recuperacao de senha
- Vercel Blob para upload de avatar

### Qualidade e tooling

- ESLint 9
- eslint-config-next
- Prisma CLI
- dotenv

## Bibliotecas Usadas e Papel de Cada Uma

### Next.js

Responsavel por rotas, layouts, renderizacao no servidor, API routes e organizacao por App Router.

### Better Auth

Centraliza o fluxo de autenticacao. No projeto ele cuida de:

- cadastro com e-mail e senha
- login com e-mail e senha
- login social com Google
- sessao no servidor
- atualizacao de usuario
- fluxo de esqueci a senha e redefinicao

### Prisma

Responsavel pelo acesso ao banco e mapeamento dos modelos:

- User
- Session
- Account
- Verification
- Device
- Reading

### React Hook Form + Zod

Usados nos formularios de login, cadastro, perfil, recuperacao e redefinicao de senha, com validacao declarativa no cliente.

### Resend

Usado dentro da configuracao do Better Auth para enviar o e-mail com o link de redefinicao de senha.

### Vercel Blob

Usado para armazenar imagens de avatar e substituir o avatar anterior quando ele tambem estiver salvo no Blob.

## Arquitetura Atual

### 1. Camada publica

As rotas publicas ficam em `src/app` e incluem:

- `/`: landing page institucional
- `/login`: login de usuario
- `/register`: cadastro de usuario
- `/forgot-password`: solicitacao de redefinicao de senha
- `/reset-password`: redefinicao com token
- `/privacy`: politica de privacidade

A home e composta por secoes reutilizaveis em `src/app/_components`, com foco de apresentacao do produto.

### 2. Camada autenticada

As rotas em `src/app/dashboard` usam um layout protegido.

O arquivo `src/app/dashboard/layout.tsx` valida a sessao no servidor. Se nao houver sessao, o usuario e redirecionado para `/login`.

Dentro do dashboard existem hoje estas areas:

- `/dashboard`: painel principal com cards de metricas e leituras em tempo real
- `/dashboard/devices`: lista, cadastro, edicao e remocao de dispositivos do usuario autenticado
- `/dashboard/profile`: visualizacao e edicao basica do perfil

### 3. Camada de API

As APIs ficam em `src/app/api`.

#### Autenticacao

- `/api/auth/[...all]`

Essa rota delega o tratamento completo ao Better Auth via `toNextJsHandler(auth)`.

#### Dispositivos

- `GET /api/devices`
	Retorna os dispositivos do usuario autenticado.

- `POST /api/devices`
	Cria um novo dispositivo para o usuario autenticado.

- `PATCH /api/devices/[deviceId]`
	Renomeia um dispositivo. Valida ownership pelo userId da sessao.

- `DELETE /api/devices/[deviceId]`
	Remove o dispositivo e todas as leituras associadas via cascade.

#### Dashboard em tempo real

- `GET /api/dashboard`
	Retorna os dispositivos do usuario com a ultima leitura de cada um, alem de agregados: potencia total, corrente total, energia acumulada e contagem de dispositivos ativos.
	Usado pelo polling automatico do lado do cliente.

#### Leituras de energia

- `POST /api/devices/[deviceId]/readings`
	Recebe uma leitura de um dispositivo existente e grava no banco.

O payload esperado hoje e:

```json
{
	"corrente": 1.23,
	"potencia": 220.5,
	"energia": 5.17
}
```

Mapeamento para o banco:

- `corrente` -> `Reading.current`
- `potencia` -> `Reading.power`
- `energia` -> `Reading.energy`

#### Upload de avatar

- `POST /api/upload/avatar`

Recebe multipart form-data com o campo `avatar`, valida tipo e tamanho do arquivo, verifica magic bytes basicos e salva a imagem no Vercel Blob.

## Banco de Dados

O schema Prisma define os seguintes modelos:

### User

Armazena dados do usuario autenticado, incluindo nome, e-mail, avatar e relacoes com sessoes, contas OAuth e dispositivos.

### Session

Tabela de sessao gerenciada pelo Better Auth.

### Account

Tabela para provedores autenticados, incluindo login social e credenciais relacionadas.

### Verification

Tabela usada em fluxos de verificacao e recuperacao.

### Device

Representa uma tomada inteligente ou equipamento vinculado a um usuario.

Campos principais:

- `id`
- `name`
- `userId`
- `createdAt`
- `updatedAt`

### Reading

Representa uma leitura de consumo associada a um dispositivo.

Campos principais:

- `current`: corrente em amperes
- `power`: potencia em watts
- `energy`: energia acumulada em kWh
- `timestamp`
- `deviceId`

Existe um indice composto em `deviceId + timestamp`, adequado para futuras consultas por periodo.

## Funcionalidades Implementadas

### 1. Cadastro de usuario

Implementado em `src/app/register` usando Better Auth com validacao local via Zod.

O formulario exige:

- nome completo
- e-mail valido
- senha com minimo de 8 caracteres
- confirmacao da senha
- aceite da politica de privacidade

### 2. Login

Implementado em `src/app/login` com dois caminhos:

- login com e-mail e senha
- login social com Google

Quando o login e bem-sucedido, o usuario e enviado para `/dashboard/devices`.

### 3. Recuperacao de senha

Implementada em duas etapas:

- `/forgot-password`: solicita envio do link
- `/reset-password`: troca a senha a partir do token recebido por e-mail

O envio do e-mail e feito pela funcao `sendResetPassword` na configuracao do Better Auth, usando Resend.

### 4. Protecao de rotas privadas

O dashboard verifica a sessao no servidor com `getServerSession()` antes de renderizar o layout.

### 5. Gerenciamento de dispositivos

Implementado em `/dashboard/devices`.

O usuario pode:

- listar os dispositivos vinculados a propria conta
- cadastrar um novo dispositivo informando apenas o nome
- copiar o ID do dispositivo para uso externo
- renomear um dispositivo com confirmacao inline
- deletar um dispositivo (requer confirmacao para evitar exclusoes acidentais)

A exclusao remove o dispositivo e todas as leituras associadas no banco via cascade.

Esse ID e importante porque o endpoint de leituras usa o `deviceId` diretamente na URL.

### 6. Ingestao de leituras do hardware

Implementada em `POST /api/devices/[deviceId]/readings`.

A API hoje faz:

- validacao de existencia do dispositivo
- validacao de tipos numericos
- validacao simples de ranges
- persistencia da leitura

Faixas aceitas atualmente:

- `corrente`: entre 0 e 100
- `potencia`: entre 0 e 25000
- `energia`: maior ou igual a 0

### 7. Perfil do usuario

Implementado em `/dashboard/profile`.

O usuario pode:

- visualizar nome, e-mail e avatar
- alterar nome
- enviar um novo avatar

O e-mail esta visivel, mas bloqueado para edicao na interface atual.

### 8. Dashboard principal com leituras em tempo real

Implementado em `/dashboard` com arquitetura hibrida SSR + polling no cliente.

A pagina renderiza os dados iniciais no servidor (SSR) e os passa como `initialData` para um client component (`DashboardLive`) que faz polling a cada 3 segundos na rota `GET /api/dashboard`.

O dashboard exibe:

**Cards de resumo:**

- Potencia Total (W): soma da potencia instantanea de todos os dispositivos
- Corrente Total (A): soma da corrente de todos os dispositivos
- Energia Acumulada (kWh): soma da energia registrada
- Dispositivos Ativos: quantidade de dispositivos com pelo menos uma leitura registrada

**Cards por dispositivo:**

- Nome e ID do dispositivo
- Badge de status (Ativo / Sem dados)
- Ultima leitura de potencia, corrente e energia
- Ha quanto tempo foi a ultima leitura

Um indicador visual pulsante confirma que o polling esta ativo. O horario da ultima atualizacao e exibido apos o primeiro ciclo de polling para evitar erro de hidratacao entre servidor e cliente.

Erros de rede sao tratados silenciosamente: o ultimo dado valido continua visivel.

### 9. Upload de avatar

O fluxo de avatar faz:

- validacao de autenticacao
- validacao de MIME type
- limite de 5 MB
- validacao basica de assinatura binaria do arquivo
- upload para Vercel Blob
- remocao do avatar anterior quando aplicavel
- atualizacao do campo `image` do usuario no Better Auth

## Estrutura do Projeto

```text
src/
	app/
		api/
			auth/
			dashboard/
			devices/
			upload/
		dashboard/
			_components/
			devices/
			profile/
		forgot-password/
		login/
		register/
		reset-password/
	components/
		navigation/
		ui/
	lib/
		auth.ts
		auth-client.ts
		prisma.ts
		resend.ts
		session.ts
prisma/
	schema.prisma
	migrations/
```

## Variaveis de Ambiente

Estas variaveis sao necessarias para rodar o projeto completo:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SEND_EMAIL_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Se o upload de avatar for usado fora do ambiente gerenciado da Vercel, tambem sera necessario configurar as credenciais do Vercel Blob.

## Como Rodar Localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar ambiente

Criar um arquivo `.env` na raiz do projeto com as variaveis necessarias.

### 3. Aplicar migrations

```bash
npx prisma migrate dev
```

### 4. Gerar o client do Prisma

```bash
npx prisma generate
```

### 5. Subir o projeto

```bash
npm run dev
```

## Comandos Disponiveis

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Estado Atual do Projeto

O projeto ja possui uma base funcional para autenticacao e gerenciamento de dispositivos, mas ainda nao implementa um dashboard analitico completo.

Pontos importantes do estado atual:

- a landing page esta pronta e bem segmentada em componentes
- o fluxo de autenticacao esta funcional no cliente e no servidor
- o cadastro de dispositivos esta funcional
- o recebimento de leituras esta funcional no banco
- a pagina `/dashboard` ainda esta sem conteudo real
- ainda nao existe tela para visualizar historico de leituras ou metricas agregadas

## Observacoes Tecnicas

### Seguranca do endpoint de leituras

Hoje a rota `POST /api/devices/[deviceId]/readings` valida apenas se o dispositivo existe. Ela ainda nao exige segredo do dispositivo, token proprio do hardware ou assinatura da requisicao.

Isso significa que qualquer cliente que conheca um `deviceId` valido consegue enviar leituras para aquele dispositivo.

### Estado do produto

A base estrutural esta pronta para evoluir para um painel de monitoramento energetico de fato, mas a parte de visualizacao analitica ainda precisa ser implementada em cima das leituras ja persistidas.

## Resumo Rapido

Em termos praticos, o projeto hoje entrega:

- autenticacao completa de usuarios
- area autenticada com protecao de sessao
- gerenciamento de dispositivos por usuario
- endpoint para ingestao de dados do hardware
- edicao de perfil com upload de avatar

O proximo passo natural de produto e transformar as leituras armazenadas em visualizacoes, historicos, alertas e indicadores de consumo.
