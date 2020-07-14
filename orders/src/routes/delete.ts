import { Router, Request, Response } from 'express';

import {
  natsWrapper,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@bavjacksontickets/common';

import { Order, OrderStatus } from '../models/order';

import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;

    await order.save();

    // publish an event to say this was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
