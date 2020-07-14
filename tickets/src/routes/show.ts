import { Router, Request, Response } from 'express';
import { body } from 'express-validator';

import {
  requireAuth,
  validateRequest,
  NotFoundError,
} from '@bavjacksontickets/common';

import { Ticket } from '../models/ticket';

const router = Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
