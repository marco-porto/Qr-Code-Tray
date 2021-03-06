const ipc = require("electron").ipcRenderer;
const { clipboard, nativeImage } = require("electron");
const path = require("path");

//When user press a key inside textarea, IPC send a message to index.js and run QrCodeGenerator function
const input = document.querySelector("#input");
const iframe_qrcode = document.querySelector("#iframeqrcode");

input.addEventListener("change", () => {
  if (input.value != " " && input.value != "" && input.value.length <= 250) {
    ipc.send("runQrCodeGenerator", input.value);
  }
});

//Index.js IPC return a message and render catch that message and reload frame to update qrcode img
ipc.on("QrCode200", (event, args) => {
  if (args) iframe_qrcode.contentDocument.location.reload(true);
});

iframe_qrcode.addEventListener("load", () => {
  iframe_qrcode.style.height =
    iframe_qrcode.contentWindow.document.body.scrollHeight + "px";
  ipc.send("iframeReloadSize", iframe_qrcode.style.height);
});

//Detect Switch theme (dark <=> light)
const themeSwitcher = document.querySelector("#themeSwitcher");
const themeprovider = document.querySelector("#themeprovider");

if (localStorage.thememode == null) {
  themeprovider.href = "./assets/css/theme-light.css";
  themeSwitcher.src = "./assets/images/dark.svg";
  localStorage.setItem("thememode", "light");
} else {
  themeprovider.href = "./assets/css/theme-" + localStorage.thememode + ".css";
  themeSwitcher.src =
    "./assets/images/" +
    (localStorage.thememode == "light" ? "dark" : "light") +
    ".svg";
}

ipc.send("ThemeMode", localStorage.thememode);

themeSwitcher.addEventListener("click", () => {
  localStorage.setItem(
    "thememode",
    localStorage.thememode == "light" ? "dark" : "light"
  );
  themeprovider.href = "./assets/css/theme-" + localStorage.thememode + ".css";
  themeSwitcher.src =
    "./assets/images/" +
    (localStorage.thememode == "light" ? "dark" : "light") +
    ".svg";

  ipc.send("ThemeMode", localStorage.thememode);
});

//Detect Copy to clipboard qrcode
const btncopy = document.querySelector("#copy");
btncopy.addEventListener("click", () => {
  clipboard.writeImage(
    nativeImage.createFromPath(path.join(__dirname,"/view-engine/Qrcode.png"))
  );
  btncopy.innerHTML = "Copied";
  setTimeout(() => {
    btncopy.innerHTML = "Copy to clipboard";
  }, 500);
});

//Quit app on click "close app"
const btnquit = document.querySelector("#quit");
btnquit.addEventListener("click", () => {
  ipc.send("QuitApp", true);
});   