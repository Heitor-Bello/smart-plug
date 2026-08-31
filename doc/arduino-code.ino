#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WiFiManager.h>  // biblioteca "WiFiManager" de tzapu — instalar pelo Library Manager da IDE
#include <math.h>

// =====================================================
// WI-FI
// =====================================================
//
// Nao ha mais SSID/senha fixos no codigo. No primeiro boot (ou sempre que o
// Wi-Fi salvo falhar), o ESP32 abre um ponto de acesso proprio e um portal de
// configuracao (pagina servida por ele mesmo, acessada em 192.168.4.1) onde o
// usuario escolhe a rede de casa e digita a senha — sem precisar abrir a IDE
// do Arduino. As credenciais ficam salvas no proprio chip entre reinicios.
//
// Segurar o botao BOOT (GPIO0) da placa durante a ligacao apaga o Wi-Fi salvo
// e reabre o portal — util se o dispositivo mudar de rede/casa.

const char* apSenhaPortal = "smartplug123";  // senha do Wi-Fi temporario de configuracao (>= 8 caracteres)
const int pinoBotaoReset = 0;                // botao BOOT, presente na maioria das placas ESP32 DevKit

WiFiClientSecure wifiClient;

// URLs da API — o deviceId nao e mais fixo no codigo. Cada ESP32 se identifica
// pelo proprio MAC address (hardwareId), calculado em runtime no setup(). Isso
// permite gravar o mesmo firmware em qualquer placa: o pareamento com uma conta
// e feito depois, pelo app, digitando o codigo impresso no Serial Monitor (ou
// exibido na propria pagina de configuracao do Wi-Fi).
const char* apiBaseURL = "https://smart-plug-woad.vercel.app/api/esp/";

String hardwareId;
String apiURL;
String apiControlURL;


// =====================================================
// PINOS
// =====================================================

const int pinoSensor = 34;
const int pinoRele = 26;


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const float sensibilidade = 0.100;  // ACS712 20A
const float tensaoRede = 127.0;
const float frequenciaRede = 60.0;


// =====================================================
// AMOSTRAGEM
// =====================================================

const int amostrasOffset = 3000;
const int amostras = 6000;

const float taxaAmostragem = 2000.0;

const float periodoAmostragem =
  1.0 / taxaAmostragem;


// =====================================================
// ENERGIA
// =====================================================

double energia_kWh = 0.0;

unsigned long tempoAnterior;


float correnteAtual = 0.0;
float potenciaAtual = 0.0;
float offsetAtual = 0.0;
bool releStatus = true;  // true = ligado, false = desligado


// =====================================================
// ENVIA DADOS PARA A API
// =====================================================

void enviarDadosAPI(float correnteRMS, float potencia, double energia_kWh, bool statusRele) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Nao foi possivel enviar.");
    return;
  }

  HTTPClient http;

  Serial.println("Enviando dados para API...");
  Serial.println(apiURL);

  if (!http.begin(wifiClient, apiURL)) {
    Serial.println("Erro ao iniciar conexao HTTPS.");
    return;
  }

  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
  http.setRedirectLimit(5);
  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"corrente\":" + String(correnteRMS, 4) + ",";
  json += "\"potencia\":" + String(potencia, 2) + ",";
  json += "\"energia\":" + String(energia_kWh, 6) + ",";
  json += "\"rele\":" + String(statusRele ? "true" : "false");
  json += "}";

  Serial.println(json);

  int httpResponseCode = http.POST(json);

  Serial.print("Resposta servidor: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    String resposta = http.getString();
    Serial.println("Resposta da API:");
    Serial.println(resposta);
  } else {
    Serial.print("Erro HTTP: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}


// =====================================================
// BUSCA STATUS DO RELÉ NA API
// =====================================================

void buscarStatusReleAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Nao foi possivel buscar status.");
    return;
  }

  HTTPClient http;

  Serial.println("Buscando status do rele na API...");
  Serial.println(apiControlURL);

  if (!http.begin(wifiClient, apiControlURL)) {
    Serial.println("Erro ao iniciar conexao HTTPS.");
    return;
  }

  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
  http.setRedirectLimit(5);
  http.setTimeout(10000);

  int httpResponseCode = http.GET();

  Serial.print("Resposta servidor: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode == 200) {
    String resposta = http.getString();
    Serial.println("Resposta:");
    Serial.println(resposta);

    if (resposta.indexOf("\"ligado\":true") != -1 || resposta.indexOf("\"ligado\": true") != -1) {
      releStatus = true;
    } else if (resposta.indexOf("\"ligado\":false") != -1 || resposta.indexOf("\"ligado\": false") != -1) {
      releStatus = false;
    } else {
      Serial.println("Nao foi possivel identificar o status do rele.");
    }

    digitalWrite(pinoRele, releStatus ? HIGH : LOW);

    Serial.print("Status rele atualizado: ");
    Serial.println(releStatus ? "LIGADO" : "DESLIGADO");
  } else {
    Serial.print("Erro ao buscar status: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode < 0) {
      Serial.print("Descricao: ");
      Serial.println(http.errorToString(httpResponseCode));
    }
  }

  http.end();
}



void setup() {

  Serial.begin(115200);

  pinMode(pinoRele, OUTPUT);

  // Mantém o relé ligado
  digitalWrite(pinoRele, HIGH);

  pinMode(pinoBotaoReset, INPUT_PULLUP);


  Serial.println();
  Serial.println("========================================");
  Serial.println("INICIANDO SISTEMA");
  Serial.println("========================================");

  // ===================================================
  // IDENTIFICACAO DO DISPOSITIVO (hardwareId = MAC de fabrica, via eFuse)
  // ===================================================
  // WiFi.macAddress() depende do radio Wi-Fi ja estar inicializado — mesmo
  // com WiFi.mode(WIFI_STA) antes, o timing pode falhar e retornar
  // "00:00:00:00:00:00" (reproduzido em bancada). ESP.getEfuseMac() le o MAC
  // de fabrica direto do chip, sem depender do driver Wi-Fi, e por isso e
  // mais confiavel para gerar o hardwareId usado para nomear o ponto de
  // acesso de configuracao e identificar o dispositivo nas chamadas de API.

  uint64_t chipId = ESP.getEfuseMac();
  char macBuf[13];
  snprintf(macBuf, sizeof(macBuf), "%04X%08X", (uint16_t)(chipId >> 32), (uint32_t)chipId);
  hardwareId = String(macBuf);

  Serial.print("Codigo de pareamento deste dispositivo: ");
  Serial.println(hardwareId);

  // ===================================================
  // WI-FI (portal de configuracao via WiFiManager)
  // ===================================================

  WiFiManager wm;

  // Janela de alguns segundos logo no boot para apagar o Wi-Fi salvo: da tempo
  // do usuario ler a mensagem e so entao pressionar e segurar o botao BOOT
  // (nao precisa ja estar segurando antes de ligar a placa).
  Serial.println("Para apagar o Wi-Fi salvo, pressione e segure o botao BOOT nos proximos 3s...");
  delay(3000);
  if (digitalRead(pinoBotaoReset) == LOW) {
    Serial.println("Botao BOOT pressionado: apagando Wi-Fi salvo...");
    wm.resetSettings();
  }

  // Exibe o codigo de pareamento diretamente na pagina do portal, para que o
  // usuario nao precise abrir o Serial Monitor em nenhum momento.
  String infoHtml =
    "<p style='font-size:16px;margin-bottom:4px'>Codigo de pareamento deste dispositivo:</p>"
    "<p style='font-size:22px;font-weight:bold;letter-spacing:2px;margin-top:0'>" + hardwareId + "</p>"
    "<p style='font-size:13px'>Anote esse codigo — ele sera pedido na aplicacao web para vincular esta tomada a sua conta.</p>";
  WiFiManagerParameter infoParam(infoHtml.c_str());
  wm.addParameter(&infoParam);

  wm.setConfigPortalTimeout(300);  // 5 min tentando configurar antes de reiniciar e tentar de novo

  String apName = "SmartPlug-" + hardwareId.substring(6);  // últimos 6 chars do MAC, nome curto

  Serial.println("Conectando ao Wi-Fi salvo (ou abrindo portal de configuracao)...");
  Serial.print("Se necessario, conecte-se ao Wi-Fi \"");
  Serial.print(apName);
  Serial.println("\" para configurar.");

  bool conectado = wm.autoConnect(apName.c_str(), apSenhaPortal);

  if (!conectado) {
    Serial.println("Nao foi possivel conectar ao Wi-Fi. Reiniciando...");
    delay(2000);
    ESP.restart();
  }

  Serial.println();
  Serial.println("Wi-Fi conectado!");

  Serial.print("Endereco IP do ESP32: ");
  Serial.println(WiFi.localIP());

  wifiClient.setInsecure();
  Serial.println("HTTPS configurado.");

  apiURL = String(apiBaseURL) + hardwareId + "/readings";
  apiControlURL = String(apiBaseURL) + hardwareId + "/control";

  Serial.println("========================================");
  Serial.print("CODIGO DE PAREAMENTO: ");
  Serial.println(hardwareId);
  Serial.println("Digite esse codigo no app para vincular");
  Serial.println("esta tomada a sua conta.");
  Serial.println("========================================");


  tempoAnterior = millis();

  delay(2000);
}


// =====================================================
// LOOP
// =====================================================

void loop() {

  // ===================================================
  // 1. CALCULAR OFFSET
  // ===================================================

  double somaOffset = 0;


  for (int i = 0; i < amostrasOffset; i++) {

    somaOffset += analogRead(pinoSensor);

    delayMicroseconds(100);
  }


  double offsetADC =
    somaOffset / amostrasOffset;


  double offsetVolts =
    offsetADC * (3.3 / 4095.0);

  offsetAtual = offsetVolts;


  // ===================================================
  // 2. CAPTURAR SINAL
  // ===================================================

  double somaSeno = 0;
  double somaCosseno = 0;


  unsigned long inicio = micros();


  for (int i = 0; i < amostras; i++) {

    while (
      micros() - inicio <
      (unsigned long)
      (i * periodoAmostragem * 1000000.0)
    ) {

    }


    int leitura =
      analogRead(pinoSensor);


    // Remove offset

    double sinalADC =
      leitura - offsetADC;


    // ADC → tensão

    double sinalVolts =
      sinalADC * (3.3 / 4095.0);


    // tensão → corrente

    double sinalCorrente =
      sinalVolts / sensibilidade;


    // tempo da amostra

    double tempo =
      i * periodoAmostragem;


    // ângulo de 60 Hz

    double angulo =
      2.0 *
      PI *
      frequenciaRede *
      tempo;


    somaSeno +=
      sinalCorrente *
      sin(angulo);


    somaCosseno +=
      sinalCorrente *
      cos(angulo);
  }


  // ===================================================
  // 3. COMPONENTE 60 Hz
  // ===================================================

  double componenteSeno =
    (2.0 / amostras) *
    somaSeno;


  double componenteCosseno =
    (2.0 / amostras) *
    somaCosseno;


  double amplitude60Hz =
    sqrt(
      componenteSeno *
      componenteSeno +

      componenteCosseno *
      componenteCosseno
    );


  // ===================================================
  // 4. CORRENTE RMS
  // ===================================================

  double correnteRMS =
    amplitude60Hz /
    sqrt(2.0);


  // ===================================================
  // 5. FILTRO
  // ===================================================

  if (correnteRMS < 0.05) {

    correnteRMS = 0.0;
  }


  correnteAtual =
    correnteRMS;


  // ===================================================
  // 6. POTÊNCIA
  // ===================================================

  double potencia =
    tensaoRede *
    correnteRMS;


  potenciaAtual =
    potencia;


  // ===================================================
  // 7. TEMPO
  // ===================================================

  unsigned long tempoAtual =
    millis();


  double deltaTempoHoras =
    (tempoAtual - tempoAnterior)
    / 3600000.0;


  tempoAnterior =
    tempoAtual;


  // ===================================================
  // 8. ENERGIA
  // ===================================================

  if (correnteRMS > 0) {

    energia_kWh +=
      (potencia *
       deltaTempoHoras)
      / 1000.0;
  }


  // ===================================================
  // 9. BUSCAR STATUS DO RELÉ NA API
  // ===================================================

  buscarStatusReleAPI();


  // ===================================================
  // 10. ENVIAR DADOS PARA API
  // ===================================================

  enviarDadosAPI(correnteAtual, potenciaAtual, energia_kWh, releStatus);


  // ===================================================
  // 11. SERIAL
  // ===================================================

  Serial.println();

  Serial.println("----------------------------------------");

  Serial.print("Offset: ");
  Serial.print(offsetAtual, 4);
  Serial.println(" V");

  Serial.print("Corrente RMS: ");
  Serial.print(correnteAtual, 4);
  Serial.println(" A");


  Serial.print("Potencia estimada: ");
  Serial.print(potenciaAtual, 2);
  Serial.println(" W");


  Serial.print("Energia: ");
  Serial.print(energia_kWh, 6);
  Serial.println(" kWh");

  Serial.print("Status Rele: ");
  Serial.println(releStatus ? "LIGADO" : "DESLIGADO");

  Serial.println("----------------------------------------");


  delay(1000);
}