import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    API_URL: process.env.API_URL || 'http://192.168.0.231:3000',
  },
});
