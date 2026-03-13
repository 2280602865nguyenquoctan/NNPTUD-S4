const express = require("express");
const router = express.Router();

const { dataRole, dataUser } = require("../data/data2");

function findRoleById(id) {
  return dataRole.find(r => r.id === id);
}

// GET /api/v1/roles
router.get("/", (req, res) => {
  res.json({ success: true, data: dataRole });
});

// GET /api/v1/roles/:id
router.get("/:id", (req, res) => {
  const role = findRoleById(req.params.id);
  if (!role) return res.status(404).json({ success: false, message: "Role not found" });
  res.json({ success: true, data: role });
});

// POST /api/v1/roles
router.post("/", (req, res) => {
  const { id, name, description } = req.body;

  if (!id || !name) {
    return res.status(400).json({ success: false, message: "id and name are required" });
  }
  if (findRoleById(id)) {
    return res.status(409).json({ success: false, message: "Role id already exists" });
  }

  const now = new Date().toISOString();
  const newRole = {
    id,
    name,
    description: description || "",
    creationAt: now,
    updatedAt: now,
  };

  dataRole.push(newRole);
  res.status(201).json({ success: true, data: newRole });
});

// PUT /api/v1/roles/:id
router.put("/:id", (req, res) => {
  const role = findRoleById(req.params.id);
  if (!role) return res.status(404).json({ success: false, message: "Role not found" });

  const { name, description } = req.body;
  if (name !== undefined) role.name = name;
  if (description !== undefined) role.description = description;
  role.updatedAt = new Date().toISOString();

  res.json({ success: true, data: role });
});

// DELETE /api/v1/roles/:id
router.delete("/:id", (req, res) => {
  const idx = dataRole.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Role not found" });

  const deleted = dataRole.splice(idx, 1)[0];
  res.json({ success: true, data: deleted });
});

// ✅ GET /api/v1/roles/:id/users
router.get("/:id/users", (req, res) => {
  const roleId = req.params.id;
  const role = findRoleById(roleId);
  if (!role) return res.status(404).json({ success: false, message: "Role not found" });

  const usersInRole = dataUser.filter(u => u.role?.id === roleId);
  res.json({ success: true, data: usersInRole, count: usersInRole.length });
});

module.exports = router;