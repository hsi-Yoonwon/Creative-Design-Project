// p5 슬라이더로 LED 밝기 조절 - 아두이노 코드
// 회로: 9번 핀(PWM, ~) → 220Ω 저항 → LED 긴 다리(+), LED 짧은 다리(-) → GND

const int LED_PIN = 9;   // PWM이 가능한 핀(~ 표시: 3, 5, 6, 9, 10, 11)

void setup() {
  Serial.begin(9600);        // p5와 같은 속도로 맞추기
  pinMode(LED_PIN, OUTPUT);
  analogWrite(LED_PIN, 0);   // 처음엔 꺼진 상태
}

void loop() {
  // p5에서 "123\n" 형태로 숫자가 들어오면 읽기
  if (Serial.available() > 0) {
    int value = Serial.parseInt();       // 숫자 읽기
    if (Serial.read() == '\n') {         // 줄바꿈까지 받았을 때만 적용
      value = constrain(value, 0, 255);  // 0~255 범위로 제한
      analogWrite(LED_PIN, value);       // LED 밝기 설정
    }
  }
}
