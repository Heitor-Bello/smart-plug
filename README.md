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
- Anthropic Claude API (`@anthropic-ai/sdk`, modelo `claude-opus-5`) para os avisos de IA nos relatorios e o chat da aplicacao

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

### Anthropic Claude API

Usada em `src/lib/anthropic.ts` (client singleton) para gerar os avisos de IA sobre o historico de consumo e para o assistente de chat da aplicacao. Ambos usam o modelo `claude-opus-5`; os avisos pedem saida estruturada (JSON schema) e o chat usa uma tool custom para consultar dados reais do usuario sob demanda.

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
- `/dashboard/reports`: historico de consumo por periodo (24h/7d/30d) e por dispositivo, com graficos de potencia e energia
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
	Retorna os dispositivos do usuario (com `relayStatus`) e a ultima leitura de cada um, alem de agregados: potencia total, corrente total, energia acumulada, contagem de dispositivos ativos e a tarifa do usuario.
	Usado pelo polling automatico do lado do cliente.

#### Leituras de energia

- `POST /api/devices/[deviceId]/readings`
	Recebe uma leitura de um dispositivo existente e grava no banco. Rota publica, chamada diretamente pelo hardware (ESP32).

O payload esperado hoje e:

```json
{
	"corrente": 1.23,
	"potencia": 220.5,
	"energia": 5.17,
	"rele": true
}
```

Mapeamento para o banco:

- `corrente` -> `Reading.current`
- `potencia` -> `Reading.power`
- `energia` -> `Reading.energy`
- `rele` (opcional) -> `Reading.relayOn` e tambem atualiza `Device.relayStatus`

O custo da leitura (`Reading.cost`) e calculado no servidor como `energia * tarifa do usuario`.

#### Relatorios

- `GET /api/reports`
	Retorna a serie historica agregada de consumo (potencia, corrente, energia, custo) de um dispositivo especifico ou de todos os dispositivos do usuario autenticado, alem de um resumo do periodo (energia total, custo total, potencia media, pico de potencia).

Aceita os query params `deviceId` (id de um device do usuario, ou `all`/ausente para todos) e `range` (`24h`, `7d` ou `30d`, default `24h`).

As leituras cruas sao agregadas em buckets de tamanho fixo por range, para manter o numero de pontos do grafico controlado: 5 min para `24h` (~288 pontos), 1 hora para `7d` (~168 pontos) e 1 dia para `30d` (~30 pontos). Dentro de cada bucket, potencia e corrente sao a media das leituras; energia e custo sao a diferenca entre a ultima e a primeira leitura do bucket, ja que ambos os campos sao cumulativos por leitura.

#### Controle do rele

- `GET /api/devices/[deviceId]/control`
	Retorna o status atual do rele (`{ deviceId, ligado }`). Rota publica, consultada pelo hardware a cada ciclo para saber se deve ligar ou desligar.

- `POST /api/devices/[deviceId]/control` (alias `PUT`)
	Liga ou desliga o rele (`{ ligado: boolean }`). Exige autenticacao e valida que o dispositivo pertence ao usuario da sessao. Usado pelo botao de liga/desliga no dashboard.

#### Upload de avatar

- `POST /api/upload/avatar`

Recebe multipart form-data com o campo `avatar`, valida tipo e tamanho do arquivo, verifica magic bytes basicos e salva a imagem no Vercel Blob.

#### Analise com IA

- `POST /api/reports/insights`
	Gera (ou retorna do cache) avisos em linguagem natural sobre o consumo de um periodo/dispositivo, usando a Claude API. Body: `{ deviceId, range, force? }` (mesmos valores aceitos por `/api/reports`; `force: true` ignora o cache). Resposta: `{ insights: { title, message, severity }[], generatedAt, cached }`.

	O resultado fica em cache por 30 minutos por combinacao de usuario/dispositivo/periodo (tabela `Insight`), evitando chamar a API a cada carregamento da tela. A geracao usa a mesma agregacao de `getReportData` (compartilhada com `/api/reports`) e pede a resposta em formato estruturado (JSON schema), nunca texto livre.

- `POST /api/chat`
	Endpoint do assistente de chat. Body: `{ messages: { role: "user" | "assistant", content: string }[] }` — o cliente reenvia o historico completo a cada chamada (API sem estado). Resposta: `{ reply: string }`.

	A IA tem acesso a uma tool (`get_consumption_data`) que consulta os dados reais do usuario autenticado sob demanda (mesma agregacao de `/api/reports`), em vez de depender de um resumo fixo enviado pelo cliente. A tool so enxerga dispositivos do proprio usuario da sessao. Historico de conversa nao e persistido no banco — vive apenas no estado do componente de chat, no navegador.

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
- `relayStatus`: status atual do rele (`true` = ligado, `false` = desligado)
- `createdAt`
- `updatedAt`

### Reading

Representa uma leitura de consumo associada a um dispositivo.

Campos principais:

- `current`: corrente em amperes
- `power`: potencia em watts
- `energy`: energia acumulada em kWh
- `cost`: custo estimado em R$ (`energy * tarifa do usuario` no momento da leitura)
- `relayOn`: status do rele no momento da leitura
- `timestamp`
- `deviceId`

Existe um indice composto em `deviceId + timestamp`, adequado para futuras consultas por periodo.

O modelo `User` tambem possui um campo `tariff` (R$/kWh, editavel via `PATCH /api/user/tariff`), usado para calcular o custo estimado no dashboard.

### Insight

Cache dos avisos gerados por IA sobre o historico de consumo (ver `POST /api/reports/insights`).

Campos principais:

- `userId`
- `deviceId`: `null` representa "todos os dispositivos"
- `range`: `"24h"` | `"7d"` | `"30d"`
- `content`: lista de avisos (`{ title, message, severity }[]`) em formato JSON
- `createdAt`: usado para calcular a validade do cache (30 minutos)

Existe um indice composto em `userId + deviceId + range` para a consulta de cache.

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

A pagina renderiza os dados iniciais no servidor (SSR) e os passa como `initialData` para um client component (`DashboardLive`) que faz polling a cada 1 segundo na rota `GET /api/dashboard`.

O dashboard exibe:

**Cards de resumo:**

- Potencia Total (W): soma da potencia instantanea dos dispositivos com leitura recente
- Corrente Total (A): soma da corrente dos dispositivos com leitura recente
- Energia Acumulada (kWh): soma da energia registrada de todos os dispositivos, independente do tempo
- Dispositivos Ativos: quantidade de dispositivos com leitura recente

**Card de custo estimado:**

- Mostra `energia acumulada * tarifa` em R$, com a tarifa editavel inline (`PATCH /api/user/tariff`)

**Cards por dispositivo:**

- Nome e ID do dispositivo
- Badge de status: **Ativo** (verde, leitura recente), **Offline** (vermelho, leitura antiga) ou **Sem dados** (cinza, nenhuma leitura)
- Potencia e corrente zeradas automaticamente quando a ultima leitura estiver desatualizada (dispositivo provavelmente desligado)
- Energia acumulada sempre exibida, independente do tempo da ultima leitura
- Ha quanto tempo foi a ultima leitura
- Botao de liga/desliga do rele (`POST /api/devices/[deviceId]/control`)

Um indicador visual pulsante confirma que o polling esta ativo. O horario da ultima atualizacao e exibido apos o primeiro ciclo de polling para evitar erro de hidratacao entre servidor e cliente.

Erros de rede sao tratados silenciosamente: o ultimo dado valido continua visivel.

**Deteccao de dispositivo offline:**

Um limiar de 10 segundos (`STALE_MS`, marcado no codigo com um `TODO` para ser ajustado para 60s apos a apresentacao do TCC) e aplicado tanto na API (`src/app/api/dashboard/route.ts`) quanto no componente de card (`DeviceReadingCard.tsx`). Se a ultima leitura de um dispositivo for mais antiga que esse limiar:

- Na API: potencia e corrente nao entram nos totais do sumario; o dispositivo nao e contado como ativo
- No card: potencia e corrente exibem 0; o badge muda de Ativo para Offline
- Energia nunca e zerada por ser um valor acumulado

### 10. Controle remoto do rele

Cada dispositivo tem um `relayStatus` (ligado/desligado). O usuario pode ligar ou desligar remotamente pelo card do dispositivo no dashboard, que chama `POST /api/devices/[deviceId]/control`.

O ESP32 consulta `GET /api/devices/[deviceId]/control` a cada ciclo do loop para saber o status desejado e aciona o pino do rele fisico de acordo. O firmware tambem reporta o status do rele em cada leitura enviada (`rele` no payload de `/readings`), mantendo `Device.relayStatus` e `Reading.relayOn` sincronizados mesmo se a chamada de controle falhar.

### 11. Tarifa de energia e custo estimado

O usuario define sua tarifa de energia (R$/kWh) em `User.tariff`, editavel inline no dashboard (`PATCH /api/user/tariff`). Cada leitura recebida calcula e grava seu proprio custo (`Reading.cost = energia * tarifa`), e o dashboard soma isso para exibir o custo total estimado.

### 9. Upload de avatar

O fluxo de avatar faz:

- validacao de autenticacao
- validacao de MIME type
- limite de 5 MB
- validacao basica de assinatura binaria do arquivo
- upload para Vercel Blob
- remocao do avatar anterior quando aplicavel
- atualizacao do campo `image` do usuario no Better Auth

### 12. Historico e relatorios de consumo

Implementado em `/dashboard/reports`, usando a API `GET /api/reports`.

O usuario pode:

- filtrar por dispositivo especifico ou ver todos os dispositivos somados
- escolher o periodo: ultimas 24h, ultimos 7 dias ou ultimos 30 dias
- ver cards de resumo do periodo: energia consumida, custo estimado, potencia media e pico de potencia (com data/hora do pico)
- ver um grafico de area com a potencia media ao longo do tempo
- ver um grafico de barras com a energia consumida por bucket de tempo

As leituras cruas sao agregadas no servidor em buckets (5 min / 1 hora / 1 dia, conforme o periodo) para manter o grafico legivel e o payload pequeno, mesmo com leituras chegando a cada 1 segundo. Energia e custo do periodo sao calculados pela diferenca entre a primeira e a ultima leitura de cada dispositivo no intervalo (ambos os campos sao cumulativos), com protecao contra valores negativos quando um dispositivo reinicia e sua energia acumulada volta a zero.

> **Nota de escala:** a agregacao hoje e feita em memoria (busca as leituras cruas do periodo via Prisma e agrupa em JS), o que e adequado para o volume atual do projeto. Se o numero de leituras crescer muito, o proximo passo seria mover essa agregacao para o banco (SQL com `date_trunc`/bucket), evitando trazer todas as leituras cruas para a aplicacao.

### 13. Analise com IA e chat na aplicacao

Primeira integracao do projeto com a Claude API (Anthropic), usando o SDK oficial (`@anthropic-ai/sdk`) com o modelo `claude-opus-5`.

**Avisos automaticos sobre o historico** (`/dashboard/reports`, `POST /api/reports/insights`):

- Botao "Gerar analise com IA" no topo da tela de relatorios, que envia o resumo agregado do periodo/dispositivo selecionado para a Claude e recebe de volta uma lista de avisos curtos (titulo, mensagem e severidade `info`/`warning`/`success`), pedidos em formato estruturado (JSON schema via `output_config.format`), nunca texto livre
- Os avisos explicam o que os numeros significam (ex: energia do bucket e o consumo daquele intervalo, nao um total desde sempre) e apontam padroes reais nos dados (picos, tendencias, horarios de maior uso)
- Resultado fica em cache por 30 minutos por usuario/dispositivo/periodo (model `Insight`), evitando chamar a API a cada carregamento da tela; o botao vira "Atualizar analise" e forca uma nova geracao quando clicado de novo

**Chat na aplicacao** (`POST /api/chat`, componente `ChatWidget`):

- Botao flutuante disponivel em toda a area autenticada (`dashboard/layout.tsx`), abrindo um painel de conversa
- O assistente pode responder perguntas sobre como o app funciona e, para perguntas sobre dados reais (consumo, custo, potencia de um periodo), usa uma tool (`get_consumption_data`) que consulta o banco sob demanda, sempre restrita aos dispositivos do usuario autenticado — a IA nunca recebe acesso direto ao banco nem pode ver dados de outro usuario
- Implementado com um loop manual de tool use (nao o Tool Runner beta do SDK), para manter a resposta simples e sem streaming nesta primeira versao
- Historico de conversa vive apenas no estado do componente no navegador — nao e persistido no banco nesta versao

## Estrutura do Projeto

```text
src/
	app/
		api/
			auth/
			chat/
			dashboard/
			devices/
			reports/
				insights/
			upload/
		dashboard/
			_components/
			devices/
			reports/
			profile/
		forgot-password/
		login/
		register/
		reset-password/
	components/
		chat/
		navigation/
		ui/
	emails/
		reset-password.tsx
	lib/
		anthropic.ts
		auth.ts
		auth-client.ts
		prisma.ts
		reports.ts
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
ANTHROPIC_API_KEY=
```

Se o upload de avatar for usado fora do ambiente gerenciado da Vercel, tambem sera necessario configurar as credenciais do Vercel Blob.

`ANTHROPIC_API_KEY` e necessaria para os avisos de IA (`POST /api/reports/insights`) e o chat (`POST /api/chat`) funcionarem — obtida em [console.anthropic.com](https://console.anthropic.com).

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

O projeto ja possui uma base funcional completa: autenticacao, gerenciamento de dispositivos, ingestao de leituras, dashboard em tempo real, controle remoto do rele, calculo de custo por tarifa, relatorios de consumo por periodo e uma primeira integracao com IA (avisos automaticos e chat).

Pontos importantes do estado atual:

- a landing page esta pronta e bem segmentada em componentes
- o fluxo de autenticacao esta funcional no cliente e no servidor
- o cadastro de dispositivos esta funcional
- o recebimento de leituras esta funcional no banco, incluindo custo e status do rele
- a pagina `/dashboard` exibe metricas agregadas e por dispositivo, com polling em tempo real
- o controle remoto do rele (ligar/desligar) esta funcional entre dashboard, API e firmware
- a pagina `/dashboard/reports` exibe historico de consumo (potencia e energia) por periodo e por dispositivo, com agregacao em buckets feita no servidor
- ainda nao existe intervalo de datas customizado nem exportacao dos relatorios (hoje sao apenas os presets 24h/7d/30d)
- os avisos de IA (`/api/reports/insights`) sao gerados sob demanda (nao automaticamente) e o chat (`/api/chat`) nao persiste historico entre sessoes — ambas decisoes tomadas para manter o custo de API previsivel na primeira versao

## Observacoes Tecnicas

### Seguranca do endpoint de leituras

Hoje a rota `POST /api/devices/[deviceId]/readings` valida apenas se o dispositivo existe. Ela ainda nao exige segredo do dispositivo, token proprio do hardware ou assinatura da requisicao.

Isso significa que qualquer cliente que conheca um `deviceId` valido consegue enviar leituras para aquele dispositivo.

### Estado do produto

A base estrutural do painel de monitoramento energetico esta pronta, incluindo a visualizacao analitica basica (`/dashboard/reports`), avisos automaticos gerados por IA e um chat para o usuario perguntar sobre o app e os proprios dados. Os proximos incrementos naturais sao intervalo de datas customizado, exportacao de dados e persistir o historico do chat.

## Resumo Rapido

Em termos praticos, o projeto hoje entrega:

- autenticacao completa de usuarios
- area autenticada com protecao de sessao
- gerenciamento de dispositivos por usuario
- endpoint para ingestao de dados do hardware, com custo e status do rele
- dashboard em tempo real com metricas agregadas, custo estimado e status por dispositivo
- controle remoto de liga/desliga do rele (dashboard, API e firmware)
- edicao de perfil com upload de avatar
- relatorios de consumo por periodo (24h/7d/30d) e por dispositivo, com graficos de potencia e energia
- avisos de IA sobre o historico de consumo e chat na aplicacao para perguntas sobre o app e os dados do usuario (Claude API)

O proximo passo natural de produto e evoluir os relatorios (intervalo customizado, exportacao CSV) e o chat (persistir historico, sugerir perguntas).
