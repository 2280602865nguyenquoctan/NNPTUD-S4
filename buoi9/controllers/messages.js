let messageModel = require("../schemas/messages");
let mongoose = require("mongoose");

module.exports = {
  getMessagesWithUser: async (currentUserId, otherUserId) => {
    return await messageModel.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ]
    }).sort({ createdAt: 1 })
      .populate("from", "username fullName avatarUrl")
      .populate("to", "username fullName avatarUrl");
  },

  createMessage: async (fromId, toId, type, text) => {
    let newMessage = await messageModel.create({
      from: fromId,
      to: toId,
      messageContent: {
        type: type,
        text: text
      }
    });
    return newMessage;
  },

  getLastMessagesWithAllUsers: async (currentUserId) => {
    let currentId = new mongoose.Types.ObjectId(currentUserId);

    return await messageModel.aggregate([
      {
        $match: {
          $or: [{ from: currentId }, { to: currentId }]
        }
      },
      {
        $sort: { createdAt: -1 } // Sort by newest
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", currentId] },
              "$to",
              "$from"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
  }
};
