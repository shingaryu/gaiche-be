const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

router.get('/:userId', async (req, res) => {
  const user = await userService.getUser(req.params.userId);
  res.send(user);
});

router.get('/', async (req, res) => {
  const users = await userService.getUsers(req.query);
  res.send(users);
});

module.exports = router;