const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const amqp = require('amqplib');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// WebSocket 連接處理
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// 處理來自 worker 的消息
function handleWorkerMessage(filePath) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`Task completed for file: ${filePath}`);
        }
    });
}

const upload = multer({ dest: 'tmp/' }); // 設定臨時文件儲存位置
async function sendToQueue(filePath) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'csv_processing';

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(filePath));
    console.log(`File path sent to queue: ${filePath}`);
    setTimeout(() => {
        connection.close();
    }, 500);
}

app.use(express.static('public'));

// app.get('/', (req, res) => {
//     res.send('Hello World');
// });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.json());
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    sendToQueue(filePath)
        .then(() => res.status(200).send('File uploaded and queued for processing'))
        .catch((err) => res.status(500).send('Error in queueing the file'));
});

app.post('/upload-callback', (req, res) => {
    console.log('Received upload callback', req.body);
    const filePath = req.body.filePath;
    handleWorkerMessage(filePath);
    res.status(200).send('File processed');
});

server.listen(3000, () => {
    console.log('http and websocket server running on port 3000 ');
});
