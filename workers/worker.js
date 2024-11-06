const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 8080 }); // 設定 WebSocket 伺服器

// wss.on('connection', (ws) => {
//     console.log('Client connected');
//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });

async function startWorker() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'csv_processing';

    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}`);

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const filePath = msg.content.toString();
            console.log(`Received file path: ${filePath}`);

            // 模擬處理CSV文件
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                console.log(`Processing file:\n${data}`);
                // 在這裡可以解析CSV並進行所需的處理


                // 任務處理完成，發送通知給所有連接的客戶端
                // wss.clients.forEach(client => {
                //     console.log('Sending message to client');
                //     if (client.readyState === WebSocket.OPEN) {
                //         client.send(`Task completed for file: ${filePath}`);
                //     }
                // });

                // 不直接使用websocket通知user，而是使用http通知server，server再通知user
                axios.post('http://localhost:3000/upload-callback', {
                    filePath: filePath
                });

                // 處理完成後，確認消息已被消費
                channel.ack(msg);
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }
    });
}

startWorker().catch(console.error);
