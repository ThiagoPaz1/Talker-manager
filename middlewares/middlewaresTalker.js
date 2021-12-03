const fs = require('fs').promises;
const talkerJson = require('../talker.json');

const validateTalker = (_req, res) => {
  const talker = talkerJson;

  if (talker.length === 0) {
    return res.status(200).json([]);
  }

  return res.status(200).json(talkerJson);
};

const talkerId = (req, res) => {
  const { id } = req.params;
  const findId = talkerJson.find((idTalker) => idTalker.id === Number(id));

  if (!findId) {
    return res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }

  return res.status(200).json(findId);
};

const token = (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization === '') {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  
  if (!authorization || authorization.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  
  next();
};

const validName = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || name === '') {
    return res.status(400).json({ message: 'O campo \'name\' é obrigatório' });
  }

  if (name.length < 3) {
    return res.status(400).json({ message: 'O \'name\' deve ter pelo menos 3 caracteres' });
  }

  next();
};

const validAge = (req, res, next) => {
  const { age } = req.body;

  if (!age || age === '') {
    return res.status(400).json({ message: 'O campo \'age\' é obrigatório' });
  }

  if (Number(age) < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

const validTalkKeys = (req, res, next) => {
  const { talk } = req.body;
  const { watchedAt, rate } = talk;
  const validData = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i.test(watchedAt);
  
  if (!validData) {
    return res.status(400).json({ 
      message: 'O campo \'watchedAt\' deve ter o formato \'dd/mm/aaaa\'',
    });
  }

  if (rate < 1 || rate > 5 || typeof rate !== typeof 0) {
    return res.status(400).json({ message: 'O campo \'rate\' deve ser um inteiro de 1 à 5' });
  }

  req.validWatchedAt = !watchedAt;

  next();
};

const validTalk = (req, res, next) => {
  const { talk } = req.body;
  const { validWatchedAt } = req.validWatchedAt;
  const validRate = !talk.rate;
  const message = { 
    message: 'O campo \'talk\' é obrigatório e \'watchedAt\' e \'rate\' não podem ser vazios',
  };

  if (validWatchedAt || validRate) return res.status(400).json(message);
  if (!talk || talk === '') return res.status(400).json(message);

  next();
};

const addNewTalker = async (req, res) => {
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const newTalker = { name, age, talk: { watchedAt, rate } };
  const addTalker = JSON.stringify([...talkerJson, newTalker]);

  await fs.writeFile('talker.json', addTalker);
  
  return res.status(201).json(newTalker);
};

const updateAndRemove = async (req, _res, next) => {
  let talkerUpdate = [];
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const update = talkerJson[id - 1];
  const oldTalker = [...talkerJson, update.name = name, update.age = age,
    update.talk.watchedAt = watchedAt, update.talk.rate = rate];

  for (let i = 0; i < oldTalker.length; ++i) {
    if (typeof oldTalker[i] === typeof {}) {
      talkerUpdate.push(oldTalker[i]);
    }
  }
  
  req.talkerId = id;
  req.talker = talkerUpdate;

  next();
};

const updateTalker = async (req, res) => {
  const updateTalkerJson = JSON.stringify(req.talker);
  const findId = talkerJson.find((idTalker) => idTalker.id === Number(req.talkerId));
  const { id, name, age, talk } = findId;
  const { watchedAt, rate } = talk;
    
  if (!findId) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }

  await fs.writeFile('talker.json', updateTalkerJson);

  return res.status(200).json({ id, name, age, talk: { watchedAt, rate } });
};

const deleteTalker = async (req, res) => {
  const { id } = req.params;
  const findId = talkerJson.find((idTalker) => idTalker.id === Number(id));
  const index = talkerJson.indexOf(findId);
  talkerJson.splice(index, 1);
  const includesDeleteTalker = JSON.stringify(talkerJson);

  await fs.writeFile('talker.json', includesDeleteTalker);

  return res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
};

const talkerSearch = (req, res) => {
  const { q } = req.query;
  const lowerWord = q.toLowerCase();
  const filterWord = talkerJson.filter((word) => word.name.toLowerCase().includes(lowerWord));

  if (q === '') {
    return res.status(200).json(talkerJson);  
  }

  if (filterWord.length === 0) {
    return res.status(200).json([]);  
  }

  return res.status(200).json(filterWord);
};

module.exports = {
  validateTalker,
  talkerId,
  token,
  validName,
  validAge,
  validTalkKeys,
  validTalk,
  addNewTalker,
  updateAndRemove,
  updateTalker,
  deleteTalker,
  talkerSearch,
};