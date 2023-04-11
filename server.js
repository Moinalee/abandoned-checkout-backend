// Import required modules
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

// Import API endpoints and scheduled message job manager
const Checkout = require('./Api/Checkout');
const Messages = require('./Api/Messages');
const ScheduleMessageJobManager = require('./ScheduleMessageJobManager');
const { scheduleMessageJob } = require('./ScheduleMessageJobManager/manageMessageJobs');

// Load environment variables from .env file
require('dotenv').config();

// Initialize the Express app
const app = express();

// Initialize the JSON parser middleware
const jsonParser = bodyParser.json({ limit: 1024 * 1024 * 2 });

// Use the JSON parser middleware for all routes
app.use(jsonParser);

// Initialize the URL encoded parser middleware
app.use(bodyParser.urlencoded({
    extended: true
}));

// Configure CORS middleware options
const corsOptions = {
    credentials: true,
    origin: true,
};

// Enable CORS middleware for all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Add IP and API Rate limiter middlewares and auth middlewares

// Mount the /checkout endpoint
app.use('/checkout', Checkout);

// Mount the /message endpoint
app.use('/message', Messages);

/**
 * This scheduled job will run every X hrs.
 * This scheduled job is used to get messages that need to be sent every X hrs and send them.
 * The job is scheduled using the ScheduleMessageJobManager.scheduleRecursiveJob method,
 * which takes an object with the following properties:
 * - name: the name of the job
 * - minute: the minute of the hour to run the job on (specified in the .env file)
 * - callback: the function to call when the job runs (in this case, the scheduleMessageJob function)
 */
ScheduleMessageJobManager.scheduleRecursiveJob({
  name: 'MESSAGE_JOB',
  minute: `${process.env.MESSAGE_JOB_TIME_MIN}`,
  callback: () => scheduleMessageJob()
});

// Start the server listening on the specified port (or 3001 if not specified)
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server started listening on port - ${PORT}`);
});
