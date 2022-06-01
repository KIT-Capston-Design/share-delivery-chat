const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomId;
let socket;

//emit
form.addEventListener("submit", handleRoomSubmit);

//방 입장 버튼 눌렸을 때 핸들러
function handleRoomSubmit(event) {
  event.preventDefault();
  const inputs = form.querySelectorAll("input"); // roomId : [0], 토큰 :[1] 가져오기
  const roomId = inputs[0].value;
  socketInit(inputs[1].value); //토큰 넘겨서 소켓 연결

  socket.emit("enter_room", { payload: roomId }, (result) => {
    console.log(result);
    if (result.isSuccess) showRoom(roomId);
  });

  inputs[0].value = "";
}

//메시지 전송 버튼 눌렀을 때 핸들러
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");

  const message = input.value;
  input.value = "";

  socket.emit("message", { message }, () => {
    displayMessage(`You : ${message}`); // 성공 시 내 메시지 바로 display
  });
}

// 방 입장 시의 socket 초기화
function socketInit(token) {
  socket = io({
    query: { token },
  });

  // on
  socket.on("connect", () => {
    console.log("socket connected"); // true
  });
  //서버 인증 예외 발생 시 connect_error 이벤트 발생
  socket.on("connect_error", (data) => {
    console.log(data.message);
  });

  socket.on("message", addMessage);
}

//메시지 수신 받은 경우
function addMessage({ accountId, message }) {
  displayMessage(`${accountId} : ${message}`);
}

//단순히 화면에 메시지 추가
function displayMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 방 입장 성공 시 화면 전환
function showRoom(roomId) {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomId}`;

  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}
