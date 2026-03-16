const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-dev-utils',
  'checkRequiredFiles.js'
);

const run = () => {
  if (!fs.existsSync(targetFile)) {
    console.log('react-dev-utils patch skipped: target file not found.');
    return;
  }

  const source = fs.readFileSync(targetFile, 'utf8');

  if (!source.includes('fs.F_OK')) {
    console.log('react-dev-utils patch not needed: fs.F_OK not present.');
    return;
  }

  const patched = source.replace(/fs\.F_OK/g, 'fs.constants.F_OK');
  fs.writeFileSync(targetFile, patched, 'utf8');

  console.log('Patched react-dev-utils/checkRequiredFiles.js to use fs.constants.F_OK');
};

run();
