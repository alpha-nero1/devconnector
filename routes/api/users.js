const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");

// Load input validator
const register_validator = require("../../validation/register");
const login_validator = require("../../validation/login");

const User = require("../../models/User");

const router = express.Router();

// @route   GET api/users/test
// @desc    tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users works" }));

// @route   POST api/users/register
// @desc    register a user
// @access  Public
router.post("/register", (req, res) => {
  const { body } = req;
  const { errors, valid } = register_validator(req.body);

  // check validation
  if (!valid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: body.email }).then(user => {
    if (user) {
      errors.email = "email already exists";
      return res.status(400).json(errors); // 400 is validation err
    } else {
      const avatar = gravatar.url(body.email, { s: "200", r: "pg", d: "mm" });
      const new_user = new User({
        name: body.name,
        email: body.email,
        avatar: avatar,
        password: body.password
      });

      // hash and save password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(new_user.password, salt, (err, hash) => {
          if (err) throw err;
          new_user.password = hash;
          new_user
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    login user, returning JWT
// @access  Public
router.post("/login", (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  const { errors, valid } = login_validator(req.body);

  // check validation
  if (!valid) {
    return res.status(400).json(errors);
  }

  // find user via email
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors); // not found
    }

    // check password
    bcrypt.compare(password, user.password).then(match => {
      if (match) {
        // User passed.
        const payload = {
          // Payload for jwt
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        // Sign token
        jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        errors.password = "Password is incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    return the current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      // we now have user in the request from auth
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
