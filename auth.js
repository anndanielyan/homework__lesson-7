import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function getStatistics(command, args = [], timeout = Infinity) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const dirname = process.cwd();
    const filename = path.join(dirname, 'logs', `${timestamp}${command}.json`);
    const start = new Date().toISOString();
    let success = true;
    let commandSuccess = true;
    let error;

    const child = spawn(command, args, { shell: true });

    child.on('error', (err) => {
      success = false;
      error = err.message;
    });

    child.stderr.on('data', (data) => {
      commandSuccess = false;
      error = data.toString().trim();
    });

    child.on('exit', (code) => {
      const duration = new Date() - new Date(start);

      const statistics = {
        start,
        duration,
        success,
        ...(success ? {} : { commandSuccess }),
        ...(error ? { error } : {}),
      };

      fs.writeFile(filename, JSON.stringify(statistics, null, 2), (err) => {
        if (err) {
          reject(`Error writing statistics to file: ${err}`);
        } else {
          resolve(`Statistics saved!`);
        }
      });
    });
  });
}

getStatistics('dir', ['/W'], 5000);
