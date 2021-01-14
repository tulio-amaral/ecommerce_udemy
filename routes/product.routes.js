import express from 'express';

import { requireSignIn, isAuth, isAdmin } from '../controllers/auth.js';
import { userByID } from '../controllers/user.js';
import 
{ 
  productById, 
  create, 
  list, 
  listRelated, 
  listCategoriesInProducts,
  listBySearch, 
  read, 
  remove, 
  update,
  photo 
} from '../controllers/product.js';

const router = express.Router();

router.get('/product/:productId', read) //list product by ID
router.get('/products', list) //list all products
router.get('/products/related/:productId', listRelated) //list related products
router.get('/products/categories', listCategoriesInProducts) //list related products
router.get('/products/photo/:productId', photo); // list photos of a product


router.post('/product/create/:userId', requireSignIn, isAuth, isAdmin, create);
router.post("/products/by/search", listBySearch);
router.delete('/product/:productId/:userId', requireSignIn, isAuth, isAdmin, remove);
router.put('/product/:productId/:userId', requireSignIn, isAuth, isAdmin, update);


router.param('userId', userByID);
router.param('productId', productById);

export default router;