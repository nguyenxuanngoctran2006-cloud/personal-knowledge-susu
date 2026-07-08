const express = require('express');
const pool = require('./db'); // Nhập cấu hình database từ file db.js
const app = express();
const PORT = 3000;

// Cho phép Express đọc được dữ liệu dạng JSON mà Client gửi lên
app.use(express.json());

// 1. API TRANG CHỦ (Kiểm tra server)
app.get('/', (req, res) => {
    res.send('Server Note App đang hoạt động ngon lành!');
});

// 2. API THÊM GHI CHÚ MỚI (CREATE)
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body; // Lấy tiêu đề và nội dung người dùng gõ
        const newNote = await pool.query(
            "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
            [title, content]
        );
        res.json({ message: "Thêm ghi chú thành công!", data: newNote.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. API ĐỌC TẤT CẢ GHI CHÚ (READ)
app.get('/api/notes', async (req, res) => {
    try {
        const allNotes = await pool.query("SELECT * FROM notes ORDER BY id DESC");
        res.json(allNotes.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. API XÓA MỘT GHI CHÚ (DELETE)
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID cần xóa từ đường dẫn URL
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
        // parent_id có thể là id của thư mục cha, hoặc null nếu là thư mục gốc ngoài cùng
        
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

// 3. API TÌM KIẾM GHI CHÚ THEO TỪ KHÓA (SEARCH)
app.get('/api/search', async (req, res) => {
    try {
        const { keyword } = req.query; // Lấy từ khóa người dùng gửi lên qua link (ví dụ: ?keyword=Node)
        
        if (!keyword) {
            return res.status(400).json({ error: "Vui lòng nhập từ khóa để tìm kiếm!" });
        }

        // Câu lệnh SQL sử dụng ILIKE để tìm kiếm không phân biệt chữ hoa/chữ thường
        const searchResults = await pool.query(
            "SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY id DESC",
            [`%${keyword}%`]
        );

        res.json(searchResults.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy cực mượt tại: http://localhost:${PORT}`);
});