const prisma = require("./prisma");
const bcrypt = require("bcryptjs");

async function createUser(userData) {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.User.create({
      data: {
        username: userData.username,
        password: hashedPassword,
      },
    });
    return { username: newUser.username };
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

module.exports = {
  createUser,
};
