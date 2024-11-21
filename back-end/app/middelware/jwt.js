const jwt = require('jsonwebtoken');

// Hàm để xác thực token từ header
function authenticateTokenFromHeader(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'my_secret_key', (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.sendStatus(401);
            } else {
                return res.sendStatus(403);
            }
        }
        req.user = user;
        next();
    });
}

// Hàm để xác thực token từ route params
function authenticateTokenFromParams(req, res, next) {
    const token = req.params.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'my_secret_key', (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.sendStatus(401);
            } else {
                return res.sendStatus(403);
            }
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateTokenFromHeader, authenticateTokenFromParams };
