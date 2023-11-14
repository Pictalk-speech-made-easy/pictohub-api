export default () => ({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:8080',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'random',
  },
});
