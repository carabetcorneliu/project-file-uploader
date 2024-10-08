const queries = require("../db/queries");
const { body, validationResult } = require("express-validator");
const passport = require("../config/passport");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const passLengthErr = "must be between 6 and 15 characters.";
const passConfirmErr = "password and confirmation dont match.";

const validateUser = [
  body("username")
    .trim()
    .isAlpha()
    .withMessage(`User ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`User ${lengthErr}`),
  body("password")
    .isLength({ min: 6, max: 15 })
    .withMessage(`Password ${passLengthErr}`)
    .trim(),
  body("confirm")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(passConfirmErr);
      }
      return true;
    }),
];

function registerGet(req, res) {
  res.render("register", {
    title: "Register page",
  });
}

const registerPost = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("register", {
        user: req.body,
        errors: errors.array(),
      });
    }

    console.log(req.body);
    try {
      const newUser = await queries.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: `User could not be created: ${error}` });
    }
    // res.redirect('/');
  },
];

function loginGet(req, res) {
  res.render("login", {
    title: "Login page",
  });
}

const loginPost = [
  validateUser,
  async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/auth/login?error=Invalid-Credentials");
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.redirect("/");
      });
    })(req, res, next);
  },
];

function logoutGet(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

module.exports = {
  registerGet,
  registerPost,
  loginGet,
  loginPost,
  logoutGet,
};
