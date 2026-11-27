const db = require("../db/index");
const { comparePasswords, hashPassword } = require("../utils/password.utils");

const userService = {
  async findAllUsers() {
    return await db.User.find({}).populate("ninId").lean();
  },

  async findUserById(id) {
    const user = await db.User.findById(id).populate("ninId").lean();
    if (!user) return { error: "User not found", code: 404 };

    return { user };
  },

  async createUser(ninData, email, session) {
    const existingUser = await this.findUserByEmail(email, session);
    if (existingUser) return { error: "User not found", code: 404 };
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

    return { newUser };
  },

  async findUserByEmail(email, session) {
    const user = session
      ? await db.User.findOne({ email }).session(session)
      : await db.User.findOne({ email });
    return user;
  },

  async checkCredentails(email, password) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) return { error: "Invalid credentials", code: 400 };
    // Check if the password matches the password in the db
    const passwordsMatch = await comparePasswords(
      password,
      existingUser?.passwordHash,
    );

    if (!passwordsMatch) return { error: "Invalid Credentials", code: 400 };

    return { user: existingUser };
  },

  async deleteUserById(id) {
    await db.User.findByIdAndDelete(id);
    return { deleted: true };
  },

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

    return { user: updatedUser };
  },

  async addNewAccountToUser(userId, newAccountId) {
    const { error, code, user } = await this.findUserById(userId);
    if (error) return { error, code };
    const updatedAccounts = await db.User.findByIdAndUpdate(userId, {
      accounts: [...user.accounts, newAccountId],
    });
    return { updatedAccounts };
  },

  async deleteUserAccountByAccountIdAndUserId(userId, accountId) {
    const user = await this.findUserById(userId);
    user.accounts = user.accounts.filter((acc) => acc.id !== accountId);
    await user.save();
    return { deleted: true };
  },

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
  },
};

module.exports = userService;
