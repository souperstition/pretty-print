const compression = require('compression');
const cors = require('cors');
const express = require('express');

const app = express();

app.use(compression());
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    'geolocation=(self "https://pretty-print-board.herokuapp.com/"), microphone=()'
  );
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src *; img-src *; script-src 'self' https://*.trellocdn.com https://*.trello.com https://cdn.skypack.dev https://esm.sh https://*.fontawesome.com; style-src 'self' 'unsafe-inline' https://*.trello.com https://fonts.googleapis.com https://*.fontawesome.com; frame-src 'self'; connect-src 'self' https://*.fontawesome.com"
  );
  res.setHeader(
    'Strict-Transport-Security',
    "max-age=63072000; preload=true; includeSubDomains"
  );
  next();
});
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

