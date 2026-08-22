const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('mcs',{
  get:()=>ipcRenderer.invoke('db:get'), save:d=>ipcRenderer.invoke('db:save',d), addPod:cn=>ipcRenderer.invoke('pod:add',cn),
  openFile:p=>ipcRenderer.invoke('file:open',p), whatsapp:x=>ipcRenderer.invoke('whatsapp:open',x), dataFolder:()=>ipcRenderer.invoke('data:folder'),
  backup:()=>ipcRenderer.invoke('backup:save'), restore:()=>ipcRenderer.invoke('backup:restore')
});
