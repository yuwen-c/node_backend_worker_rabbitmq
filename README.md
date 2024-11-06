# 起服務

1. npm start 起主服務
2. node node workers/worker.js 起worker
3. docker起rabbitmq: `docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management`
4. 網頁連`http://localhost:3000/`
5. 上傳csv檔，畫面會顯示websocket訊息顯示檔案名
6. 進入rabbitmq的web管理介面 `http://localhost:15672/#/queues`，帳密都是guest，可以看到queue的狀態
