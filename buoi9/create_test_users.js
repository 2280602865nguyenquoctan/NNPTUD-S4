const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel = require("./schemas/users");
const roleModel = require("./schemas/roles");

mongoose.connect("mongodb://localhost:27017/NNPTUD-S4")
  .then(async () => {
    console.log("Connected to MongoDB for creating users...");
    
    try {
      // Create a default role if not exists
      let role = await roleModel.findOne({ name: "ADMIN" });
      if (!role) {
        role = await roleModel.create({
          name: "ADMIN",
          description: "Admin role"
        });
      }

      // Create User 1
      let user1 = await userModel.findOne({ username: "usertest1" });
      if (!user1) {
        user1 = await userModel.create({
          username: "usertest1",
          password: "123", // Pre-hook will hash this
          email: "user1@demo.com",
          role: role._id,
          fullName: "User Test 1"
        });
      }

      // Create User 2
      let user2 = await userModel.findOne({ username: "usertest2" });
      if (!user2) {
        user2 = await userModel.create({
          username: "usertest2",
          password: "123",
          email: "user2@demo.com",
          role: role._id,
          fullName: "User Test 2"
        });
      }

      console.log("-----------------------------------------");
      console.log("✅ Create accounts successfully:");
      console.log(`User A:
 Username: usertest1
 Password: 123
 _id: ${user1._id}`);
      console.log("-----------------------------------------");
      console.log(`User B:
 Username: usertest2
 Password: 123
 _id: ${user2._id}`);
      console.log("-----------------------------------------");
    } catch (e) {
      console.error(e);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
