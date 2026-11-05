let handPose, video, slider;
let hands = [];
let sliderValue = 50;
let connections;
let port, writer; // 아두이노 시리얼 연결

async function setup() {
  createCanvas(640, 480);
  
  slider = createSlider(0, 100, 50, 1);
  slider.style('writing-mode', 'vertical-rl');
  slider.style('height', '440px');
  slider.style('width', '20px');    
  slider.style('transform: rotate(180deg)'); 
  slider.position(10, 20);
  slider.input(updateSliderValue);
  
  let button = createButton('아두이노 연결');
  button.position(50, 20);
  button.mousePressed(connectArduino);
  
  video = createCapture(VIDEO, {flipped:true});
  video.size(640, 480);
  video.hide();
  
  handPose = await ml5.handPose({maxHands:1, modelType:'lite', flipped:true});
  handPose.detectStart(video, gotHands);
  connections = handPose.getConnections();
}

function draw() {
  image(video, 0, 0, width, height);

  drawSkeletons(hands);
  drawKeyPoints(hands);

  let adjustMode = isGrabMode(hands);
  if (adjustMode) {
    drawConnectedLine(hands);
    let c = slider.value();
    let v = getNormalizedDistance(hands);
    let next = c + 0.3*(v-c); // 부드럽게 조정
    if( abs(v-next) < 1 ) next = v; // 목표에 거의 도달하면 딱 맞춤
    slider.value(next);
  }
  
  sendToArduino(slider.value());
}

function gotHands(results) {
  hands = results;
}

function drawKeyPoints( hs) {
  for (let i = 0; i < hs.length; i++) {
    let hand = hs[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(255, 0, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
}

function drawSkeletons(hs) {
  for (let i = 0; i < hs.length; i++) {
    let hand = hs[i];
    stroke(0, 255, 0);
    strokeWeight(2);
    for (const [a, b] of connections) {
      const start = hand.keypoints[a];
      const end = hand.keypoints[b];
      if (start && end) {
        line(start.x, start.y, end.x, end.y);
      }
    }
  }  
}

// 가운데 손가락을 구부렸는지 확인
function isGrabMode(hs) {
  if( hs == null ) return false;
  if( hs.length == 0) return false;
  let ks = hs[0].keypoints;
  if( ks.length != 21 ) return false;

  let palmLength   = dist(ks[0].x,ks[0].y,ks[9].x,ks[9].y);
  let grabDistance = dist(ks[0].x,ks[0].y,ks[12].x,ks[12].y);
  if( grabDistance > palmLength ) return false;
  return true;
}

function drawConnectedLine(hs) {
  if(hs.length > 0) {
    let hand = hs[0];
    const a = hand.keypoints[4]; // 엄지 끝
    const b = hand.keypoints[8]; // 검지 끝
    stroke(255, 140, 0);
    strokeWeight(4);
    line(a.x,a.y,b.x,b.y);
    noFill();
    circle(a.x,a.y,22);
    circle(b.x,b.y,22);
  }
}

function getNormalizedDistance(hs) {
  if(hs.length > 0) {
    let ks = hs[0].keypoints;
    const a = ks[4]; // 엄지 끝
    const b = ks[8]; // 검지 끝
    const c = ks[0]; // 손목
    const d = ks[9]; // 중지 시작점
    let v = dist(a.x,a.y,b.x,b.y); // 엄지-검지 거리
    let p = dist(c.x,c.y,d.x,d.y); // 손바닥 길이
    let s = round(map(v/p, 0.25, 1.5, 0, 100)); // 0.25: 붙였을 때, 1.5: 쫙 벌렸을 때
    return constrain(s,0,100);
  }
  return 0;
}
  
function updateSliderValue() {
  sliderValue = Number(slider.value());
}

// 버튼을 누르면 아두이노 포트 선택 후 연결
async function connectArduino() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  writer = port.writable.getWriter();
}

// 값이 바뀌었을 때만 "값\n" 형식으로 전송
let lastSent = -1;
function sendToArduino(v) {
  if( writer == null ) return;
  if( v == lastSent ) return;
  writer.write(new TextEncoder().encode(v + '\n'));
  lastSent = v;
}
