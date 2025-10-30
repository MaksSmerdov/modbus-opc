const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/modbus-opc',
  options: {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }
};

export default dbConfig;

