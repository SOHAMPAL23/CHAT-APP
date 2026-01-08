import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  searchUsers
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * User Routes
 * All routes are protected (require authentication)
 */

router.use(protect); // Apply protect middleware to all routes

router.get('/search', searchUsers);
router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.put('/profile', updateProfile);

export default router;

