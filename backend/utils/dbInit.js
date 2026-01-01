const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const runCommand = async (command) => {
  try {
    console.log(`Running: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Error running command: ${command}`, error);
    throw error;
  }
};

const initializeDatabase = async () => {
  try {
    console.log('Starting Database Initialization...');

    // 1. Run Migrations
    await runCommand('npx sequelize-cli db:migrate');
    console.log('Migrations completed.');

    // 2. Run Seeds (Only if you want to reset data every time, otherwise handle carefully)
    // For this project/evaluation, we usually want seeds to ensure test data exists.
    try {
        await runCommand('npx sequelize-cli db:seed:all');
        console.log('Seed data loaded.');
    } catch (seedError) {
        console.log('Seeds might already exist or failed (ignoring constraint errors).');
    }

    console.log('Database Initialization Finished.');
  } catch (error) {
    console.error('Database Initialization Failed:', error);
    // We don't exit process here so the server can still try to start, 
    // but in production you might want to exit.
  }
};

module.exports = initializeDatabase;