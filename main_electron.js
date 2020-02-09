const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Erstelle das Browser-Fenster.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      devTools: true
    }
  })

  win.removeMenu();

  // und lade die index.html der App.
  win.loadFile('index.html')
  win.webContents.openDevTools()
}

//app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');

app.on('ready', createWindow)