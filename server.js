// server.js

// set up ======================================================================
// get all the tools we need
require('dotenv').config()
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8081;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

let db

const neighborhoods = ["Center City",
  "South Philadelphia",
  "Southwest Philadelphia",
  "Lower North Philadelphia",
  "West Philadelphia",
  "Upper North Philadelphia",
  "Port Richmond",
  "Kensington",
  "Roxborough-Manayunk",
  "Germantown-Chestnut Hill",
  "Olney-Oak Lane",
  "Near Northeast Philadelphia",
  "Far Northeast Philadelphia"]

  const zipcodes = [19102, 19103, 19104, 19106, 19107, 19109, 19111, 19112, 19114, 19115, 19116, 19118, 19119, 19120, 19121, 19122, 19123, 19124, 19125, 19126, 19127, 19128, 19129, 19130, 19131, 19132, 19133, 19134, 19135, 19136, 19137, 19138, 19139, 19140, 19141, 19142, 19143, 19144, 19145, 19146, 19147, 19148, 19149, 19150, 19151, 19152, 19153, 19154]

  


console.log(process.env, process.env.MONGOURL)
// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db, ObjectId, neighborhoods, zipcodes);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021b', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
