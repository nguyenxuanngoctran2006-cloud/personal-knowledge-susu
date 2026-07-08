const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World! Server Node.js của bạn đã chạy trong thư mục personal-knowledge-susu!');
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại địa chỉ: http://localhost:${PORT}`);
});