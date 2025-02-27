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

ipcMain.on('launch-item', (event, filePath) => {
  const { exec } = require('child_process');  
  const fs = require('fs');

  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      // 使用open命令启动应用程序或打开文件
      exec(`open "${filePath}"`, (error) => {
        if (error) {
          console.error('启动失败:', error);
          event.reply('launch-error', error.message);
        }
      });
    } else {
      console.error('文件或目录不存在:', filePath);
      event.reply('launch-error', '文件或目录不存在');
    }
  } catch (error) {
    console.error('处理文件路径时出错:', error);
    event.reply('launch-error', error.message);
  }
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