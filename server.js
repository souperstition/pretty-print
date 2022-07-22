const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const app = express();

app.use(compression());
app.use(cors({ origin: '*' }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(helmet.contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://*.trellocdn.com", "https://*.trello.com", "https://cdn.skypack.dev https://esm.sh", "https://*.fontawesome.com"],
    imgSrc: ["*"],
    fontSrc: ["*"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://*.trello.com", "https://fonts.googleapis.com", "https://*.fontawesome.com"],
    frameSrc: ["'self'"],
    connectSrc: ["'self'", "https://*.fontawesome.com"],
    objectSrc: ["'none'"],
  },
}));
app.use(helmet.hsts({
  maxAge: 63072000,
  preload: true,
}));
app.use(helmet.originAgentCluster());


// app.use((req, res, next) => {
//   res.setHeader(
//     "Permissions-Policy",
//     'geolocation=(self "https://trello.com/"), microphone=()'
//   );
//   res.setHeader(
//     'Content-Security-Policy',
//     "default-src 'self'; font-src *; img-src *; script-src 'self' https://*.trellocdn.com https://*.trello.com https://cdn.skypack.dev https://esm.sh https://*.fontawesome.com; style-src 'self' 'unsafe-inline' https://*.trello.com https://fonts.googleapis.com https://*.fontawesome.com; frame-src 'self'; connect-src 'self' https://*.fontawesome.com"
//   );
//   res.setHeader(
//     'Strict-Transport-Security',
//     "max-age=63072000; preload=true; includeSubDomains"
//   );
//   res.setHeader(
//     'Access-Control-Allow-Origin',
//     '*'
//   );
//   res.setHeader(
//     'Orgin-Agent-Cluster',
//     '?false'
//   );
//   next();
// });
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

