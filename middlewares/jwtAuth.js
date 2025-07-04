const jwt = require('jsonwebtoken');
const jwtAuth = (req, res, next) => {
    let token = req.headers.authorization; // Extract token from header
    console.log('Authorization header:', token); // Debug log
    if (!token) {
      return res.status(404).json({ msg: "JWT token must be provided" });
    }
    // Handle Bearer prefix
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    try {
      const decoded = jwt.verify(token, process.env.jwtPassword);
      req.user = decoded; // Attach user data to request object for controllers
      next();
    } catch (err) {
      console.log('JWT verification error:', err); // Debug log
      return res.status(401).json({ msg: "Invalid JWT token", errorType: err.name, errorMessage: err.message });
    }
  };

  const alumniVerify = (req, res, next) => {
    let token = req.headers.authorization; // Extract token from header
    console.log('Authorization header:', token); // Debug log
    if (!token) {
      return res.status(404).json({ msg: "JWT token must be provided" });
    }
    // Handle Bearer prefix
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    try {
      const decoded = jwt.verify(token, process.env.jwtPassword);
      console.log('decoded:', decoded)

      if (decoded.rank == 3) {
        return res.status(403).json({ msg: "Unauthorized access" }); // 403 Forbidden
      }
      req.user = decoded; // Attach user data to request object for controllers
      next();
    } catch (err) {
      console.log('JWT verification error:', err); // Debug log
      return res.status(401).json({ msg: "Invalid JWT token", errorType: err.name, errorMessage: err.message });
    }
  };

module.exports = { jwtAuth, alumniVerify };
