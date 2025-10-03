import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/profile')
  .get(authenticate, getUserProfile)
  .put(authenticate, updateUserProfile);

export default router;