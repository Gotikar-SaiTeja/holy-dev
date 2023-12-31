import secrets from '@/config/secrets';
import User from '@/models/users/user.model';
import { sendSMS, verifyOTP } from '@/services/twilio.services';
import { UserStatus } from '@/typings/enums';
import cookieToken from '@/utils/cookie-token';
import CoffeeError from '@/utils/custom-error';
import toIND from '@/utils/to-ind';
import { NextFunction, Request, Response } from 'express';
import Play from '@/models/play.model';

type P = {
  rq: Request;
  rs: Response;
  n: NextFunction;
};

/**
 * Find All Users
 * @param req
 * @param res
 * @param next
 */

export const getAllUsers = async (req: P['rq'], res: P['rs']) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Find User by ID
 * @param req
 * @param res
 * @param next
 */
export const getUserById = async (req: P['rq'], res: P['rs']) => {
  try {
    const user = await User.findById({ _id: req.params.user_id });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Delete User by ID
 * @param req
 * @param res
 * @param next
 */
export const deleteUserById = async (req: P['rq'], res: P['rs']) => {
  try {
    const user = await User.deleteOne({ _id: req.params.user_id });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Sign Up User
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const signUp = async (req: P['rq'], res: P['rs'], next: P['n']) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return next(new CoffeeError('Required', 400));
  }
  try {
    /**
     * For Sending OTP to the user phone
     */
    const india = toIND(phone);
    await sendSMS(india);
    const user = await User.create({
      name,
      phone,
      password,
     
    });
    await cookieToken<typeof user>(user, res);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Confirm OTP
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const confirmOTP = async (req: P['rq'], res: P['rs'], next: P['n']) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return next(new CoffeeError('OTP is required', 400));
  }
  try {
    const india = toIND(phone);
    const response = await verifyOTP(india, otp);
    if (response.status === UserStatus.APPROVED) {
      const user = await User.findOneAndUpdate(
        { phone },
        { status: UserStatus.APPROVED },
        { new: true }
      );

      user.save();
      res.status(200).json(user);   
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Sign In User
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const signIn = async (req: P['rq'], res: P['rs'], next: P['n']) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return next(new Error('Email and password Required '));
  }
  const user = await User.findOne({ phone }).select('+password');
  console.log({ user });
  if (!user) {
    return next(new Error('Email and password not matched '));
  }
  const isCorrectPassword = await user.checkValidPassword(password);
  if (!isCorrectPassword) {
    return next(new Error('Not Registered User'));
  }
  await cookieToken(user, res);
  
  // Retrieve recently played songs for the user
  const userId = user._id; 
  const userRecentlyPlayed = await Play.find({ userId }).sort({ timestamp: -1 });
  res.status(200).json({ user, recentlyPlayed: userRecentlyPlayed });

};

export const play =  async (req, res) => {
  try {
    const { userId, song } = req.body;

    // Log the recently played song
    const timestamp = new Date();
    const newSong = new Play({ userId, song, timestamp });
    await newSong.save();

    res.status(200).json({ message: 'Song played and logged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging the song' });
  }
};

// Retrieve a user's recently played songs
export const recentlyPlayed = async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve recently played songs for the user
    const userRecentlyPlayed = await Play.find({ userId }).sort({ timestamp: -1 });

    res.status(200).json({ userRecentlyPlayed });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Error retrieving recently played songs' });
  }
};

/**
 * Log Out User
 * @param req
 * @param res
 * @param next
 */
export const logOut = async (req: P['rq'], res: P['rs'], next: P['n']) => {
  res.cookie(secrets.token, null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logout User Successfully',
  });
};
/**
 * Forget Password
 */
export const forgetPassword = async (
  req: P['rq'],
  res: P['rs'],
  next: P['n']
) => {
  const { phone } = req.body;
  if (!phone) {
    return next(new Error('Email Required'));
  }
  const user = await User.findOne({ phone });
  console.log({ user });
  if (!user) {
    return next(new Error('Email and password not matched '));
  }
  const token = await user.getForgetPasswordToken();
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: 'Reset Password Token Send to Your Email',
    token,
  });
};
/**
 * Reset Password
 */

export const resetPassword = async (
  req: P['rq'],
  res: P['rs'],
  next: P['n']
) => {
  const { password, token } = req.body;

  if (!password) {
    return next(new Error('Password Required'));
  }
  if (!token) {
    return next(new Error('Token Required'));
  }

  const user = await User.findOne({
    forgetPasswordToken: token,
  });

  if (!user) {
    return next(new Error('Invalid Token'));
  }
  user.password = password;
  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;
  await user.save();
  await cookieToken(user, res, {
    message: 'Password Reset Successfully',
  });
};
