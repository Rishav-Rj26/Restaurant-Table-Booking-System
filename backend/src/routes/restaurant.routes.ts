import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, requireRestaurantAccess } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { 
  createRestaurantSchema, 
  updateRestaurantSchema, 
  createTableSchema, 
  updateTableSchema,
  availabilityQuerySchema
} from '../validators/restaurant.validator.js';

const router = Router();

// Public routes
router.get('/:id', restaurantController.getRestaurant);
router.get('/:id/availability', validate({ query: availabilityQuerySchema }), restaurantController.getAvailability);

// All routes below require authentication
router.use(authenticate);

// Restaurant management
router.post('/', authorize('owner', 'manager'), validate({ body: createRestaurantSchema }), restaurantController.createRestaurant as any);

// Restaurant specific routes - require staff access to the restaurant
router.patch('/:id', authorize('owner', 'manager'), requireRestaurantAccess('id'), validate({ body: updateRestaurantSchema }), restaurantController.updateRestaurant);
router.get('/:id/bookings', authorize('owner', 'manager', 'host'), requireRestaurantAccess('id'), restaurantController.getRestaurantBookings);

// Table management
router.get('/:id/tables', authorize('owner', 'manager', 'host'), requireRestaurantAccess('id'), restaurantController.getTables);
router.post('/:id/tables', authorize('owner', 'manager'), requireRestaurantAccess('id'), validate({ body: createTableSchema }), restaurantController.addTable);
router.patch('/:id/tables/:tableId', authorize('owner', 'manager'), requireRestaurantAccess('id'), validate({ body: updateTableSchema }), restaurantController.updateTable);

export { router as restaurantRoutes };
