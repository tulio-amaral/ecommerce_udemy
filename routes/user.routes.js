import express from 'express';

import { userByID, read, update } from '../controllers/user.js';
import { requireSignIn, isAuth, isAdmin } from '../controllers/auth.js';

const router = express.Router();

router.get('/secret/:userId', requireSignIn, isAuth, isAdmin, (request, response) => {
  response.json({
    user: request.profile,
  });
});

router.get('/user/:userId', requireSignIn, isAuth, read);

router.put('/user/:userId', requireSignIn, isAuth, update);

router.param('userId', userByID);

export default router;
