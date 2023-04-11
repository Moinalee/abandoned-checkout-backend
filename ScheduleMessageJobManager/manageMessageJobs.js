const ScheduleMessageJobManager = require('./index');
const { findAndDocumentsSorted } = require('../DataBase/operations');
const collectionNames = require('../DataBase/collections');
const { MILLISECONDS_IN_ONE_MINUTE } = require('../Constants');

const TAG = 'MANAGE_MESSAGE_JOBS';

/**
 * Schedules message sending jobs for messages whose scheduledOn time is between the current time and a maximum time limit set in the environment variable.
 * The function retrieves all such messages from the message collection, sorts them based on the scheduledOn field, and adds them to the list of scheduled message jobs using the "addNewMessageScheduleJob" method of the "ScheduleMessageJobManager" class
 *  Finally, it calls the "scheduleMessageJob" method of the same class to schedule the added jobs.
 */
module.exports.scheduleMessageJob = async () => {
	try {
		console.log(`${TAG}: Here to schedule message jobs.`);
		const minTimeStamp = Date.now();
		const maxTimeStamp = minTimeStamp + process.env.MESSAGE_JOB_TIME_MIN * MILLISECONDS_IN_ONE_MINUTE;

		// Filter to find the documents with scheduledOn time between minTimeStamp and maxTimeStamp
		const filter = { scheduledOn: { $gte: minTimeStamp, $lte: maxTimeStamp } };

		// Sort parameter to sort the result in ascending order based on the scheduledOn field
		const sort = { scheduledOn: 1 };

		// Call the find function to get the documents
		const allScheduledMessages = await findAndDocumentsSorted(collectionNames.messageCollection, filter, sort);
		for (const message of allScheduledMessages) {
			console.log(message);
			const { _id, scheduledOn } = message;
			ScheduleMessageJobManager.addNewMessageScheduleJob({ name: _id, date: scheduledOn });
		}

		ScheduleMessageJobManager.scheduleMessageJob();
	} catch (err) {
		console.log(`${TAG}: Error occured while recursively scheduling message jobs. Error - ${err}`);
	}
};
