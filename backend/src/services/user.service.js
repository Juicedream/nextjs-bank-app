const db = require("../db/index");
const { comparePasswords, hashPassword } = require("../utils/password.utils");

class UserService {
  async findAllUsers() {
    return await db.User.find({}).populate("ninId").lean();
  }

  async findUserById(id) {
    const user = await db.User.findById(id).populate("ninId").lean();
    if (!user) return { error: "User not found" };
     
    return { user };
  }

  async createUser(ninData, email, session) {
    const existingUser = await this.findUserByEmail(email, session);
    if (existingUser) return null;
    // Create User
    const [newUser] = await db.User.create(
      [
        {
          ninId: ninData._id,
          email,
        },
      ],
      { session },
    );

    return newUser;
  }

  async findUserByEmail(email, session) {
    const user = session
      ? await db.User.findOne({ email }).populate("ninId").session(session)
      : await db.User.findOne({ email }).populate("ninId");
    return user;
  }

  async checkCredentails(email, password) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) return null;
    // Check if the password matches the password in the db
    const passwordsMatch = await comparePasswords(
      password,
      existingUser?.passwordHash,
    );

    if (!passwordsMatch) return null;

    const { passwordHash, ...rest } = existingUser;
    return rest;
  }

  async delete(id) {
    const user = await this.findUserById(id);
    if (!user) return { deleted: false };

    await db.User.deleteOne({ _id: id });
    return { deleted: true };
  }

  async updateUser(id, data) {
    const user = await this.findUserById(id);
    if (!user) return { error: "User Not Found!" };

    let hashedPassword = data.password
      ? await hashPassword(data.password)
      : user.passwordHash;

    const updatedUser = await db.User.findByIdAndUpdate(id, {
      ...data,
      passwordHash: hashedPassword,
    });

    if (data.password) {
      return { user: updatedUser };
    } else {
      const { passwordHash, ...rest } = updatedUser;
      return { user: rest };
    }
  }

  async addUserAccount(userId, newAccountId) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const updatedAccounts = await db.User.findByIdAndUpdate(userId, {
      accounts: [...user.accounts, newAccountId],
    });
    return updatedAccounts;
  }

  async deleteUserAccount(userId, accountId) {
    const user = await this.findUserById(userId);
    user.accounts = user.accounts.filter((acc) => acc.id !== accountId);
    await user.save();
    return { deleted: true };
  }

  async randomManagerAccountId() {
    const users = await db.User.find({
      role: "manager",
    })
    .populate("ninId")
    .exec();
    if (users.length < 0) return null;

    let managerIds = [];
    users.map((user) => {
      managerIds.push(user._id.toString());
    });

    return managerIds[Math.floor(Math.random() * managerIds.length)];
  }
}

module.exports = new UserService();
