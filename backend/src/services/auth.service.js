const otp = require("../utils/otp.utils");
const { hashPassword } = require("../utils/password.utils");
const jwtService = require("./jwt.service");
const userService = require("./user.service");
const ninService = require("./nin.service");
const accountService = require("./account.service")

const authService = {

  async me(email) {
    const user = await userService.findUserByEmail(email);
    if (!user) return {error: "User not found", code: 404}
    const nin = await ninService.findNinById(user.ninId);
    const accounts = await accountService.allAccountsWithUserId(user._id)
    const data = {
      user,
      nin,
      accounts,
    }
    return {data};
  },

  async getNewAccessToken(userId, accessToken) {
      const {error, code, user} = this.logout(userId, accessToken);
      if (error) return {error, code};

      // Create new token
      const newAccessToken = jwtService.generateAccessToken(
      user._id,
      user.role,
      user.email,
    );
    // Upate accessToken in user record
    const newAccessTokenHash = await jwtService.hashAccessToken(newAccessToken);

    const {error: updateUserError, user: updatedUser} = await userService.updateUser(user._id, {
      accessTokenHash: newAccessTokenHash
    });

    if (updateUserError) return {error: updateUserError};


    return { newAccessToken };

  },
  
  async login(email, password) {
    const { error, code, user } = await userService.checkCredentails(
      email,
      password,
    );

    
    if (error) return { error, code };
    
    // Generate Access token
    const accessToken = jwtService.generateAccessToken(
      user._id,
      user.role,
      user.email,
    );
    
    // Upate accessToken in user record
    const accessTokenHash = await jwtService.hashAccessToken(accessToken);

    const {error: updateUserError, user: updatedUser} = await userService.updateUser(user._id, {
      accessTokenHash
    });

    if (updateUserError) return {error: updateUserError};

    // Get user first name
    const nin = await ninService.findNinById(user.ninId);

    return { accessToken, user: { ...updatedUser, firstName: nin.firstName} };
  },

  async logout(userId, accessToken) {
    const { error, user, code } = await userService.findUserById(userId);
    if (error) return { error, code };
    if (!user.accessTokenHash) return {error: "No session available, please login", code: 400};
    // compare accessToken with user accesstoken hash
    const isTokensMatch = await jwtService.compareAccessTokens(accessToken, user.accessTokenHash);
    if (!isTokensMatch) return {error: "Invalid access token provided for user", code: 400}
    // update the user info
    const {error: updateUserError, user: updatedUser} = await userService.updateUser(userId, {
      accessTokenHash: null,
    });

    if (updateUserError) return {error: updateUserError};

    return {user: updatedUser};
  },

  async forgotPassword(email) {
    const user = await userService.findUserByEmail(email);
    if (!user)
      return { error: "If user exists, a mail will be sent to you", code: 404 };
    // Generate otp for user
    const otpCode = otp.generate();
    const otpHash = await otp.hash(otpCode);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const {error, user: updatedUser} = await userService.updateUser(user._id, { otpHash, otpExpiresAt, accessTokenHash: null });
    if (error) return {error};

    const nin = await ninService.findNinById(user.ninId);

    return { user: {...updatedUser, firstName: nin.firstName}, otpCode, expiresIn: "5 minutes" };
  },

  async resetPassword(email, otpCode, newPassword) {
    const user = await userService.findUserByEmail(email);
    if (!user) return { error: "User not found", code: 404 };
    if (!user.otpHash) return {error: "Invalid or expired otp", code: 400};
    // compare otpcode provided
    const isOtpCodesMatch = await otp.compareOtps(otpCode, user.otpHash);
    if (!isOtpCodesMatch) return { error: "Invalid otp code", code: 400 };
    if (user.otpExpiresAt < new Date(Date.now())){
      const {error: updateUserError} = await userService.updateUser(user._id, {otpHash: null, otpExpiresAt: null});

      if (updateUserError) return {error: updateUserError};

      return { error: "Expired otp code", code: 400 };
    }

    if (newPassword.length < 8)
      return { error: "Password must be at least 8 characters", code: 400 };

    // update user password
    const passwordHash = hashPassword(newPassword);

    const { error, user: updatedUser } = await userService.updateUser(
      user._id,
      {
        passwordHash,
        otpHash: null,
        otpExpiresAt: null,
      },
    );

    if (error) return { error };

    const nin = await ninService.findNinById(user.ninId);

    return { user: {...updatedUser, firstName: nin.firstName} };
  }
}

module.exports = authService;
