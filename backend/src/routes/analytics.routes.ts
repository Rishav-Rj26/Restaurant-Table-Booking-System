import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, requireRestaurantAccess } from '../middleware/rbac.js';

const router = Router();

// All analytics routes require staff authentication
router.use(authenticate);

router.get(
  '/:restaurantId/overview',
  authorize('owner', 'manager'),
  requireRestaurantAccess('restaurantId'),
  analyticsController.getOverview
);

export { router as analyticsRoutes };
