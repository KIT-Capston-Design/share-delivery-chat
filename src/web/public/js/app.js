const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaG9uZU51bWJlciI6IjAxMDAwMDAwMDAxIiwicm9sZSI6IlJPTEVfVVNFUiIsImlzcyI6ImtpdGNkLnNoYXJlLWRlbGl2ZXJ5IiwiZXhwIjoxNjU2NDczODI3fQ.0R0C2K1sRp5cCLZe7ji5sYw-Yns2SsDI7rhv5O7ITZY";

const socket = io({
  query: { token },
});

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

//미들웨어에서 err 발생 시 여기로
socket.on("connect_error", (data) => {
  console.log(data.message);
});

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("server is done");
  });

  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
