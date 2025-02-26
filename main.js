const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 初始化存储
const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC通信处理
ipcMain.on('save-workflow', (event, items) => {
  store.set('workflow-items', items);
});

ipcMain.on('get-workflow', (event) => {
  const items = store.get('workflow-items', []);
  event.reply('workflow-items', items);
});

ipcMain.on('launch-item', (event, command) => {
  require('child_process').exec(command, (error) => {
    if (error) {
      console.error('执行命令失败:', error);
    }
  });
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});