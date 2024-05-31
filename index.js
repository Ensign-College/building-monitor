const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('./client/build'));
app.use(cors());
app.use(express.json());

let sectorStatus = {
  sector1: 'green',
  sector2: 'green',
  sector3: 'green',
  sector4: 'green',
  sector5: 'green',
  sector6: 'green',
  sector7: 'green',
  sector8: 'green',
  sector9: 'green',
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(sectorStatus));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    sectorStatus = { ...sectorStatus, ...data };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sectorStatus));
      }
    });
  });
});

app.post('/update-sector', (req, res) => {
  const { sector, status } = req.body;
  if (sector in sectorStatus) {
    sectorStatus[sector] = status;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sectorStatus));
      }
    });
    res.send({ success: true });
  } else {
    res.status(400).send({ success: false, message: 'Invalid sector' });
  }
});

app.get('*',(req,res)=>{
  try{
      res.sendFile(__dirname+'/client/build/index.html');
  } catch (error){
      res.status(500);
      console.log('Error: '+error.message+" "+error.stack);
      res.send();
  }
})

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});

module.exports=app;