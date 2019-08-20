require('dotenv').config();

const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(require('./routes'));

require('./app/controllers/index')(app);

app.listen(process.env.PORT || 3000);
