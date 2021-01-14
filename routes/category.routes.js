import express from 'express';

import { categoryById, create, read, list, update, remove  } from '../controllers/category.js';
import { requireSignIn, isAuth, isAdmin } from '../controllers/auth.js';
import { userByID } from '../controllers/user.js';

const router = express.Router();

router.post('/category/create/:userId', requireSignIn, isAuth, isAdmin, create);
router.get('/category/:categoryId', read);
router.get('/categories', list);
router.put('/category/:categoryId/:userId', requireSignIn, isAuth, isAdmin, update);
router.delete('/category/:categoryId/:userId', requireSignIn, isAuth, isAdmin, remove);

router.param('userId', userByID);
router.param('categoryId', categoryById);

export default router;
