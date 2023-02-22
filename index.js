const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const pollsRoute = require('./routes/polls')
const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use('/polls',pollsRoute)
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
