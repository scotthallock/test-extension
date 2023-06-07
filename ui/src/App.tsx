import React from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Typography, Button, TextField, Divider, Stack } from '@mui/material';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const ddClient = useDockerDesktopClient();
  const [containers, setContainers] = React.useState<Array<any>>();
  const [stats, setStats] = React.useState<Array<any>>();
  const [containerId, setContainerId] = React.useState<string>('');

  const listContainers = async () => {
    // The `exec()` method is essentially running command in the terminal.
    // The code below runs `docker ps` with additional options.
    console.log('listing containers...');
    try {
      const result = await ddClient.docker.cli.exec('ps', [
        '--all', // list all containers (default shows just running)
        '--format', // format as a json object
        '"{{json .}}"',
      ]);
      setContainers(result.parseJsonLines());
    } catch (err) {
      console.error(err);
    }
  };

  const listContainerStats = async () => {
    console.log('listing stats...');
    try {
      const result = await ddClient.docker.cli.exec('stats', [
        '--no-stream', // disable streaming and only pull the first result
        '--no-trunc', // do not truncate output
        '--format', // format as a json object
        '"{{json .}}"',
        containerId, // show the stats for this specific container
      ]);
      setStats(result.parseJsonLines());
      console.log(result.parseJsonLines());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Typography variant="h3">Test extension</Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Click the button to see a list of all containers.
      </Typography>

      <Button variant="contained" onClick={listContainers} sx={{ mt: 2 }}>
        List containers
      </Button>

      {containers &&
        containers.map(({ Names, ID, Image, Size, State, Status }) => (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {`${Names} ${ID}, ${Image}, ${Size}, ${State}, ${Status}`}
          </Typography>
        ))}

      <Divider />

      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Copy/paste a container Id from above into this input, then click the button to view that
        container's stats.
      </Typography>

      <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
        <TextField
          label="Container ID"
          defaultValue="Hello World"
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
        />

        <Button variant="contained" onClick={listContainerStats} sx={{ mt: 2 }}>
          List Stats
        </Button>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Stats: {stats && JSON.stringify(stats)}
      </Typography>
    </>
  );
}
