import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { validate } from '../middleware/validate.js';
import { searchRestaurantsSchema } from '../validators/search.validator.js';

const router = Router();

router.get('/restaurants', validate({ query: searchRestaurantsSchema }), searchController.searchRestaurants);

export { router as searchRoutes };
