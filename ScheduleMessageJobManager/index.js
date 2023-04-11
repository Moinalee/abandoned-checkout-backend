const schedule = require('node-schedule');

const { isEmpty } = require('../utils');
const { find, updateOne } = require('../DataBase/operations');
const collectionNames = require('../DataBase/collections');

const TAG = 'SCHEDULE_MESSAGE_JOB_MANAGER';

class ScheduleMessageJobManager {
	static scheduledMessageJobs = [];

	// Returns all scheduled jobs stored in the static scheduledMessageJobs property.
	getAllScheduledMessageJobs() {
		return ScheduleMessageJobManager.scheduledMessageJobs;
	}

	// Adds a new job object with name and date properties to the scheduledMessageJobs array.
	addNewMessageScheduleJob({ name, date }) {
		ScheduleMessageJobManager.scheduledMessageJobs.push({ name, date });
	}

	/**
	 * schedules the next message job in the scheduledMessageJobs array by creating a new node-schedule job object with the specified name and date,
	 * and executing a callback function to send the message, update its status, and call scheduleMessageJob() recursively. */
	scheduleMessageJob() {
		try {
			if (!isEmpty(ScheduleMessageJobManager.scheduledMessageJobs)) {
				const nextScheduledRecentJob = ScheduleMessageJobManager.scheduledMessageJobs.shift();
				const { name, date } = nextScheduledRecentJob;
				const messageId = name;
				const callback = async () => {
					try {
						console.log(`${TAG}: Here to send message for ${messageId}`);

						const filter = { _id: messageId };
						const messageDetails = await find(collectionNames.messageCollection, filter);
						const { messageSources, messageTemplate, emailId, contactNo } = messageDetails;
						// Send message throgh all the availed sources like email, sms, whatsapp, ecommerce app notification.
						console.log(`${TAG}: ${messageTemplate} this message is sent to emailId- ${emailId}, contact no -${contactNo}.`);
						const result = await updateOne(
							collectionNames.messageCollection,
							{ _id: messageId },
							{
								$set: {
									messageStatus: 'SUCCESS',
								},
							}
						);
						console.log(`${TAG}: Updated document for sent message ${result} in MessageDetails collection.`);
						this.scheduleMessageJob();
					} catch (err) {
						console.log(`${TAG}: Error occured while sending message. Error - ${err}`);
					}
				};

				const newJob = schedule.scheduleJob(name, date, callback);
				if (!isEmpty(newJob)) console.log(`${TAG} New job is scheduled name: ${name} at date: ${date}`);
				else console.error(`Error: ${TAG} New job can not be scheduled name: ${name} at date: ${date}`);
			} else {
				console.log(`${TAG}: No job scheduled for sending message.`);
			}
		} catch (err) {
			console.log(`${TAG}: Error occured while scheduling new message job. Error - ${err}`);
		}
	}

	/**
	 * schedules a new job to be executed recursively every minute minutes by creating a new node-schedule job object with the specified name and rule and executes the provided callback function.
	 */
	scheduleRecursiveJob({ name, minute, callback }) {
		try {
			const rule = `*/${minute} * * * *`;
			const newJob = schedule.scheduleJob({ name, rule }, callback);
			if (!isEmpty(newJob)) console.log(`${TAG} New recursive job is scheduled name: ${name} for every ${minute} minute.`);
			else console.error(`Error: ${TAG} New recursive job can not be scheduled name: ${name}  minute: ${minute}`);
		} catch (err) {
			console.log(`${TAG}: Error occured while scheduling recursive joib. Error - ${err}`);
		}
	}

	// cancels the scheduled job with the specified name by removing it from the scheduledMessageJobs array.
	cancelScheduledJob(name) {
		for (let index = 0; index < ScheduleMessageJobManager.scheduledMessageJobs.length; index++) {
			if (ScheduleMessageJobManager.scheduledMessageJobs[index].name === name) {
				ScheduleMessageJobManager.scheduledMessageJobs.splice(index, 1);
				console.log(`${TAG} Canceled the scheduled message job: ${name}`);
				return;
			}
		}
	}
}

module.exports = new ScheduleMessageJobManager();
