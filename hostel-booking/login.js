// login.js
// Handle login form and error display

const urlParams = new URLSearchParams(window.location.search);
const errorMsg = document.getElementById("errorMsg");

if (urlParams.get("error") === "1") {
  errorMsg.style.display = "block";
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {
  // Let the form submit normally, but clear any previous error
  errorMsg.style.display = "none";
});
