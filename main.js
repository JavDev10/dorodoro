const { app, BrowserWindow } = require('electron')
const path = require('path')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 500,
    resizable: false,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, 'img', 'icon_app2.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false
    }
  })

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
