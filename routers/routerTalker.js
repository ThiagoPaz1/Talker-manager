const express = require('express');

const router = express.Router();
const talker = require('../middlewares/middlewaresTalker');

router.get('/search', talker.token, talker.talkerSearch);

router.get('/', talker.validateTalker);

router.get('/:id', talker.talkerId);

router.post('/', 
  talker.token,
  talker.validName,
  talker.validAge,
  talker.validTalkKeys,
  talker.validTalk,
  talker.addNewTalker);

router.put('/:id',
  talker.token,
  talker.validName,
  talker.validAge,
  talker.validTalkKeys,
  talker.validTalk,
  talker.updateAndRemove,
  talker.updateTalker);

router.delete('/:id', talker.token, talker.deleteTalker);

module.exports = router;