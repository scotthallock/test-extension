import express from 'express';
import fs from 'fs';

const app = express();
const SOCKETFILE = '/run/guest-services/backend.sock';

// After a server is done with the unix domain socket, it is not automatically destroyed.
// You must instead unlink the socket in order to reuse that address/path.
// To do this, we delete the file with fs.unlinkSync()
try {
  fs.unlinkSync(SOCKETFILE);
  console.log('Deleted the UNIX socket file.');
} catch (err) {
  console.log('Did not need to delete the UNIX socket file.');
}

app.get('/hello', (req, res) => {
  console.log('ouch', Date.now());
  res.send('hello world from the server');
});

app.listen(SOCKETFILE, () => console.log(`🚀 Server listening on ${SOCKETFILE}`));
