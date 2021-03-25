const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verify-token");


router.post("/auth/signup", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.json({
      success: false,
      message: "Please enter email or password"
    });
  } else {
    try {
      let newUser = new User();
      newUser.name = req.body.name;
      newUser.email = req.body.email;
      newUser.password = req.body.password;

      await newUser.save();
      let token = jwt.sign(newUser.toJSON(), process.env.JWTsecret, {
        expiresIn: 604800 
      });
      res.json({
        success: true,
        token: token,
        message: "Successfuly create a new user"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
});


router.get("/auth/user", verifyToken, async (req, res) => {
  try {
    let foudUser = await User.findOne({ _id: req.decoded._id }).populate(
      "address"
    );
    if (foudUser) {
      res.json({
        success: true,
        user: foudUser
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.put("/auth/user", verifyToken, async (req, res) => {
  try {
    let foudUser = await User.findOne({ _id: req.decoded._id });
    if (foudUser) {
      if (req.body.name) foudUser.name = req.body.name;
      if (req.body.email) foudUser.email = req.body.email;
      if (req.body.password) foudUser.password = req.body.password;

      await foudUser.save();

      res.json({
        success: true,
        message: "Profile edited successfully"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.post("/auth/login", async (req, res) => {
  try {
    let foudUser = await User.findOne({ email: req.body.email });
    if (!foudUser) {
      res.status(403).json({
        success: false,
        message: "Authentication failed, User not found"
      });
    } else {
      if (foudUser.comparePassword(req.body.password)) {
        let token = jwt.sign(foudUser.toJSON(), process.env.JWTsecret, {
          expiresIn: 604800 // 1 week
        });
        res.json({
          success: true,
          token: token
        });
      } else {
        res.status(403).json({
          success: false,
          message: "incorrect password"
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
