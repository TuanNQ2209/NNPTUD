let userModel = require("../schemas/users");
let bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (username, password, email, role,
        fullName, avatarUrl, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        })
        await newUser.save();
        return newUser;
    },
    FindUserByUsername: async function (username) {
        return await userModel.findOne({
            isDeleted: false,
            username: username
        })
    },
    CompareLogin: async function (user, password) {
        if (bcrypt.compareSync(password, user.password)) {
            user.loginCount = 0;
            await user.save()
            return user;
        }
        user.loginCount++;
        if (user.loginCount == 3) {
            user.lockTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
            user.loginCount = 0;
        }
        await user.save()
        return false;
    },
    GetUserById: async function (id) {
        try {
            let user = await userModel.findOne({
                _id: id,
                isDeleted: false
            })
            return user;
        } catch (error) {
            return false;
        }
    },
    ChangePassword: async function (userId, oldPassword, newPassword) {
        try {
            // 1. Tìm user theo ID
            let user = await userModel.findById(userId);
            if (!user) return { success: false, message: "Người dùng không tồn tại" };

            // 2. Validate mật khẩu mới (Ví dụ: ít nhất 8 ký tự, có 1 chữ cái và 1 số)
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return { 
                    success: false, 
                    message: "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ cái và số." 
                };
            }

            // 3. Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return { success: false, message: "Mật khẩu cũ không chính xác" };
            }

            // 4. Hash mật khẩu mới và lưu
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return { success: true, message: "Đổi mật khẩu thành công" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}