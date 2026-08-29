# API Documentation — Smart Plug

Base URL: `/api`

Todos os endpoints retornam JSON. Endpoints protegidos exigem uma sessão autenticada (cookie de sessão gerenciado pelo Better Auth). Respostas de erro seguem o formato `{ "error": "mensagem" }`.

---

## Autenticação

### `GET /api/auth/[...all]`
### `POST /api/auth/[...all]`

Manipulador genérico do [Better Auth](https://better-auth.com). Responsável por todos os fluxos de autenticação:

- Login com e-mail e senha
- Cadastro
- Logout
- Login com Google (OAuth)
- Solicitação e redefinição de senha

Os sub-caminhos são resolvidos internamente pela biblioteca (ex: `/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/reset-password`, etc).

---

## Dashboard

### `GET /api/dashboard`

Retorna os dados consolidados do dashboard para o usuário autenticado: lista de dispositivos com a leitura mais recente e métricas agregadas.

**Autenticação:** obrigatória

**Resposta `200`**
```json
{
  "devices": [
    {
      "id": "cuid",
      "name": "Tomada Sala",
      "userId": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "readings": [
        {
          "id": "cuid",
          "current": 1.23,
          "power": 280.5,
          "energy": 0.045,
          "timestamp": "2026-04-15T22:00:00.000Z",
          "deviceId": "..."
        }
      ]
    }
  ],
  "totalPower": 280.5,
  "totalCurrent": 1.23,
  "totalEnergy": 0.045,
  "activeDevices": 1,
  "tariff": 0.72
}
```

> **Nota:** `totalPower`, `totalCurrent` e `activeDevices` consideram apenas leituras recentes (< 10 s). `totalEnergy` considera todas as leituras independente da idade.

---

## Relatórios

### `GET /api/reports`

Retorna a série histórica agregada de consumo de um ou de todos os dispositivos do usuário autenticado, usada pela tela `/dashboard/reports` para os gráficos de potência e energia por período.

**Autenticação:** obrigatória

**Query params**
| Parâmetro | Tipo   | Obrigatório | Valores aceitos                        | Descrição                                                        |
|-----------|--------|-------------|-----------------------------------------|-------------------------------------------------------------------|
| deviceId  | string | não         | id de um device do usuário, ou `all`    | Filtra por um dispositivo específico. Ausente ou `all` = todos os dispositivos do usuário |
| range     | string | não         | `24h` \| `7d` \| `30d` (default `24h`)  | Janela de tempo consultada                                        |

Cada `range` usa um tamanho de bucket fixo para agregação, mantendo o número de pontos do gráfico controlado independente do período:

| range | janela   | tamanho do bucket | nº de pontos (aprox.) |
|-------|----------|--------------------|------------------------|
| 24h   | 24 horas | 5 minutos          | 288                    |
| 7d    | 7 dias   | 1 hora             | 168                    |
| 30d   | 30 dias  | 1 dia              | 30                     |

Dentro de cada bucket, `power` e `current` são a média das leituras cruas naquele intervalo. `energy` e `cost` são a diferença entre a última e a primeira leitura do bucket, já que ambos os campos são cumulativos por leitura (não valores instantâneos). Deltas negativos — por exemplo quando um dispositivo reinicia e a energia acumulada volta a zero — são zerados.

**Resposta `200`**
```json
{
  "devices": [
    { "id": "cuid", "name": "Tomada Sala" }
  ],
  "series": [
    {
      "timestamp": "2026-08-29T16:00:00.000Z",
      "power": 98.18,
      "current": 0.446,
      "energy": 0.0046,
      "cost": 0.0034
    }
  ],
  "summary": {
    "totalEnergy": 2.29,
    "totalCost": 1.72,
    "avgPower": 88.18,
    "peakPower": 133.87,
    "peakPowerAt": "2026-08-29T02:14:58.868Z",
    "readingsCount": 521
  }
}
```

> **Nota:** `summary.totalEnergy` e `summary.totalCost` são calculados a partir da primeira e da última leitura de cada dispositivo dentro do range completo (não a soma dos buckets), para não perder consumo nas bordas dos buckets.

**Erros**
| Status | Motivo                                       |
|--------|-----------------------------------------------|
| 401    | Não autenticado                                |
| 404    | `deviceId` informado não pertence ao usuário   |

---

## Dispositivos

### `GET /api/devices`

Lista todos os dispositivos cadastrados pelo usuário autenticado, ordenados do mais recente ao mais antigo.

**Autenticação:** obrigatória

**Resposta `200`**
```json
[
  {
    "id": "cuid",
    "name": "Tomada Sala",
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `POST /api/devices`

Cria um novo dispositivo vinculado ao usuário autenticado.

**Autenticação:** obrigatória

**Body**
```json
{
  "name": "Tomada Sala"
}
```

| Campo | Tipo   | Obrigatório | Descrição              |
|-------|--------|-------------|------------------------|
| name  | string | sim         | Nome do dispositivo    |

**Resposta `201`**
```json
{
  "id": "cuid",
  "name": "Tomada Sala",
  "userId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Erros**
| Status | Motivo                          |
|--------|---------------------------------|
| 400    | `name` ausente ou vazio         |
| 401    | Não autenticado                 |

---

### `PATCH /api/devices/[deviceId]`

Renomeia um dispositivo existente. Apenas o dono do dispositivo pode renomeá-lo.

**Autenticação:** obrigatória

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Body**
```json
{
  "name": "Novo Nome"
}
```

**Resposta `200`** — dispositivo atualizado (mesmo formato do `POST /api/devices`)

**Erros**
| Status | Motivo                                    |
|--------|-------------------------------------------|
| 400    | `name` ausente ou vazio                   |
| 401    | Não autenticado                           |
| 404    | Dispositivo não encontrado ou sem permissão |

---

### `DELETE /api/devices/[deviceId]`

Remove um dispositivo e todas as suas leituras (cascade). Apenas o dono pode deletar.

**Autenticação:** obrigatória

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Resposta `204`** — sem corpo

**Erros**
| Status | Motivo                                    |
|--------|-------------------------------------------|
| 401    | Não autenticado                           |
| 404    | Dispositivo não encontrado ou sem permissão |

---

## Leituras

### `POST /api/devices/[deviceId]/readings`

Recebe e armazena uma leitura de sensor enviada pelo dispositivo (ESP32). Este endpoint **não exige autenticação de sessão** — é chamado diretamente pelo hardware.

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Body**
```json
{
  "corrente": 1.23,
  "potencia": 280.5,
  "energia": 0.045,
  "rele": true
}
```

| Campo    | Tipo    | Obrigatório | Range              | Descrição                          |
|----------|---------|-------------|--------------------|-------------------------------------|
| corrente | number  | sim         | 0 – 100 A         | Corrente elétrica (A)              |
| potencia | number  | sim         | 0 – 25 000 W      | Potência instantânea (W)           |
| energia  | number  | sim         | ≥ 0 kWh           | Energia acumulada (kWh)            |
| rele     | boolean | não         | —                  | Status do relé no momento da leitura (default `true` se omitido) |

O custo estimado da leitura (`Reading.cost`) e calculado automaticamente como `energia × tarifa do usuario`. Se `rele` for enviado, o `relayStatus` do device tambem e atualizado com esse valor.

**Resposta `201`**
```json
{
  "id": "cuid"
}
```

**Erros**
| Status | Motivo                                          |
|--------|-------------------------------------------------|
| 400    | Campos ausentes ou com tipo inválido            |
| 404    | `deviceId` não encontrado                       |
| 422    | Valores fora do range permitido                 |

---

## Controle do Relé

### `GET /api/devices/[deviceId]/control`

Retorna o status atual do relé de um dispositivo. Este endpoint **não exige autenticação de sessão** — é chamado diretamente pelo hardware (ESP32) a cada ciclo para saber se deve ligar ou desligar o relé.

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Resposta `200`**
```json
{
  "deviceId": "cuid",
  "ligado": true
}
```

**Erros**
| Status | Motivo                     |
|--------|-----------------------------|
| 404    | `deviceId` não encontrado   |

---

### `POST /api/devices/[deviceId]/control`

Liga ou desliga o relé de um dispositivo. Chamado pelo dashboard quando o usuário aciona o botão de ligar/desligar. Apenas o dono do dispositivo pode alterá-lo.

**Autenticação:** obrigatória

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Body**
```json
{
  "ligado": false
}
```

| Campo  | Tipo    | Obrigatório | Descrição                          |
|--------|---------|-------------|-------------------------------------|
| ligado | boolean | sim         | `true` para ligar, `false` para desligar |

**Resposta `200`**
```json
{
  "deviceId": "cuid",
  "ligado": false
}
```

**Erros**
| Status | Motivo                                      |
|--------|----------------------------------------------|
| 400    | `ligado` ausente ou não é booleano            |
| 401    | Não autenticado                               |
| 403    | Dispositivo pertence a outro usuário          |
| 404    | Dispositivo não encontrado                    |

---

### `PUT /api/devices/[deviceId]/control`

Alias de `POST /api/devices/[deviceId]/control` — mesmo comportamento, mesmo body, mesmas respostas.

---

## Usuário

### `PATCH /api/user/tariff`

Atualiza a tarifa de energia (R$/kWh) do usuário autenticado, usada para calcular o custo estimado no dashboard.

**Autenticação:** obrigatória

**Body**
```json
{
  "tariff": 0.72
}
```

| Campo  | Tipo   | Obrigatório | Validação         |
|--------|--------|-------------|-------------------|
| tariff | number | sim         | ≥ 0               |

**Resposta `200`**
```json
{
  "tariff": 0.72
}
```

**Erros**
| Status | Motivo                          |
|--------|---------------------------------|
| 400    | `tariff` ausente ou negativo    |
| 401    | Não autenticado                 |

---

## Upload

### `POST /api/upload/avatar`

Faz o upload da foto de perfil do usuário para o Vercel Blob Storage. Substitui automaticamente o avatar anterior se ele também estiver no Blob.

**Autenticação:** obrigatória

**Content-Type:** `multipart/form-data`

| Campo  | Tipo | Obrigatório | Descrição           |
|--------|------|-------------|---------------------|
| avatar | File | sim         | Imagem de perfil    |

**Restrições**
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Tamanho máximo: **5 MB**
- Validação por magic bytes (além do MIME type)

**Resposta `200`**
```json
{
  "url": "https://....public.blob.vercel-storage.com/avatars/..."
}
```

**Erros**
| Status | Motivo                                     |
|--------|--------------------------------------------|
| 400    | Nenhum arquivo enviado                     |
| 400    | Tipo de arquivo não suportado              |
| 400    | Arquivo muito grande (> 5 MB)              |
| 400    | Magic bytes inválidos (arquivo corrompido) |
| 401    | Não autenticado                            |
