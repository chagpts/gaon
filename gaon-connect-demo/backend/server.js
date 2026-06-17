const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'gaon-connect';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';

if (!MONGO_URI) {
  console.error('MONGO_URI가 .env에 설정되어 있지 않습니다.');
  process.exit(1);
}

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

const client = new MongoClient(MONGO_URI);

let db;

async function connectDB() {
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`MongoDB connected: ${DB_NAME}`);
}

app.get('/', (req, res) => {
  res.json({
    message: 'Gaon Connect API server is running',
  });
});

/**
 * 특정 incorporation 신청서 1개 조회
 * 예:
 * GET /api/incorporations/698a8e207382e4a43f5c38bf
 */
app.get('/api/incorporations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: '올바르지 않은 신청서 ID입니다.',
      });
    }

    const incorporation = await db.collection('incorporations').findOne({
      _id: new ObjectId(id),
    });

    if (!incorporation) {
      return res.status(404).json({
        message: '신청 정보를 찾을 수 없습니다.',
      });
    }

    res.json(incorporation);
  } catch (error) {
    console.error('GET /api/incorporations/:id error:', error);

    res.status(500).json({
      message: '신청 정보 조회 중 서버 오류가 발생했습니다.',
    });
  }
});

/**
 * 테스트용: 최신 incorporation 5개 조회
 * GET /api/incorporations
 */
app.get('/api/incorporations', async (req, res) => {
  try {
    const incorporations = await db
      .collection('incorporations')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json(incorporations);
  } catch (error) {
    console.error('GET /api/incorporations error:', error);

    res.status(500).json({
      message: '신청 목록 조회 중 서버 오류가 발생했습니다.',
    });
  }
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('MongoDB connection closing...');
  await client.close();
  process.exit(0);
});
