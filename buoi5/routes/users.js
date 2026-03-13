var express = require("express");
var router = express.Router();
let userModel = require("../schemas/users");
let { CreateAnUserValidator, validatedResult, ModifyAnUser } = require('../utils/validateHandler')

// GET ALL user, co query username includes
router.get("/", async function (req, res, next) {
  try {
    let usernameQ = req.query.username ? req.query.username.trim() : "";

    let filters = {
      isDeleted: false,
      username: new RegExp(usernameQ, "i")
    };

    let users = await userModel
      .find(filters)
      .populate({
        path: 'role',
        select: 'name description'
      });

    res.send(users);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// ENABLE user theo email + username
router.post("/enable", async function (req, res, next) {
  try {
    let { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).send({ message: "email va username la bat buoc" });
    }

    let updatedUser = await userModel.findOneAndUpdate(
      {
        email: String(email).toLowerCase(),
        username,
        isDeleted: false
      },
      { status: true },
      { new: true }
    ).populate({
      path: 'role',
      select: 'name description'
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "khong tim thay user phu hop" });
    }

    res.send(updatedUser);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// DISABLE user theo email + username
router.post("/disable", async function (req, res, next) {
  try {
    let { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).send({ message: "email va username la bat buoc" });
    }

    let updatedUser = await userModel.findOneAndUpdate(
      {
        email: String(email).toLowerCase(),
        username,
        isDeleted: false
      },
      { status: false },
      { new: true }
    ).populate({
      path: 'role',
      select: 'name description'
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "khong tim thay user phu hop" });
    }

    res.send(updatedUser);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// GET user theo id
router.get("/:id", async function (req, res, next) {
  try {
    let result = await userModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .populate({
        path: 'role',
        select: 'name description'
      });

    if (result) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
  }
});

// CREATE user
router.post("/", CreateAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let newItem = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount
    });

    await newItem.save();

    let saved = await userModel
      .findById(newItem._id)
      .populate({
        path: 'role',
        select: 'name description'
      });

    res.send(saved);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// UPDATE user
router.put("/:id", ModifyAnUser, validatedResult, async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    let populated = await userModel
      .findById(updatedItem._id)
      .populate({
        path: 'role',
        select: 'name description'
      });

    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// SOFT DELETE user
router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
