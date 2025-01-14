const User = require("../models/User");
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Ellenőrizd, hogy már létezik-e a felhasználó
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    // Új felhasználó létrehozása
    const user = new User({ username, email, password });
    await user.save();

    // Token generálása
    const accesstoken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .json({
        accesstoken,
        refreshToken,
        user: { id: user._id, username: user.username, email: user.email },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Felhasználó keresése email alapján
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Jelszó ellenőrzése
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Token generálása
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .json({
        accessToken,
        refreshToken,
        user: { id: user._id, username: user.username, email: user.email },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '5s' });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.verifyToken = async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  const refreshToken = req.body.refreshToken; // Itt kérjük a refresh token-t is a body-ban

  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
  
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    return res.status(200).json({ message: 'Token is valid', user: decoded });
  } catch (error) {

    

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const newAccessToken = jwt.sign({ id: decodedRefresh.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);

      return res.status(200).json({ message: 'Token refreshed', accessToken: newAccessToken, user: decoded });
    } catch (error) {
      
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
};