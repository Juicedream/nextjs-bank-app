const { isValidObjectId } = require("mongoose");
const { throwError } = require("../middlewares/error.handler.middleware");
const successResponse = require("../middlewares/success.response.handler");
const authService = require("../services/auth.service");
const mailService = require("../services/mail.service");
const ninService = require("../services/nin.service");
const serverCookie = require("../utils/cookie.utils");

const AuthController = {
  async login(req, res, next){
     // #swagger.tags = ['Auth']
    // #swagger.summary = 'Login in with email and password'
    // #swagger.description = 'Validates the credentials and returns an access token and sends a login mail'
    let {email, password} = req.body;
    if (!email || !password) return next(throwError("Email and password are required", 400));
    email = email.toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) return next(throwError("Please provide a valid email"));
    
    const {error, code, accessToken, user} = await authService.login(email, password);
    if (error) return next(throwError(error, code));

    // Send login mail
    await mailService.send.loginEmail(email, 
      `
        <p>Dear <b>${user.firstName}</b>,</p>
          <p>You have successfully logged in to your Next Online Banking Service on ${new Date(Date.now()).toISOString()}</p>
  
          <br>
          <br>

          <p>If you did not initiate this. kindly reach out to admin@nextbank.com</p>
          <br>
          <p style="color: red;">DO NOT SHARE TOKEN, OTP CODE, PINS OR CARD DETAILS WITH ANYONE</p>
          <br>
          <p>"Why are we sending this?" We take security very seriously and we want to keep you aware of all important actions in your Next Online Bank profile.</p>
          <p>Best regards,</p>
          <p>The Next Online Banking Team.🫶🏻</p>
          <br>
          <p>Made with ❤️ by Next Bank &copy; ${new Date().getFullYear()}</p>
      `
    )

    // set token in cookie
    serverCookie.set(res, "accessToken", accessToken);

    return successResponse(res, "Login successful", 200, {accessToken});
  },

  async forgotPassword (req, res, next) {
     // #swagger.tags = ['Auth']
    // #swagger.summary = 'Forgot password via email'
    // #swagger.description = 'Validates the email from the database and sends otp code to the email validated'
    let {email} = req.body;
    email = email.toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) return next(throwError("Please provide a valid email"));

    const {error, code, otpCode, expiresIn, user} = await authService.forgotPassword(email);

    if (error) return next(throwError(error, code));

    // Send mail to user
    await mailService.send.forgotPasswordMail(email, otpCode, 
      `
       <p>Dear <b>${user.firstName}</b>,</p>
          <p>Your forgot password request has been proccessed successfully!</p>
          <p>🔑 OTP Code: <b style="font-size:18px;">${otpCode}</b></p>
          <p>
            <i>This code expires in: ${expiresIn}</i>. Kindly make use of the code to reset your password.
          </p>
          <br>
          <br>
          <p>If you did not initiate this. kindly reach out to admin@nextbank.com</p>
          <p>Made with ❤️ by Next Bank &copy; ${new Date().getFullYear()}</p>
      `
    )
    return successResponse(res, "If user exists, a mail will be sent to you", 200);
  },
  async passwordReset(req, res, next) {
     // #swagger.tags = ['Auth']
    // #swagger.summary = 'Reset password for user'
    // #swagger.description = 'Validates the email, otpCode, password and confirm password before updating the users password in the database'
    let {email, otpCode, password, confirmPassword} = req.body;
    if (!email || !otpCode || !password || !confirmPassword) return next(throwError("email, otpCode, password and confirmPassword are required", 400));
    
    if (password !== confirmPassword) return next(throwError("Passwords do not match", 400));
    
    email = email.toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) return next(throwError("Please provide a valid email")); 

    const {error, code, user} = await authService.resetPassword(email, otpCode, password);

    if (error) return next(throwError(error, code));

    
    // Send success password reset mail
    await mailService.send.resetPasswordMail(email, 
      `
       <p>Dear <b>${user.firstName}</b>,</p>
          <p>Your password reset was successful at ${new Date(Date.now()).toISOString()}!</p>
          <br>
          <br>
          <p>If you did not initiate this. kindly reach out to admin@nextbank.com</p>
          <p>Made with ❤️ by Next Bank &copy; ${new Date().getFullYear()}</p>
      `
    );

    return successResponse(res, "Password reset was successful, kindly login", 201);
  },
  async logout(req, res, next) {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Logouts user session via accessToken'
    // #swagger.description = 'Invalidates the session from the database and the cookies'
    // #swagger.security = [{ "bearerAuth": [] }]

    const {_id} = req.user;
    const accessToken = req.accessToken;
    if (!accessToken) return next(throwError("Access Token is required", 400));
    if (!_id || !isValidObjectId(_id)) return next(throwError("Please provide a valid user id", 400));
    const {error, code} = await authService.logout(_id, accessToken);
    if (error) return next(throwError(error, code));

    // Invalidate session
    serverCookie.remove(res, "accessToken");

    return successResponse(res, "Logged out successfully", 200);
  },

  async getNewAccessToken(req, res, next) {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Get new access token'
    // #swagger.description = 'Invalidates the session from the database and the cookies and returns new accessToken and saves to the request cookies.'
    // #swagger.security = [{ "bearerAuth": [] }]

    const {_id} = req.user;
    const accessToken = req.accessToken;
    if (!accessToken) return next(throwError("Access Token is required", 400));
    if (!_id || !isValidObjectId(_id)) return next(throwError("Please provide a valid user id", 400));
    const {error, code, newAccessToken} = await authService.getNewAccessToken(_id, accessToken);
    if (error) return next(throwError(error, code));
    serverCookie.remove(res, "accessToken");
    serverCookie.set(res, "accessToken", newAccessToken);

    return successResponse(res, "New access token generated successfully", 201, {accessToken: newAccessToken});
  },

  async me(req, res, next) {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Return authenticated user info'
    // #swagger.description = 'It validates the accessToken and returns current logged in user'
    // #swagger.security = [{ "bearerAuth": [] }]
    const {email} = req.user;
    const {error, code, data} = await authService.me(email);
    if (error) return next(throwError(error, code));
    return successResponse(res, "User Info", 200, {...data});
  }
}


module.exports = AuthController;