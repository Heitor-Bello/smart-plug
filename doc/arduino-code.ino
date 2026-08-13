#include <WiFi.h>
#include <HTTPClient.h>
#include <math.h>

// =====================================================
// WI-FI
// =====================================================

const char* ssid = "VIVOFIBRA-8D81";
const char* password = "amigao2022";

WiFiClient wifiClient;

// URLs da API
const char* apiURL = "https://smart-plug-woad.vercel.app/api/devices/<id-device>/readings";
const char* apiControlURL = "https://smart-plug-woad.vercel.app/api/devices/<id-device>/control";


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
  
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(wifiClient, apiURL);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"corrente\":" + String(correnteRMS, 4) + ",";
    json += "\"potencia\":" + String(potencia, 2) + ",";
    json += "\"energia\":" + String(energia_kWh, 6) + ",";
    json += "\"rele\":" + String(statusRele ? "true" : "false");
    json += "}";

    Serial.println("Enviando dados para API...");
    Serial.println(json);

    int httpResponseCode = http.POST(json);

    Serial.print("Resposta servidor: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi desconectado. Nao foi possivel enviar.");
  }
}


// =====================================================
// BUSCA STATUS DO RELÉ NA API
// =====================================================

void buscarStatusReleAPI() {
  
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(wifiClient, apiControlURL);
    http.addHeader("Content-Type", "application/json");

    Serial.println("Buscando status do rele na API...");

    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String resposta = http.getString();
      Serial.println("Resposta: " + resposta);

      // Verifica se a resposta contém "ligado": true ou false
      if (resposta.indexOf("\"ligado\":true") != -1 || resposta.indexOf("\"ligado\": true") != -1) {
        releStatus = true;
      } else if (resposta.indexOf("\"ligado\":false") != -1 || resposta.indexOf("\"ligado\": false") != -1) {
        releStatus = false;
      }

      // Aplica o estado no pino
      digitalWrite(pinoRele, releStatus ? HIGH : LOW);
      
      Serial.print("Status rele atualizado: ");
      Serial.println(releStatus ? "LIGADO" : "DESLIGADO");
    } else {
      Serial.print("Erro ao buscar status: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi desconectado. Nao foi possivel buscar status.");
  }
}



void setup() {

  Serial.begin(115200);

  pinMode(pinoRele, OUTPUT);

  // Mantém o relé ligado
  digitalWrite(pinoRele, HIGH);


  // ===================================================
  // WI-FI
  // ===================================================

  Serial.println();
  Serial.println("========================================");
  Serial.println("INICIANDO SISTEMA");
  Serial.println("========================================");

  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(ssid);


  WiFi.begin(ssid, password);


  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }


  Serial.println();
  Serial.println("Wi-Fi conectado!");

  Serial.print("Endereco IP do ESP32: ");
  Serial.println(WiFi.localIP());


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
  // 9. ENVIAR DADOS PARA API
  // ===================================================

  enviarDadosAPI(correnteAtual, potenciaAtual, energia_kWh, releStatus);


  // ===================================================
  // 10. BUSCAR STATUS DO RELÉ NA API
  // ===================================================

  buscarStatusReleAPI();


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