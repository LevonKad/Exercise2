const http = require('http');
const cookie = require('cookie');

function formatDate(date) {
  const options = {
    weekday: 'short', year: 'numeric',
    month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    second: '2-digit', timeZoneName: 'short',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

const server = http.createServer((req, res) => {
  // Ignore favicon.ico requests
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/special-page') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is a special page!');
    return;
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  console.log('Parsed cookies:', cookies); // Debugging statement

  let numOfVisits = 1;
  let lastVisit = '';

  if (cookies.visits) {
    numOfVisits = Number(cookies.visits) + 1;
    if (cookies.lastVisit) {
      lastVisit = new Date(cookies.lastVisit);
    }
  }

  const now = new Date();
  const maxAge = 24 * 60 * 60; // 24 hours in seconds

  res.setHeader('Set-Cookie', [
    cookie.serialize('visits', String(numOfVisits), {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'strict', // Add 'sameSite' attribute for security
      maxAge: maxAge, // Set cookie expiration to 24 hours
    }),
    cookie.serialize('lastVisit', now.toISOString(), {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'strict', // Add 'sameSite' attribute for security
      maxAge: maxAge, // Set cookie expiration to 24 hours
    }),
  ]);

  console.log('Setting cookies:', {
    visits: numOfVisits,
    lastVisit: now.toISOString(),
  }); // Debugging statement

  res.writeHead(200, { 'Content-Type': 'text/html' });
  if (numOfVisits === 1) {
    res.end('Welcome to my webpage! It is your first time here.');
  } else {
    res.end(
      `Hello, this is the ${numOfVisits} time that you are visiting my webpage.<br>` +
      `Last time you visited my webpage on: ${formatDate(lastVisit)}`
    );
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Server is running on http://localhost:' + port);
});
