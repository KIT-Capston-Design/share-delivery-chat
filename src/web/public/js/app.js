const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50SWQiOjEsInBob25lTnVtYmVyIjoiMDEwMDAwMDAwMDEiLCJyb2xlIjoiUk9MRV9VU0VSIiwiaXNzIjoia2l0Y2Quc2hhcmUtZGVsaXZlcnkiLCJleHAiOjE2NTY1MDI0Mjd9.gzW_MYwJfzErl0kpj0G5zao5ZPdGOUYCoStt91jF_q4";

const socket = io({
  query: { token },
});

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

socket.on("connect", () => {
  console.log("socket connected"); // true
});
//서버 미들웨어에서 err 발생 시 여기로
socket.on("connect_error", (data) => {
  console.log(data.message);
});

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  socket.emit("enter_room", { payload: input.value }, (result) => {
    console.log(result);
  });

  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
