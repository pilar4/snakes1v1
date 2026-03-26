let socket: WebSocket;
let messageCallback: (msg: any) => void = () => {};

export function connect() { 
  const isProduction = window.location.hostname.includes('onrender.com');

  const productionUrl = 'wss://snakes1v1-server-eu.onrender.com'; 
  const localUrl = 'ws://localhost:3000'; 

  // 2. Flip the logic: If it's production, use production. Otherwise, local.
  const serverUrl = isProduction ? productionUrl : localUrl;
  
  console.log(`[Socket] Target: ${serverUrl} (Host: ${window.location.hostname})`);
  
  socket = new WebSocket(serverUrl);

  socket.onopen = () => {
    console.log('[Socket] Connected to server successfully!');
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log('[Socket] Received message:', msg);
    messageCallback(msg);
  };

  socket.onerror = (error) => {
    console.error('[Socket] WebSocket Error:', error);
  };
  
  socket.onclose = () => {
    console.log('[Socket] Connection closed.');
  };
}

export function sendMessage(msg: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('[Socket] Sending message:', msg);
    socket.send(JSON.stringify(msg));
  } else {
    console.warn('[Socket] Tried to send message, but socket is not open!', msg);
  }
}

export function onMessage(callback: (msg: any) => void) {
  messageCallback = callback;
}