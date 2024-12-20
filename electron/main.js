import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isDevelopment = process.env.NODE_ENV !== 'production'

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  console.log('当前环境:', process.env.NODE_ENV)
  console.log('isDevelopment:', isDevelopment)

  if (isDevelopment) {
    console.log('正在加载开发环境URL...')
    win.loadURL('http://localhost:3000')
    // win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../.output/public/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})