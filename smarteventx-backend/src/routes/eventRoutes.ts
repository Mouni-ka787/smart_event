import express from 'express';
import { 
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminEvents
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(authenticate, authorize('admin', 'vendor'), createEvent);

router.route('/admin')
  .get(authenticate, authorize('admin'), getAdminEvents);

router.route('/:id')
  .get(getEventById)
  .put(authenticate, authorize('admin', 'vendor'), updateEvent)
  .delete(authenticate, authorize('admin', 'vendor'), deleteEvent);

export default router;