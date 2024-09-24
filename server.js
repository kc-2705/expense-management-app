const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDb = require('./config/connectDb');
dotenv.config();
connectDb();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

//routes
app.use('/api/v1/users', require('./routes/userRoute')); //user routes
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
