const db = require("../db/index");
const { generateNinNumber, getAge } = require("../utils/nin.utils");
const userService = require("./user.service");

const ninService = {

  async findNinByNumber(nin) {
    const userNin = await db.Nin.findOne({ nin: Number(nin) });
    if (!userNin) return {error: "No nin found"};
    return {userNin};
  },

  async fetchAllNins() {
    const nins = await db.Nin.find().exec();
    return nins;
  },

  async findNinById(id) {
    const nin = await db.Nin.findById(id);
    if (!nin) return {error: "Nin not found", code: 404};
    return nin;
  },

  async createNinUser(data, session) {
    const existingNinUser = await userService.findUserByEmail(data.email, session);
    if (existingNinUser) return {error: "Nin already exists for this user", code: 409};
    const age = getAge(data.dateOfBirth);
    if (age < 13) return {error: "You are too young to create Nin", code: 400};
    // Create Nin and User
    const ninNumber = generateNinNumber();
    const [newNin] = await db.Nin.create(
      [{
        ...data,
        nin: ninNumber,
      }],
      { session },
    );

    const {error, code} = await userService.createUser(
      newNin,
      data.email,
      session,
    );

    if (error) return {error, code};

    return {info: newNin};
  },

  async updateUserNin(nin, data) {
    const userNin = await this.findNinByNumber(nin);
    if (!userNin) return null;
    const updatedNin = await db.Nin.findByIdAndUpdate(userNin._id, {
      ...data,
    });
    return updatedNin;
  },

  async deleteNinById(id) {
    await db.Nin.findByIdAndDelete(id);
    return { deleted: true };
  },

  async deleteNinByUserEmail(email) {
    const nin = await db.Nin.findOne({email});
    if (!nin) return {error: "Nin not found", deleted: false};
    const {deleted} = await this.deleteNinById(nin._id);
    return {deleted};
  }
}

module.exports = ninService;
