const express = require('express');

const router = express.Router();
const crypto = require('crypto');
const login = require('../middlewares/middlewaresLogin');

router.post('/', login.validateEmail, login.validatePassword, 
  (_req, res) => {
    crypto.randomBytes(12, (_err, buf) => {
      const generatedToken = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');

      return res.status(200).json({ generatedToken });
  });
});

module.exports = router;