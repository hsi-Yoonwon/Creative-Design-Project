// p5 슬라이더로 LED 밝기 조절 - p5.js 코드 (Web Serial API 사용, 크롬/엣지에서 동작)

let slider;
let connectButton;
let port;
let writer;
let lastSent = -1;   // 마지막으로 보낸 값 (같은 값 중복 전송 방지)

function setup() {
  createCanvas(400, 300);

  // 슬라이더: 최소 0, 최대 255, 시작값 0
  slider = createSlider(0, 255, 0);
  slider.position(100, 200);
  slider.style('width', '200px');

  // 아두이노 연결 버튼
  connectButton = createButton('아두이노 연결');
  connectButton.position(150, 240);
  connectButton.mousePressed(connectSerial);

  textAlign(CENTER, CENTER);
}

function draw() {
  let value = slider.value();

  background(30);

  // 화면에 LED 모양으로 밝기 미리보기
  noStroke();
  fill(255, 0, 0, value);     // 슬라이더 값에 따라 투명도 변화
  circle(width / 2, 100, 120);
  stroke(255);
  noFill();
  circle(width / 2, 100, 120);

  // 상태 표시
  noStroke();
  fill(255);
  textSize(16);
  text('밝기: ' + value, width / 2, 180);
  textSize(12);
  text(writer ? '연결됨' : '연결 안 됨', width / 2, 280);

  // 값이 바뀌었을 때만 아두이노로 전송
  if (writer && value !== lastSent) {
    sendValue(value);
    lastSent = value;
  }
}

// 시리얼 포트 연결
async function connectSerial() {
  if (!('serial' in navigator)) {
    alert('이 브라우저는 Web Serial을 지원하지 않아요. 크롬이나 엣지를 사용하세요.');
    return;
  }
  try {
    port = await navigator.serial.requestPort();   // 포트 선택 창
    await port.open({ baudRate: 9600 });           // 아두이노와 같은 속도
    writer = port.writable.getWriter();
    lastSent = -1;                                 // 연결 직후 현재 값 한 번 보내기
    connectButton.html('연결 완료');
  } catch (err) {
    console.error(err);
    alert('연결에 실패했어요: ' + err.message);
  }
}

// 숫자 + 줄바꿈을 아두이노로 보내기 (예: "128\n")
async function sendValue(v) {
  try {
    const data = new TextEncoder().encode(v + '\n');
    await writer.write(data);
  } catch (err) {
    console.error('전송 오류:', err);
  }
}
