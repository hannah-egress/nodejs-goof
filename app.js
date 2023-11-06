/**
 * Module dependencies.
 */

// mongoose setup
require('./mongoose-db');
require('./typeorm-db')

var st = require('st');
var crypto = require('crypto');
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session')
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var optional = require('optional');
var marked = require('marked');
var fileUpload = require('express-fileupload');
var dust = require('dustjs-linkedin');
var dustHelpers = require('dustjs-helpers');
var cons = require('consolidate');
const hbs = require('hbs')
const limit = require("express-limit").limit;

var app = express();
var routes = require('./routes');
var routesUsers = require('./routes/users.js')

// all environments
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3001);
app.engine('dust', cons.dust);
app.engine('hbs', hbs.__express);
cons.dust.helpers = dustHelpers;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
  secret: 'keyboard cat',
  name: 'connect.sid',
  cookie: { path: '/' }
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// Routes
const rateLimit = limit({
  max: 5, // 5 requests
  period: 60 * 1000, // per minute (60 seconds)
});
app.use(routes.current_user);
app.use(rateLimit);
app.get('/', rateLimit, routes.index);
app.get('/login', rateLimit, routes.login);
app.post('/login', rateLimit, routes.loginHandler);
app.get('/admin', rateLimit, routes.isLoggedIn, routes.admin);
app.get('/account_details', rateLimit, routes.isLoggedIn, routes.get_account_details);
app.post('/account_details', rateLimit, routes.isLoggedIn, routes.save_account_details);
app.get('/logout', rateLimit, routes.logout);
app.post('/create', rateLimit, routes.create);
app.get('/destroy/:id', rateLimit, routes.destroy);
app.get('/edit/:id', rateLimit, routes.edit);
app.post('/update/:id', rateLimit, routes.update);
app.post('/import', rateLimit, routes.import);
app.get('/about_new', rateLimit, routes.about_new);
app.get('/chat', rateLimit, routes.chat.get);
app.put('/chat', rateLimit, routes.chat.add);
app.delete('/chat', rateLimit, routes.chat.delete);
app.use('/users', rateLimit, routesUsers)

// Static
app.use(st({ path: './public', url: '/public' }));

// Add the option to output (sanitized!) markdown
marked.setOptions({ sanitize: true });
app.locals.marked = marked;

// development only
if (app.get('env') == 'development') {
  app.use(errorHandler());
}

var token = 'SECRET_TOKEN_f8ed84e8f41e4146403dd4a6bbcea5e418d23a9';
console.log('token: ' + token);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
