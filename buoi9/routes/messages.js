var express = require("express");
var router = express.Router();
let messageController = require("../controllers/messages");
let { CheckLogin } = require("../utils/authHandler");
let multer = require('multer');
let fs = require('fs');

// Đảm bảo thư mục public/uploads tồn tại
const dir = 'public/uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({ storage: storage })

// GET "/": Lấy message cuối cùng của mỗi user mà user hiện tại nhắn tin hoặc user khác nhắn cho user hiện tại
router.get("/", CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let messages = await messageController.getLastMessagesWithAllUsers(currentUserId);
    res.send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET "/:userID": Lấy toàn bộ message from: user hiện tại, to: userID và from: userID, to: user hiện tại
router.get("/:userID", CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let otherUserId = req.params.userID;
    let messages = await messageController.getMessagesWithUser(currentUserId, otherUserId);
    res.send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST "/": Post nội dung:
// - nếu có chứa file thì type là file,text là path dẫn đến file, nếu là text thì type là text và text là nội dung gửi
// - to: userID sẽ gửi đến
router.post("/", CheckLogin, upload.single('file'), async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let toId = req.body.to;
    
    if (!toId) {
      return res.status(400).send({ message: "Missing 'to' fields: userID needs to be sent." });
    }

    let type = "text";
    let text = req.body.text; // Text content if any

    if (req.file) {
      type = "file";
      text = "/uploads/" + req.file.filename;
    } else if (!text) {
      return res.status(400).send({ message: "Content must be provided (either file or text)." });
    }

    let newMessage = await messageController.createMessage(currentUserId, toId, type, text);
    res.send(newMessage);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
