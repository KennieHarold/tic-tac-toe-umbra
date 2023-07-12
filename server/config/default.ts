import dotenv from 'dotenv';

dotenv.config();

export default {
  port: 8080,
  host: 'localhost',
  baseApiUrl: '/api/v1',
  mongodbUrl: process.env.MONGODB_URL
};
