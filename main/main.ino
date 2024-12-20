#include "DHT.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>


#define DHTPIN 25    // Pin untuk sensor DHT22
#define FLAMEPIN 13  // Pin untuk sensor flame (flame sensor)
#define MQAPIN 32    // Pin untuk sensor gas (MQ sensor)
#define DHTTYPE DHT22
#define BUZZERPIN 22
#define PUMPPIN 15
#define kalibrasimq2 10.29
#define VCC 3.3
#define RL 10.0
#define ADC_MAX 4095


#define MQTT_SERVER "23.95.68.195"
#define MQTT_PORT 1883


// Batasan Sensor dan Fuzzy Logic ()
#define TEMP_SAFE 25.0      // Suhu aman (Celsius)
#define TEMP_WARNING 35.0   // Batas peringatan suhu
#define TEMP_DANGER 45.0    // Batas bahaya suhu
#define TEMP_CRITICAL 55.0  // Batas kritis suhu


#define HUM_VERY_LOW 10   // Kelembaban sangat rendah
#define HUM_LOW 20        // Kelembaban rendah
#define HUM_OPTIMAL 50.0    // Kelembaban normal
#define HUM_HIGH 70.0       // Kelembaban tinggi
#define HUM_VERY_HIGH 90.0  // Kelembaban sangat tinggi2


#define GAS_SAFE 0     // Level gas aman
#define GAS_WARNING 20   // Level gas peringatan
#define GAS_DANGER 50   // Level gas bahaya
#define GAS_CRITICAL 80  // Level gas kritis


#define FLAME_DEBOUNCE 3  // Jumlah minimal deteksi api untuk konfirmasi
#define HIGH_RISK_TIME 5  // Jumlah interval untuk peringatan risiko tinggi

#define RL_VALUE (5)                // Load resistance in kilo ohms
#define RO_CLEAN_AIR_FACTOR (9.83)  // Clean air factor for Ro calculation





/********Software Related Macros*************/
#define CALIBRATION_SAMPLE_TIMES (50)      // Number of samples for calibration
#define CALIBRATION_SAMPLE_INTERVAL (500)  // Time interval in milliseconds for calibration
#define READ_SAMPLE_TIMES (5)              // Number of samples for reading
#define READ_SAMPLE_INTERVAL (50)          // Time interval in milliseconds for reading


/**********Globals****************/
float SmokeCurve[3] = { 2.3, 0.53, -0.44 };  // Data for smoke curve
float Ro = 10;                               // Initialize Ro to 10 kilo ohms
float rs_ro_ratio;
int smoke_ppm;




TaskHandle_t taskMQCalibration = NULL;


char ssid[] = "Gw";
char password[] = "1234567899";
char mqtt_user[] = "gebanglor";
char mqtt_password[] = "pusatteknologi";


DHT dht(DHTPIN, DHTTYPE);
float temperature, humidity;
int gas_ppm;
float ppm;
int flameDetected = false;
int highRiskCount = 0;
int buzzerStatus = 0;
int pumpStatus = false;




// Variabel Status
String systemStatus = "NORMAL";
String detailedStatus = "";
float riskLevel = 0.0;  // Level risiko dalam Fuzzy (0-1)


WiFiClient espClient;
PubSubClient client(espClient);




int MQGetGasPercentage(float rs_ro_ratio, float *curve) {


 float iki = pow(10, (((log(rs_ro_ratio) - curve[1]) / curve[2]) + curve[0]));
 // Serial.println("ppm e" + String(iki));
 //  if (rs_ro_ratio <= 0) // Prevent invalid log operations
 //         return 0;
 return iki;
}


float MQCalibration(int MQPIN) {
 float val = 0;
 for (int i = 0; i < CALIBRATION_SAMPLE_TIMES; i++) {
   Serial.println("baca piro " + String(analogRead(MQPIN)));
   val += MQResistanceCalculation(analogRead(MQPIN));
   vTaskDelay(CALIBRATION_SAMPLE_INTERVAL / portTICK_PERIOD_MS);
 }
 val /= CALIBRATION_SAMPLE_TIMES;
 val /= RO_CLEAN_AIR_FACTOR;
 return val;
}




float MQResistanceCalculation(int raw_adc) {
 float hasil;
 // float normalized_adc = raw_adc / 4095.0 * 1023.0;
 // hasil =  ((float)RL_VALUE * (1023 - normalized_adc) / normalized_adc);
 // Serial.println("RAW ADC " + String(raw_adc));
 hasil = ((float)RL_VALUE * (1023 - raw_adc) / raw_adc);
 // Serial.println("hasil e " + String(hasil));
 return hasil;
}


void vTaskMQCalibration(void *param) {
 for (;;) {
   analogReadResolution(10);
   Serial.println("Calibrating...");
   Ro = MQCalibration(MQAPIN);  // Calibrate sensor in clean air
   if (Ro < 3) {
     Ro = MQCalibration(MQAPIN);
   }
   Serial.println("Calibration done.");
   Serial.print("Ro=");
   Serial.print(Ro);
   Serial.println(" kohm");
   xTaskCreate(vTaskDHT, "dht22", 3072, NULL, 1, NULL);
   xTaskCreate(vTaskMQ2, "mq2", 3072, NULL, 1, NULL);
   xTaskCreate(vTaskFLAME, "flame", 3072, NULL, 1, NULL);
   xTaskCreate(vTaskSHOW, "show", 4056, NULL, 2, NULL);
   xTaskCreate(vTaskMQTT, "mqtt", 5000, NULL, 2, NULL);
   xTaskCreate(vTaskACTION, "action", 2048, NULL, 2, NULL);
   vTaskDelete(taskMQCalibration);
 }
}

void vTaskACTION(void *param) {
 for (;;) {
   if (buzzerStatus == 1) {
     tone(BUZZERPIN, 800);
     vTaskDelay(400 / portTICK_PERIOD_MS);
     tone(BUZZERPIN, 0);
     vTaskDelay(400 / portTICK_PERIOD_MS);
     digitalWrite(PUMPPIN, LOW);
   } else if (buzzerStatus == 2) {
     for (int i = 0; i < 15; i++) {
       digitalWrite(PUMPPIN, HIGH);
       tone(BUZZERPIN, 500);
       vTaskDelay(500 / portTICK_PERIOD_MS);
       tone(BUZZERPIN, 1000);
       vTaskDelay(500 / portTICK_PERIOD_MS);
     }
     tone(BUZZERPIN, 0);
   } else {
     tone(BUZZERPIN, 0);
     digitalWrite(PUMPPIN, LOW);
   }
   tone(BUZZERPIN, 0);
   vTaskDelay(1000 / portTICK_PERIOD_MS);
 }
}

float calcMembership(float value, float low, float high, bool isAscending) {
 if (isAscending) {
   if (value <= low) return 0.0;
   if (value >= high) return 1.0;
   return (value - low) / (high - low);
 } else {
   if (value <= low) return 1.0;
   if (value >= high) return 0.0;
   return (high - value) / (high - low);
 }
}


// Evaluasi suhu pake Fuzzy Logic
float evalTemp(float temp) {
 float risk = 0.0;
 // Menghitung tingkat keanggotaan buat setiap kategori temperatur
 float normalMembership = calcMembership(temp, TEMP_SAFE, TEMP_WARNING, false);
 float warningMembership = calcMembership(temp, TEMP_WARNING, TEMP_DANGER, true);
 float dangerMembership = calcMembership(temp, TEMP_DANGER, TEMP_CRITICAL, true);
 // Menghitung risiko berdasarkan tingkat keanggotaan
 risk = max(warningMembership * 0.5, dangerMembership * 1.0);
 return risk;
}


// Evaluasi kelembaban pake Fuzzy Logic
float evalHumidity(float hum) {
 float risk = 0.0;
 // Menghitung tingkat keanggotaan buat setiap kategori kelembaban
 float veryLowMembership = calcMembership(hum, HUM_VERY_LOW, HUM_LOW, false);
 float lowMembership = calcMembership(hum, HUM_LOW, HUM_OPTIMAL, false);
 float highMembership = calcMembership(hum, HUM_OPTIMAL, HUM_HIGH, true);
 float veryHighMembership = calcMembership(hum, HUM_HIGH, HUM_VERY_HIGH, true);


 // Menghitung risiko berdasarkan tingkat keanggotaan
 risk = max(veryLowMembership * 0.8, lowMembership * 0.2);


 return risk;
}


// Evaluasi level gas pake Fuzzy Logic
float evalGas(int gas) {
 float risk = 0.0;


 // Menghitung tingkat keanggotaan buat setiap kategori gas
 float safeMembership = calcMembership(gas, GAS_SAFE, GAS_WARNING, false);
 float warningMembership = calcMembership(gas, GAS_WARNING, GAS_DANGER, true);
 float dangerMembership = calcMembership(gas, GAS_DANGER, GAS_CRITICAL, true);


 // Menghitung risiko berdasarkan tingkat keanggotaan
 risk = max(warningMembership * 0.6, dangerMembership * 1.0);


 return risk;
}


// Fungsi untuk mengevaluasi risiko keseluruhan
void evalAverage() {
 float tempRisk = evalTemp(temperature);
 float humRisk = evalHumidity(humidity);
 float gasRisk = evalGas(gas_ppm);
 // Menghitung risiko keseluruhan dengan pembobotan dari hasil yang didapat
 riskLevel = (tempRisk * 0.3 + humRisk * 0.2 + gasRisk * 0.6);
 // Meningkatkan risiko jika api terdeteksi
 if (flameDetected) {
   riskLevel = min(1.0, riskLevel + 0.5);
 }
 // Menentukan status sistem berdasarkan level risiko
 if (riskLevel >= 0.8) {
   systemStatus = "CRITICAL";
   detailedStatus = "KOBONGAN!!!!!!";
   buzzerStatus = 2;
   pumpStatus = true;
 } else if (riskLevel >= 0.5) {
   systemStatus = "DANGER";
   detailedStatus = "Kondisi berbahaya.";
   buzzerStatus = 1;
   pumpStatus = false;
 } else if (riskLevel >= 0.3) {
   systemStatus = "WARNING";
   detailedStatus = "Waspada";
   buzzerStatus = 0;
   pumpStatus = false;
   // enek sek salah
 } else {
   systemStatus = "NORMAL";
   detailedStatus = "Kondisi normal";
   buzzerStatus = 0;
   pumpStatus = false;
 }
}
// Fungsi untuk mendapatkan rekomendasi tindakan
String getActionRecommendation() {
 String actions = "Rekomendasi: ";
 if (evalTemp(temperature) > 0.5) {
   actions += "Aktifkan pendinginan; ";
 }
 if (evalHumidity(humidity) > 0.5) {
   if (humidity > HUM_OPTIMAL) {
     actions += "Aktifkan dehumidifier; ";
   } else {
     actions += "Aktifkan humidifier; ";
   }
 }
 if (evalGas(gas_ppm) > 0.3) {
   actions += "Tingkatkan ventilasi; ";
 }
 if (flameDetected) {
   actions += "AKTIVASI SISTEM PEMADAM API!";
 }


 return actions;
}


void reconnect() {
 while (!client.connected()) {
   Serial.print("Attempting MQTT connection...");
   if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
     Serial.println("connected");
   } else {
     Serial.print("failed, rc=");
     Serial.print(client.state());
     Serial.println(" try again in 5 seconds");
     vTaskDelay(5000 / portTICK_PERIOD_MS);
   }
 }
}




void setup_wifi() {
 Serial.println();
 Serial.print("Connecting to ");
 Serial.println(ssid);


 WiFi.begin(ssid, password);


 while (WiFi.status() != WL_CONNECTED) {
   vTaskDelay(500 / portTICK_PERIOD_MS);
   Serial.print(".");
 }


 Serial.println("");
 Serial.println("WiFi connected");
 Serial.println("IP address: ");
 Serial.println(WiFi.localIP());
}




void vTaskDHT(void *param) {


 for (;;) {
   float newTemp = dht.readTemperature();
   float newHum = dht.readHumidity();


   if (!isnan(newTemp) && !isnan(newHum)) {
     temperature = newTemp;
     humidity = newHum;
   }
   vTaskDelay(500 / portTICK_PERIOD_MS);
 }
}


void vTaskMQ2(void *param) {
 //
 for (;;) {
   analogReadResolution(10);
   int raw_adc = analogRead(MQAPIN);
   float rs = MQResistanceCalculation(raw_adc);
   rs_ro_ratio = rs / Ro;
   gas_ppm = MQGetGasPercentage(rs_ro_ratio, SmokeCurve);


   // Serial.print("Smoke ppm: ");
    vTaskDelay(500 / portTICK_PERIOD_MS);
 }
}


void vTaskFLAME(void *param) {
 for (;;) {
   int flameCount = 0;  
   for (int i = 0; i < 5; i++) {
     if (digitalRead(FLAMEPIN) == LOW) { 
       flameCount++;
     }
     vTaskDelay(20 / portTICK_PERIOD_MS);  
   }

   if (flameCount >= 3) {
     flameDetected = 1;  
   } else {
     flameDetected = 0;  
   }

   vTaskDelay(500 / portTICK_PERIOD_MS);
 }
}




void vTaskSHOW(void *param) {
 for (;;) {
   evalAverage();
   String recommendations = getActionRecommendation();
   Serial.println("\n=== Status Sensor ===");
   Serial.println("Suhu: " + String(temperature, 1) + "°C (Risk: " + String(evalTemp(temperature), 2) + ")");
   Serial.println("Kelembaban: " + String(humidity, 1) + "% (Risk: " + String(evalHumidity(humidity), 2) + ")");
   Serial.println("Level PPM Gas: " + String(gas_ppm) + " (Risk: " + String(evalGas(gas_ppm), 2) + ")");
   Serial.println("Api: " + String(flameDetected ? "TERDETEKSI" : "TIDAK TERDETEKSI"));
   Serial.println("Status Sistem: " + systemStatus);
   Serial.println("Level Risiko: " + String(riskLevel, 2));
   Serial.println("Status Detail: " + detailedStatus);
   Serial.println("Pompa: " + String(pumpStatus ? "HIDUP" : "MATI"));
   Serial.println(recommendations);
   Serial.println("==================\n");
   vTaskDelay(1000 / portTICK_PERIOD_MS);
 }
}


void vTaskMQTT(void *param) {
 for (;;) {
   if (WiFi.status() != WL_CONNECTED) {
     setup_wifi();
   } else if (!client.connected()) {
     reconnect();
   }
   client.loop();
   evalAverage();
   DynamicJsonDocument doc(3072);
   JsonObject sensor = doc.createNestedObject("sensor");
   sensor["temperature"] = temperature;
   sensor["humidity"] = humidity;
   sensor["gas"] = gas_ppm;
   sensor["flame"] = flameDetected ? 1 : 0;
   JsonObject systemStatusObj = doc.createNestedObject("system_status");
   systemStatusObj["status"] = systemStatus;
   systemStatusObj["risk_level"] = riskLevel;
   systemStatusObj["detailed_status"] = detailedStatus;
   JsonObject risk = doc.createNestedObject("risk");
   risk["temperature_risk"] = evalTemp(temperature);
   risk["humidity_risk"] = evalHumidity(humidity);
   risk["gas_risk"] = evalGas(gas_ppm);
   char jsonBuffer[3072];
   serializeJson(doc, jsonBuffer);
   size_t jsonSize = strlen(jsonBuffer);
   Serial.print("JSON size: ");
   Serial.println(jsonSize);
   bool success = client.publish("system/ruangps", jsonBuffer);
   if (!success) {
     Serial.print("Failed to publish JSON data to MQTT: ");
     Serial.println(client.state());
   }
   vTaskDelay(1000 / portTICK_PERIOD_MS);
 }
}


void setup() {
 Serial.begin(115200);
 setup_wifi();
 client.setServer(MQTT_SERVER, MQTT_PORT);
 pinMode(FLAMEPIN, INPUT);
 pinMode(PUMPPIN, OUTPUT);
 dht.begin();
xTaskCreate(vTaskMQCalibration, "MQCalibration", 4056, NULL, 1, &taskMQCalibration);
}


void loop() {
}
