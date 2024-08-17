// routes/userRoutes.js
const express = require('express');
const { createPrompt, getPrompts,updateVoteCount,removeVote,checkWalletAddress,getPromptsByWalletAddress,getTopPrompts,getRecentPromptsWithLowVotes,getPromptsDateSorted,getStructuredPromptsData } = require('../controllers/propmtController');
const { getUserPromptCount, incrementPromptCount, incrementVoteCount, decrementVoteCount} = require('../controllers/usersController');
const router = express.Router();

router.post('/createPrompt', createPrompt);
router.get('/getPrompts', getPrompts);
router.patch('/prompts/:id/vote', updateVoteCount);
router.patch('/prompts/:id/remove-vote', removeVote);
router.get('/check-wallet',checkWalletAddress)
router.get('/get_prompts_by_wallet',getPromptsByWalletAddress)
router.get('/get_top_prompts',getTopPrompts)
router.get('/get_newest_prompts',getRecentPromptsWithLowVotes)
router.get('/get_all_date_sorted_prompts',getPromptsDateSorted)
router.get('/get_structured_prompt_data',getStructuredPromptsData)

router.get('/user', getUserPromptCount);
router.post('/user/increment', incrementPromptCount);
router.post('/user/increment-vote', incrementVoteCount);
router.post('/user/decrement-vote', decrementVoteCount);

module.exports = router;
