const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const app = express();
const apiRouter = require('./api/api');


// middleware settings
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/api', apiRouter);


// middleware errohandler
app.use(errorhandler());

const PORT = process.env.PORT || 4000 ;

app.listen(PORT, () => {
    console.log(`server listing in port:${PORT}`);
});

module.exports = app;