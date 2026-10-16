const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');
const config = require('../config');

const setAuthCookies = (res, tokens) => {
  const isProd = config.env === 'production';

  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearAuthCookies = (res) => {
  const isProd = config.env === 'production';
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
};

const register = asyncWrapper(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  setAuthCookies(res, tokens);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: { user, accessToken: tokens.accessToken },
  });
});

const login = asyncWrapper(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);
  setAuthCookies(res, tokens);
  return sendSuccess(res, {
    message: 'Login successful',
    data: { user, accessToken: tokens.accessToken },
  });
});

const refresh = asyncWrapper(async (req, res) => {
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
  console.log('================', refreshToken);
  const { user, tokens } = await authService.refresh(refreshToken);
  setAuthCookies(res, tokens);
  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: { user, accessToken: tokens.accessToken },
  });
});

const logout = asyncWrapper(async (req, res) => {
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
  if (req.user) {
    await authService.logout(req.user.id, refreshToken);
  }
  clearAuthCookies(res);
  return sendSuccess(res, {
    message: 'Logged out successfully',
  });
});

const getMe = asyncWrapper(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, {
    data: { user },
  });
});

const updateProfile = asyncWrapper(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: { user },
  });
});

const changePassword = asyncWrapper(async (req, res) => {
  await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  clearAuthCookies(res);
  return sendSuccess(res, {
    message: 'Password changed successfully. Please log in again.',
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
