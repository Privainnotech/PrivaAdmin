const express = require('express');
const app = express();
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const cors = require('cors')
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(cors());

// app.set('view engine', 'html');
app.set('views', path.join(__dirname, "views"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/asset'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/script'));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    cookie: {
        maxAge: 60000
    },
    store: new session.MemoryStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));

app.use(flash());

let indexRoute = require('./src/routes/index');
let userRoute = require('./src/routes/user');

app.use('/', indexRoute)
app.use('/user', userRoute)

app.listen(PORT, () => console.log(`Server is listening on ${PORT}`))
