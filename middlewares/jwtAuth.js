const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(404).json({ msg: "JWT token must be provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtPassword);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid JWT token", error: err.message });
  }
};

const alumniVerify = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(404).json({ msg: "JWT token must be provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtPassword);
    if (decoded.rank === 3) {
      return res.status(403).json({ msg: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid JWT token", error: err.message });
  }
};

module.exports = { jwtAuth, alumniVerify };
