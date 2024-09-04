const Prompt = require('../models/prompt');
const User = require('../models/User');

exports.createPrompt = async (req, res) => {
  const { walletAddress, prompt, upVoteCount, downVoteCount, upVotedWallets,downVotedWallets } = req.body;

  try {
    const newPrompt = new Prompt({ walletAddress, prompt, upVoteCount,downVoteCount,upVotedWallets,downVotedWallets});
    await newPrompt.save();
    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStructuredPromptsData = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ upVoteCount: -1 });
    const recentPromptsWithLowVotes = await Prompt.find({
      upVoteCount: { $lte: 1 }
    }).sort({ _id: -1 });

    res.status(200).json({
      prompts,
      recentPromptsWithLowVotes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ upVoteCount: -1  });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPromptsDateSorted = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ _id: -1  });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentPromptsWithLowVotes = async (req, res) => {
  try {
    const recentPrompts = await Prompt.find({
      upVoteCount: { $lte: 1 }
    }).sort({ _id: -1 });

    res.status(200).json(recentPrompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVoteCount = async (req, res) => {
  const { id } = req.params; // Prompt ID from the URL parameters
  const { voteType,votedWalletAddress } = req.body; // Type of vote: 'upvote' or 'downvote'

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ message: 'Invalid vote type.' });
  }

  try {
    const update = {
      $inc: voteType === 'upvote' ? { upVoteCount: 1 } : { downVoteCount: 1 },
      $push: voteType === 'upvote' ?{ upVotedWallets: votedWalletAddress }:{ downVotedWallets: votedWalletAddress },
    };
    const updatedPrompt = await Prompt.findByIdAndUpdate(id, update, { new: true });

    if (!updatedPrompt) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    // Update the User document
    const updateUser = {
      $push: voteType === 'upvote' ? { upVotedPrompts: id } : { downVotedPrompts: id }
    };
    const updatedUser = await User.findOneAndUpdate({ walletAddress: votedWalletAddress }, updateUser, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(updatedPrompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeVote = async (req, res) => {
  const { id } = req.params; // Prompt ID from the URL parameters
  const { voteType, votedWalletAddress } = req.body; // Type of vote: 'upvote' or 'downvote'

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ message: 'Invalid vote type.' });
  }

  try {
    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    let update = {};
    if (voteType === 'upvote') {
      if (!prompt.upVotedWallets.includes(votedWalletAddress)) {
        return res.status(400).json({ message: 'Wallet address has not upvoted this prompt.' });
      }
      update = {
        $inc: { upVoteCount: -1 },
        $pull: { upVotedWallets: votedWalletAddress },
      };
    } else {
      if (!prompt.downVotedWallets.includes(votedWalletAddress)) {
        return res.status(400).json({ message: 'Wallet address has not downvoted this prompt.' });
      }
      update = {
        $inc: { downVoteCount: -1 },
        $pull: { downVotedWallets: votedWalletAddress },
      };
    }

    const updatedPrompt = await Prompt.findByIdAndUpdate(id, update, { new: true });

    // Update user document
    let updateUser = {};
    if (voteType === 'upvote') {
      if (User.upVotedPrompts.includes(id)) {
        updateUser = {
          $pull: { upVotedPrompts: id },
        };
      }
    } else {
      if (User.downVotedPrompts.includes(id)) {
        updateUser = {
          $pull: { downVotedPrompts: id },
        };
      }
    }

    const updatedUser = await User.findOneAndUpdate({ walletAddress: votedWalletAddress }, updateUser, { new: true });

    res.status(200).json(updatedPrompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkWalletAddress = async (req, res) => {
  const {walletAddress} = req.query;

  if (!walletAddress ) {
    return res.status(400).json({ msg: 'Wallet Address is required' });
  }

  try {
    const user = await Prompt.findOne({walletAddress});

    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getPromptsByWalletAddress = async (req, res) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ msg: 'Wallet Address is required' });
  }

  try {
    const prompts = await Prompt.find({ walletAddress });

    if (prompts.length > 0) {
      return res.status(200).json({ exists: true, prompts });
    } else {
      return res.status(200).json({ exists: false, prompts: [] });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getTopPrompts = async (req, res) => {
  try {
    const topPrompts = await Prompt.find({})
      .sort({ upVoteCount: -1 })
      .limit(50);

    return res.status(200).json({ prompts: topPrompts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Other controllers (getUser, updateUser, deleteUser) can be added here.
