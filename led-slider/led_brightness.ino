int ledPin = 9;   // PWM 핀 (~ 표시된 핀)

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    int brightness = Serial.parseInt();   // 숫자 읽기

    if (Serial.read() == '\n') {          // 한 줄이 끝났으면
      analogWrite(ledPin, brightness);    // LED 밝기 적용
    }
  }
}
