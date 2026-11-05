const int LED_PIN = 9;   // PWM(~) 핀: 3, 5, 6, 9, 10, 11 중 하나

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);           // 한 줄 읽을 때 오래 기다리지 않도록
  pinMode(LED_PIN, OUTPUT);
  analogWrite(LED_PIN, map(50, 0, 100, 0, 255));  // 슬라이더 초기값 50과 맞춤
}

void loop() {
  if (Serial.available() > 0) {
    String line = Serial.readStringUntil('\n');
    line.trim();                   // \r, 공백 제거

    if (line.length() > 0) {
      int value = constrain(line.toInt(), 0, 100);
      int brightness = map(value, 0, 100, 0, 255);
      analogWrite(LED_PIN, brightness);
    }
  }
}
