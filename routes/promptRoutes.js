// routes/userRoutes.js
const express = require('express');
const { createPrompt, getPrompts,updateVoteCount,removeVote,checkWalletAddress } = require('../controllers/propmtController');
const { getUserPromptCount, incrementPromptCount, incrementVoteCount, decrementVoteCount} = require('../controllers/usersController');
const router = express.Router();

router.post('/createPrompt', createPrompt);
router.get('/getPrompts', getPrompts);
router.patch('/prompts/:id/vote', updateVoteCount);
router.patch('/prompts/:id/remove-vote', removeVote);
router.get('/check-wallet',checkWalletAddress)

router.get('/user', getUserPromptCount);
router.post('/user/increment', incrementPromptCount);
router.post('/user/increment-vote', incrementVoteCount);
router.post('/user/decrement-vote', decrementVoteCount);

module.exports = router;
