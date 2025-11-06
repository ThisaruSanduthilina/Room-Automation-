#include <WiFi.h>
#include <FirebaseESP8266.h>
#include "secrets.h"

/* ====== GLOBAL OBJECTS ====== */
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/* ====== LED (Relay) PINS ====== */
#define LED1 D1
#define LED2 D2
#define LED3 D3
#define LED4 D4

void setup() {
  Serial.begin(115200);

  /* ====== WIFI ====== */
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected");
  Serial.println(WiFi.localIP());

  /* ====== FIREBASE CONFIG ====== */
  config.host = FIREBASE_HOST;       
  config.signer.tokens.legacy_token = DATABASE_SECRET; 

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  /* ====== RELAY PIN SETUP ====== */
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);

  // Default OFF at startup
  digitalWrite(LED1, HIGH);
  digitalWrite(LED2, HIGH);
  digitalWrite(LED3, HIGH);
  digitalWrite(LED4, HIGH);
}

void loop() {
  // LED 1
  if (Firebase.getInt(fbdo, "/LEDs/LED1")) {
    digitalWrite(LED1, !fbdo.intData());
    Serial.print("LED1: ");
    Serial.println(fbdo.intData() == 1 ? "ON" : "OFF");
  }

  // LED 2
  if (Firebase.getInt(fbdo, "/LEDs/LED2")) {
    digitalWrite(LED2, !fbdo.intData());
    Serial.print("LED2: ");
    Serial.println(fbdo.intData() == 1 ? "ON" : "OFF");
  }

  // LED 3
  if (Firebase.getInt(fbdo, "/LEDs/LED3")) {
    digitalWrite(LED3, !fbdo.intData());
    Serial.print("LED3: ");
    Serial.println(fbdo.intData() == 1 ? "ON" : "OFF");
  }

  // LED 4
  if (Firebase.getInt(fbdo, "/LEDs/LED4")) {
    digitalWrite(LED4, !fbdo.intData());
    Serial.print("LED4: ");
    Serial.println(fbdo.intData() == 1 ? "ON" : "OFF");
  }

  delay(100);
}
