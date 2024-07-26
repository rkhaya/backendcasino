const User = require("../models/user");
const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const { generateServerSeed } = require("../helpers/encrypt");
const crypto = require("crypto");

const TOTAL_DROPS = 16;

const MULTIPLIERS = {
  0: 16,
  1: 9,
  2: 2,
  3: 1.4,
  4: 1.4,
  5: 1.2,
  6: 1.1,
  7: 1,
  8: 0.5,
  9: 1,
  10: 1.1,
  11: 1.2,
  12: 1.4,
  13: 1.4,
  14: 2,
  15: 9,
  16: 16,
};

router.post("/givemoney", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.money = 50000;
    await user.save();
    res.json({
      sucess: true,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/dice", authenticate, async (req, res) => {
  try {
    const betAmount = req.body.bet;
    const clientSeed = req.body.clientSeed;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!betAmount) {
      return res.status(400).json({ error: "Bet amount is required" });
    }

    if (betAmount > user.money) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const serverSeed = generateServerSeed();

    // Combine server seed and client seed
    const combinedSeed = serverSeed + "|" + clientSeed;

    // Calculate hash of the combined seed
    const hash = crypto.createHash("sha256").update(combinedSeed).digest("hex");

    // Determine outcome based on hash (example: true for even, false for odd)
    const hashNumber = parseInt(hash.substring(0, 8), 16); // First 8 characters of hash as a number (0 to 4294967295)
    const win = hashNumber % 2 === 0; // Example: true for even, false for odd

    // Update user's money
    const updatedMoney = win ? user.money + betAmount : user.money - betAmount;
    user.money = updatedMoney;
    await user.save();

    res.json({
      success: true,
      win,
      updatedMoney,
      clientSeed,
      serverSeed,
      hash,
      message: win ? "You won!" : "You lost!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/verify/dice/:serverSeed/:clientSeed/:hash", (req, res) => {
  try {
    const { serverSeed, clientSeed, hash } = req.params;

    // Recreate combined seed using serverSeed and clientSeed
    const combinedSeed = serverSeed + "|" + clientSeed;

    // Calculate hash locally
    const calculatedHash = crypto
      .createHash("sha256")
      .update(combinedSeed)
      .digest("hex");

    // Compare hashes
    if (calculatedHash === hash) {
      // Verification successful
      const hashNumber = parseInt(hash.substring(0, 8), 16);
      const win = hashNumber % 2 === 0;
      const message = win
        ? "Game outcome verified: You won!"
        : "Game outcome verified: You lost.";
      res.json({ success: true, message });
    } else {
      // Verification failed
      res.json({
        success: false,
        message: "Game outcome verification failed. Possible tampering.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/plinko", authenticate, async (req, res) => {
  try {
    const betAmount = req.body.bet;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!betAmount) {
      return res.status(400).json({ error: "Bet amount is required" });
    }
    if (betAmount > user.money) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    let outcome = 0;
    const pattern = [];
    for (let i = 0; i < TOTAL_DROPS; i++) {
      if (Math.random() > 0.5) {
        pattern.push("R");
        outcome++;
      } else {
        pattern.push("L");
      }
    }
    const multiplier = MULTIPLIERS[outcome];
    const updatedMoney = user.money - betAmount + betAmount * multiplier;

    user.money = updatedMoney;
    await user.save();

    res.json({
      betAmount,
      payout: betAmount * multiplier,
      multiplier,
      pattern,
      updatedMoney,
    });
  } catch (error) {}
});

module.exports = router;
