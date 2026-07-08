const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Câu lệnh tạo bảng tự động nếu bảng chưa tồn tại
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('❌ Tạo bảng thất bại:', err.message);
  } else {
    console.log('✅ Bảng "notes" đã sẵn sàng trong Database!');
  }
});

module.exports = pool;