import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { connectTestDb, closeTestDb } from './testDb.js';

const mockCreatePaymentIntent = jest.fn();
const mockConstructEvent = jest.fn();

jest.unstable_mockModule('../src/services/stripe.service.js', () => ({
  createPaymentIntent: mockCreatePaymentIntent,
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent
    }
  }
}));

const { default: app } = await import('../src/app.js');
const { default: Order } = await import('../src/models/Order.js');
const { default: Product } = await import('../src/models/Product.js');

const TEST_USER_ID = new mongoose.Types.ObjectId('64b000000000000000000001');

let product;

beforeAll(async () => {
  await connectTestDb();
  product = await Product.create({
    name: 'PC Portable Test',
    price: 100,
    category: 'PC',
    stock: 10
  });
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(() => {
  mockCreatePaymentIntent.mockReset();
  mockConstructEvent.mockReset();
});

describe('Checkout', () => {
  it('should create a payment intent and order', async () => {
    mockCreatePaymentIntent.mockResolvedValue({ client_secret: 'mock_secret', id: 'pi_123' });

    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', 'Bearer mock-token')
      .send({
        items: [{ product: product._id.toString(), quantity: 1, priceAtPurchase: 100 }],
        totalAmount: 100
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.clientSecret).toBe('mock_secret');
    expect(res.body.orderId).toBeDefined();

    const order = await Order.findById(res.body.orderId);
    expect(order.status).toBe('pending');
    expect(order.stripePaymentIntentId).toBe('pi_123');
  });

  it('should reject an empty cart', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', 'Bearer mock-token')
      .send({ items: [], totalAmount: 0 });

    expect(res.statusCode).toBe(400);
  });
});

describe('Stripe webhook', () => {
  it('marks the order as paid and decrements stock once', async () => {
    const order = await Order.create({
      user: TEST_USER_ID,
      items: [{ product: product._id, quantity: 2, priceAtPurchase: 100 }],
      totalAmount: 200,
      stripePaymentIntentId: 'pi_webhook'
    });

    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_webhook' } }
    });

    const payload = JSON.stringify({ id: 'pi_webhook' });

    const first = await request(app)
      .post('/api/orders/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'mock-signature')
      .send(payload);

    expect(first.statusCode).toBe(200);
    expect(first.body.received).toBe(true);

    const paidOrder = await Order.findById(order._id);
    const afterFirst = await Product.findById(product._id);
    expect(paidOrder.status).toBe('paid');
    expect(afterFirst.stock).toBe(8);

    const second = await request(app)
      .post('/api/orders/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'mock-signature')
      .send(payload);

    expect(second.statusCode).toBe(200);
    const afterSecond = await Product.findById(product._id);
    expect(afterSecond.stock).toBe(8);
  });

  it('rejects an invalid signature', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const res = await request(app)
      .post('/api/orders/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'bad-signature')
      .send(JSON.stringify({ hello: 'world' }));

    expect(res.statusCode).toBe(400);
  });
});

describe('Order tracking', () => {
  it('returns the authenticated user orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', 'Bearer mock-token');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].items[0].product).toBeDefined();
  });

  it('returns an order by id for its owner', async () => {
    const order = await Order.findOne({ user: TEST_USER_ID });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', 'Bearer mock-token');

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(order._id.toString());
  });

  it('returns 404 for an unknown order', async () => {
    const res = await request(app)
      .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', 'Bearer mock-token');

    expect(res.statusCode).toBe(404);
  });
});
