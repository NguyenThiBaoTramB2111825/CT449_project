const multer = require('multer');
const path = require('path');

// Thiết lập nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'app/images/uploads/books/'); // Nơi lưu trữ tệp tin ảnh
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Thiết lập middleware multer
const upload = multer({ storage: storage });

module.exports = upload;