const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server started on port 8080');

wss.on('connection', (ws) => {
  console.log('New client connected');
  let updateInterval = 1000; // Default interval

  // Send updates based on the configured interval
  let intervalId = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const securityId = 'AAPL'; // Example security ID
      const price = (Math.random() * 1000).toFixed(2);
      const update = {
        securityId,
        price,
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(update));
    }
  }, updateInterval);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.interval) {
        // Update the interval if received from client
        updateInterval = parseInt(data.interval);
        clearInterval(intervalId);
        console.log('sending update at interval', updateInterval);
        intervalId = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const securityId = 'AAPL';
            const price = (Math.random() * 1000).toFixed(2);
            const update = {
              securityId,
              price,
              timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(update));
          }
        }, updateInterval);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
  });
}); 