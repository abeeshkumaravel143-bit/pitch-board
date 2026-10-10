require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const founder = { name: 'Test Founder', email: 'founder@test.com', password: 'secret123', role: 'founder' };
const founder2 = { name: 'Other Founder', email: 'founder2@test.com', password: 'secret123', role: 'founder' };
const investor = { name: 'Test Investor', email: 'investor@test.com', password: 'secret123', role: 'investor' };

const pitchBody = {
  title: 'GreenGrid',
  sector: 'Energy',
  stage: 'seed',
  fundingAsk: 250000,
  description: 'Smart grid analytics for small solar farms.',
};

let founderToken, founder2Token, investorToken, pitchId;

beforeAll(async () => {
  // A separate database, so real data is never touched
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'pitchboard_test' });
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Auth', () => {
  test('registers a founder and returns a token without the password', async () => {
    const res = await request(app).post('/api/auth/register').send(founder);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    founderToken = res.body.token;
  });

  test('rejects a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(founder);
    expect(res.status).toBe(400);
  });

  test('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: founder.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  test('logs in with the right password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: founder.email, password: founder.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('blocks /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns the current user with a valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${founderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(founder.email);
  });
});

describe('Pitches and roles', () => {
  beforeAll(async () => {
    const inv = await request(app).post('/api/auth/register').send(investor);
    investorToken = inv.body.token;
    const f2 = await request(app).post('/api/auth/register').send(founder2);
    founder2Token = f2.body.token;
  });

  test('an investor cannot create a pitch', async () => {
    const res = await request(app)
      .post('/api/pitches')
      .set('Authorization', `Bearer ${investorToken}`)
      .send(pitchBody);
    expect(res.status).toBe(403);
  });

  test('a founder can create a pitch', async () => {
    const res = await request(app)
      .post('/api/pitches')
      .set('Authorization', `Bearer ${founderToken}`)
      .send(pitchBody);
    expect(res.status).toBe(201);
    pitchId = res.body._id;
  });

  test('rejects a pitch with missing fields', async () => {
    const res = await request(app)
      .post('/api/pitches')
      .set('Authorization', `Bearer ${founderToken}`)
      .send({ title: 'Incomplete' });
    expect(res.status).toBe(400);
  });

  test('lists pitches and filters by partial sector', async () => {
    const res = await request(app)
      .get('/api/pitches?sector=ener')
      .set('Authorization', `Bearer ${investorToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('GreenGrid');
  });

  test('returns 400 for a malformed pitch id', async () => {
    const res = await request(app)
      .get('/api/pitches/not-a-real-id')
      .set('Authorization', `Bearer ${investorToken}`);
    expect(res.status).toBe(400);
  });

  test('another founder cannot delete the pitch', async () => {
    const res = await request(app)
      .delete(`/api/pitches/${pitchId}`)
      .set('Authorization', `Bearer ${founder2Token}`);
    expect(res.status).toBe(403);
  });
});

describe('Interest', () => {
  test('an investor can express interest', async () => {
    const res = await request(app)
      .post(`/api/pitches/${pitchId}/interest`)
      .set('Authorization', `Bearer ${investorToken}`)
      .send({ message: 'Interested in your seed round' });
    expect(res.status).toBe(201);
  });

  test('the same investor cannot express interest twice', async () => {
    const res = await request(app)
      .post(`/api/pitches/${pitchId}/interest`)
      .set('Authorization', `Bearer ${investorToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('a founder cannot express interest', async () => {
    const res = await request(app)
      .post(`/api/pitches/${pitchId}/interest`)
      .set('Authorization', `Bearer ${founderToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  test('the owner sees the interest on their pitch', async () => {
    const res = await request(app)
      .get('/api/interests/mine')
      .set('Authorization', `Bearer ${founderToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].investor.name).toBe(investor.name);
  });

  test('a founder who does not own the pitch sees nothing', async () => {
    const res = await request(app)
      .get('/api/interests/mine')
      .set('Authorization', `Bearer ${founder2Token}`);
    expect(res.body).toHaveLength(0);
  });
});