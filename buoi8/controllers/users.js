let userModel = require("../schemas/users");
const roleModel = require("../schemas/roles");
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
    CreateAnUser: async function (username, password, email, role, session,
        fullName, avatarUrl, status, loginCount
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save({ session });
        return newItem;
    },
    GetAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false })
        return users;
    },
    GetAnUserByUsername: async function (username) {
        let user = await userModel
            .findOne({
                isDeleted: false,
                username: username
            })
        return user;
    },
    GetAnUserByEmail: async function (email) {
        let user = await userModel
            .findOne({
                isDeleted: false,
                email: email
            })
        return user;
    },
    GetAnUserByToken: async function (token) {
        let user = await userModel
            .findOne({
                isDeleted: false,
                forgotPasswordToken: token
            })
        if (user.forgotPasswordTokenExp > Date.now()) {
            return user;
        } else {
            return false;
        }

    },
    GetAnUserById: async function (id) {
        let user = await userModel
            .findOne({
                isDeleted: false,
                _id: id
            }).populate('role')
        return user;
    },
    ImportUsers: async function () {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('./user.xlsx');
        const worksheet = workbook.getWorksheet(1);

        let userRole = await roleModel.findOne({ name: { $regex: /^user$/i } });
        if (!userRole) {
            userRole = new roleModel({ name: 'user' });
            await userRole.save();
        }

        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER || "a7a9d7d24bdf2d",
                pass: process.env.MAILTRAP_PASS || "a79c1a90426264"
            }
        });

        const results = [];

        let rowIndex = 2; // skip header
        while (true) {
            const row = worksheet.getRow(rowIndex);
            const username = row.values[1];
            if (!username) break;

            const emailObj = row.values[2];
            const email = (emailObj && typeof emailObj === 'object' && emailObj.result) ? emailObj.result : emailObj;

            const randomPassword = crypto.randomBytes(8).toString('hex'); // 16 chars

            let newItem = await userModel.findOne({ username: username });
            if (newItem) {
                newItem.password = randomPassword;
                newItem.email = email;
                newItem.role = userRole._id;
                // Nếu User bị xóa nhầm trước đó thì khôi phục lại
                newItem.isDeleted = false; 
            } else {
                newItem = new userModel({
                    username: username,
                    password: randomPassword,
                    email: email,
                    role: userRole._id
                });
            }
            await newItem.save();

            // Bọc try-catch để lỡ 1 email bị Mailtrap chặn thì app không chết, nó sẽ chạy tiếp user kế
            try {
                await transporter.sendMail({
                    from: '"Admin" <admin@example.com>',
                    to: email,
                    subject: "Your new account password",
                    text: `Welcome! Your username is: ${username}\nYour password is: ${randomPassword}`,
                });
                console.log(`Đã gửi mail cho: ${email}`);
            } catch (err) {
                console.log(`Lỗi gửi mail cho ${email}:`, err.message);
            }

            // Tăng hẳn thời gian chờ lên 3 giây để an toàn 100% với Mailtrap
            await delay(3000); 

            results.push(newItem);
            rowIndex++;
        }
        return results;
    }
}