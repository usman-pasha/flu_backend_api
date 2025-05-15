// config.js (ES Module version)

const config = {
  PORT: process.env.PORT || 8000,
  statusCode: [200, 500, 401, 400, 403],
  MAXFILES: "7d",
  LABEL: 'BACKEND-API',
  ACCESS_VALIDITY: '1d',
  ACCESS_SECRET: '9uuojdu6t36gdp39du98',
  REFRESH_VALIDITY: '7d',
  REFRESH_SECRET: '3uugfuehfie9gtygkkku',
  DB_URI_TEST: 'mongodb://localhost:27017/flu',
  DB_URI: 'mongodb+srv://mongo01:Mongo01@cluster0.bmbfj.mongodb.net/flu?retryWrites=true&w=majority&appName=Cluster0',
  NODEMAILER_USER: "noreply.ecommercemgmt@gmail.com",
  NODEMAILER_PASS: "woohgygnizajdtjj",
  USEREMAIL:"siraj.backend.dev@gmail.com"
};

export default config;
