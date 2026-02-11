const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://coverdalesteven_db_user:D49TW4oWO8piH6JB@cluster0.wtu8huk.mongodb.net/chat_app_lab?retryWrites=true&w=majority&appName=Cluster0'
    );
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;