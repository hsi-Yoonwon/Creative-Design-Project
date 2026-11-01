let slider;
let port;
let writer;
let lastValue = -1;   // 마지막으로 보낸 값

function setup() {
  createCanvas(400, 200);

  // 슬라이더 (최소 0, 최대 255, 시작값 0)
  slider = createSlider(0, 255, 0);
  slider.position(100, 100);

  // 연결 버튼
  let button = createButton('아두이노 연결');
  button.position(150, 150);
  button.mousePressed(connect);
}

function draw() {
  let value = slider.value();

  background(value);   // 밝기만큼 화면도 밝아짐
  fill(255, 0, 0);
  text('밝기: ' + value, 170, 80);

  // 연결되어 있고, 값이 바뀌었을 때만 보내기
  if (writer && value != lastValue) {
    writer.write(new TextEncoder().encode(value + '\n'));
    lastValue = value;
  }
}

// 아두이노 연결
async function connect() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  writer = port.writable.getWriter();
}
