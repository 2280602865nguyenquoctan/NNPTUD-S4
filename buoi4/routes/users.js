const express = require("express");
const router = express.Router();

const { dataUser, dataRole } = require("../data/data2");

function findUser(username) {
  return dataUser.find(u => u.username === username);
}

function findRole(roleId) {
  return dataRole.find(r => r.id === roleId);
}

// GET /api/v1/users
router.get("/", (req, res) => {
  res.json({ success: true, data: dataUser });
});

// GET /api/v1/users/:username
router.get("/:username", (req, res) => {
  const user = findUser(req.params.username);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
});

// POST /api/v1/users
router.post("/", (req, res) => {
  const { username, password, email, fullName, avatarUrl, status, loginCount, roleId } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "username and password are required" });
  }
  if (findUser(username)) {
    return res.status(409).json({ success: false, message: "username already exists" });
  }

  const role = roleId ? findRole(roleId) : null;
  if (roleId && !role) {
    return res.status(400).json({ success: false, message: "roleId not found" });
  }

  const now = new Date().toISOString();
  const newUser = {
    username,
    password,
    email: email || "",
    fullName: fullName || "",
    avatarUrl: avatarUrl || "",
    status: status ?? true,
    loginCount: loginCount ?? 0,
    role: role ? { id: role.id, name: role.name, description: role.description } : null,
    creationAt: now,
    updatedAt: now,
  };

  dataUser.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT /api/v1/users/:username
router.put("/:username", (req, res) => {
  const user = findUser(req.params.username);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const { password, email, fullName, avatarUrl, status, loginCount, roleId } = req.body;

  if (password !== undefined) user.password = password;
  if (email !== undefined) user.email = email;
  if (fullName !== undefined) user.fullName = fullName;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (status !== undefined) user.status = status;
  if (loginCount !== undefined) user.loginCount = loginCount;

  if (roleId !== undefined) {
    const role = findRole(roleId);
    if (!role) return res.status(400).json({ success: false, message: "roleId not found" });
    user.role = { id: role.id, name: role.name, description: role.description };
  }

  user.updatedAt = new Date().toISOString();
  res.json({ success: true, data: user });
});

// DELETE /api/v1/users/:username
router.delete("/:username", (req, res) => {
  const idx = dataUser.findIndex(u => u.username === req.params.username);
  if (idx === -1) return res.status(404).json({ success: false, message: "User not found" });

  const deleted = dataUser.splice(idx, 1)[0];
  res.json({ success: true, data: deleted });
});

module.exports = router;