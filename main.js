const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let win;
const defaults = { charts: [], handovers: [], parties: {}, settings: { admin:'', howrah:'', tata:'' } };
const dataDir = () => path.join(app.getPath('userData'), 'Modern Courier Staff Chart Data');
const dataFile = () => path.join(dataDir(), 'staff-chart-data.json');
const podDir = () => path.join(dataDir(), 'POD');
function ensure(){ fs.mkdirSync(podDir(), {recursive:true}); if(!fs.existsSync(dataFile())) fs.writeFileSync(dataFile(), JSON.stringify(defaults,null,2)); }
function read(){ ensure(); try{return {...defaults,...JSON.parse(fs.readFileSync(dataFile(),'utf8'))};}catch{return structuredClone(defaults);} }
function write(data){ ensure(); const tmp=dataFile()+'.tmp'; fs.writeFileSync(tmp,JSON.stringify(data,null,2)); fs.renameSync(tmp,dataFile()); return data; }
function createWindow(){
  win=new BrowserWindow({width:1500,height:950,minWidth:1050,minHeight:700,title:'Modern Courier Staff Chart',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});
  win.loadFile('index.html');
}
app.whenReady().then(()=>{ensure();createWindow();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
ipcMain.handle('db:get',()=>read());
ipcMain.handle('db:save',(_e,data)=>write(data));
ipcMain.handle('pod:add',async(_e,cn)=>{const x=await dialog.showOpenDialog(win,{title:'SELECT POD',properties:['openFile','multiSelections'],filters:[{name:'POD',extensions:['pdf','jpg','jpeg','png','webp']}]});if(x.canceled)return[];ensure();return x.filePaths.map((src,i)=>{const ext=path.extname(src);const dest=path.join(podDir(),`${String(cn||'CN').replace(/[^a-z0-9-]/gi,'_')}_${Date.now()}_${i+1}${ext}`);fs.copyFileSync(src,dest);return dest;});});
ipcMain.handle('file:open',(_e,p)=>shell.openPath(p));
ipcMain.handle('whatsapp:open',(_e,{phone,message})=>shell.openExternal(`https://wa.me/91${String(phone||'').replace(/\D/g,'').slice(-10)}?text=${encodeURIComponent(message||'')}`));
ipcMain.handle('data:folder',()=>shell.openPath(dataDir()));
ipcMain.handle('backup:save',async()=>{const x=await dialog.showSaveDialog(win,{defaultPath:`MCS_STAFF_CHART_BACKUP_${new Date().toISOString().slice(0,10)}.json`});if(x.canceled)return false;fs.copyFileSync(dataFile(),x.filePath);return true;});
ipcMain.handle('backup:restore',async()=>{const x=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Backup',extensions:['json']}]});if(x.canceled)return false;JSON.parse(fs.readFileSync(x.filePaths[0],'utf8'));fs.copyFileSync(x.filePaths[0],dataFile());return true;});
