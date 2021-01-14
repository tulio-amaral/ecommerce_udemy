import express from 'express';

import { signIn, signUp, signOut } from '../controllers/auth.js';
import userSignUpValidator from '../validator/index.js';

const router = express.Router();

router.post('/signup', userSignUpValidator, signUp);
router.post('/signin', signIn);
router.get('/signout', signOut);

export default router;
