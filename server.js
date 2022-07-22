// server.js
// where your node app starts

const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet')

const app = express();

// compress our client side content before sending it over the wire
app.use(compression());
// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: 'https://trello.com' }));
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    'geolocation=(self "https://pretty-print-board.herokuapp.com/"), microphone=()'
  );
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://*.trellocdn.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        frameAncestors: ['*'],
      },
    },
    frameguard: false,
    hsts: {
      maxAge: 63072000,
      preload: true,
    }
  })
);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

