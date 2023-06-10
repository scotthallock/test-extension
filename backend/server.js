import express from 'express';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import http from 'http';

const SOCKETFILE = '/run/guest-services/backend.sock';
const app = express();

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

// Access the Docker socket and make a request to view all containers on the host.
// We can do this because we bound the the socket from the host in the docker-compose.yaml file.

// Docs for the REST API: https://docs.docker.com/engine/api/v1.43/
const requestOptions = {
  socketPath: '/var/run/docker.sock',
  path: '/containers/json?all=true',
};

const httpRequest = http.request(requestOptions, (res) => {
  let data = '';

  // A chunk of data has been received.
  res.on('data', (chunk) => (data += chunk));

  // The whole response has been received. Print out the result.
  res.on('end', () => {
    const parsedData = JSON.parse(data);
    parsedData.forEach((container) => console.log(container.Names, container.Id));
  });
});

httpRequest.end(); // send the request

// const ID = '083cd15faa7f';

// const logsRequest = http.request(
//   {
//     socketPath: '/var/run/docker.sock',
//     path: `/containers/${ID}/logs?stdout=true`,
//   },
//   (res) => {
//     console.log('made the logs request....');
//     let data = '';

//     // A chunk of data has been received.
//     res.on('data', (chunk) => (data += chunk));

//     // The whole response has been received. Print out the result.
//     res.on('end', () => {
//       console.log('request ended');
//       // const parsedData = JSON.parse(data);
//       // console.log(parsedData);
//       console.log(data);
//     });
//   }
// );

// logsRequest.end();
