const express = require('express');
const pool = require('./db'); // Nhập cấu hình database từ file db.js
const app = express();
const cors = require('cors'); // Thêm cors mở khóa kết nối

app.use(cors());              // Kích hoạt CORS chặn lỗi bảo mật trình duyệt
const PORT = 3000;

// Cho phép Express đọc được dữ liệu JSON gửi lên
app.use(express.json());

// 1. API TRANG CHỦ
app.get('/', (req, res) => {
    res.send('Server Note App đang hoạt động ngon lành!');
});

// 2. API THÊM GHI CHÚ MỚI (Bản vá lỗi chống null / chống sập khóa ngoại)
app.post('/api/notes', async (req, res) => {
    try {
        let { title, content, folder_id } = req.body; 
        
        // 🌟 THÊM ĐOẠN KIỂM TRA NÀY: Nếu folder_id gửi lên bằng 0, hoặc không phải là số, hoặc null
        // thì ép nó về null hẳn để PostgreSQL hiểu là ghi chú tự do, không bắt bẻ lỗi khóa ngoại nữa.
        if (!folder_id || Number(folder_id) <= 0 || isNaN(Number(folder_id))) {
            folder_id = null;
        }
        
        const newNote = await pool.query(
            "INSERT INTO notes (title, content, folder_id) VALUES ($1, $2, $3) RETURNING *",
            [title, content, folder_id]
        );
        res.json({ message: "Thêm ghi chú thành công!", data: newNote.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. API ĐỌC TẤT CẢ GHI CHÚ
app.get('/api/notes', async (req, res) => {
    try {
        const allNotes = await pool.query("SELECT * FROM notes ORDER BY id DESC");
        res.json(allNotes.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. API XÓA MỘT GHI CHÚ
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        await pool.query("DELETE FROM notes WHERE id = $1", [id]);
        res.json({ message: `Đã xóa thành công ghi chú có ID = ${id}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// GIAI ĐOẠN 2: API QUẢN LÝ THƯ MỤC (FOLDERS)
// ==========================================

// 1. API TẠO THƯ MỤC MỚI
app.post('/api/folders', async (req, res) => {
    try {
        const { name, parent_id } = req.body; 
        const newFolder = await pool.query(
            "INSERT INTO folders (name, parent_id) VALUES ($1, $2) RETURNING *",
            [name, parent_id || null]
        );
        res.json({ message: "Tạo thư mục thành công!", data: newFolder.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. API LẤY TẤT CẢ THƯ MỤC
app.get('/api/folders', async (req, res) => {
    try {
        const allFolders = await pool.query("SELECT * FROM folders ORDER BY id ASC");
        res.json(allFolders.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy cực mượt tại: http://localhost:${PORT}`);
});