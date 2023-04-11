const { isEmpty } = require('../../utils');
const { insertOne, updateOne, findAndUpdate } = require('../../DataBase/operations');
const { MESSAGE_TIMINGS, MILLISECONDS_IN_ONE_HOUR, MESSAGE_SOURCES, MESSAGE_TEMPLATE } = require('../../Constants');
const collectionNames = require('../../DataBase/collections');
const ScheduleMessageJobManager = require('../../ScheduleMessageJobManager');

const TAG = 'MANAGE_CHECKOUTS';

// Convert hour to string to show it in the message.
const hoursToString = (hours) => {
	if (hours < 1) {
		const minutes = Math.round(hours * 60);
		return `${minutes} mins`;
	} else if (hours >= 24) {
		const days = Math.floor(hours / 24);
		const remainingHours = hours % 24;
		if (remainingHours === 0) {
			return `${days} day${days > 1 ? 's' : ''}`;
		} else {
			return `${days} day${days > 1 ? 's' : ''} ${remainingHours}hr${remainingHours > 1 ? 's' : ''}`;
		}
	} else {
		return `${hours}hrs`;
	}
};

// Creating message that need to be sent to the user.
const createMessageTemplate = (customer, timing, totalPrice) => {
	const messageTemplate = MESSAGE_TEMPLATE.replace('{name}', customer.first_name)
		.replace('{timing}', hoursToString(timing))
		.replace('{amount}', totalPrice)
		.replace('{offer}', '10% off, if you pay right now.');

	return messageTemplate;
};

// Create the messages that need to be sent for the abandoned checkouts.
const createAndGetMessageList = async (createdOn, checkoutId, phone, customer, totalPrice) => {
	const messageList = [];
	for (const timing of MESSAGE_TIMINGS) {
		const scheduledOn = createdOn + MILLISECONDS_IN_ONE_HOUR * timing;
		const messageId = `${checkoutId}_${scheduledOn}`;
		messageList.push({
			scheduledOn,
			messageId,
		});

		const messageTemplate = createMessageTemplate(customer, timing, totalPrice);
		const payload = {
			_id: messageId,
			checkoutId,
			scheduledOn,
			contactNo: !isEmpty(phone.phone) ? phone.phone : '',
			emailId: customer.email,
			messageSources: MESSAGE_SOURCES,
			convertedToPayment: false,
			createdOn,
			messageTemplate,
			messageStatus: 'CREATED',
		};

		const insertedId = await insertOne(collectionNames.messageCollection, payload);
		console.log(`${TAG} Created new message for message - ${messageId} with id ${insertedId}`);
	}

	return messageList;
};

// Get payload from e-commerce webhook for abandoned checkots and parse the required data and schedule messages accordingly.
module.exports.manageAbandonedCheckouts = async (req) => {
	try {
		const abandonedCheckoutPayload = req.body;
		console.log(`${TAG}: Request to manage a abandoned payload. Payload - ${JSON.stringify(abandonedCheckoutPayload, null, 2)}`);
		if (!isEmpty(abandonedCheckoutPayload)) {
			const { id, customer, phone, total_price } = abandonedCheckoutPayload;
			const createdOn = Date.now();
			const messageList = await createAndGetMessageList(createdOn, id, phone, customer, total_price);
			const payload = {
				_id: id,
				emailId: customer.email,
				contactNo: !isEmpty(phone) && !isEmpty(phone.phone) ? phone.phone : '',
				createdOn,
				checkoutStatus: 'INITIATED',
				messageList,
				checkoutDetail: abandonedCheckoutPayload,
			};

			const insertedId = await insertOne(collectionNames.checkoutCollection, payload);
			console.log(`${TAG} Created new checkout ${id} with id ${insertedId}`);
		} else {
			console.log(`${TAG}: Abandoned checkout details are missing.`);
		}
	} catch (err) {
		console.error(`${TAG}: Error occured while managing abandoned checkouts. Error - ${err}`);
	}
};

// Get payload from e-commerce webhook for success orders parse the required data, update status and cancel the scheduled messages which are sent yet.
module.exports.manageSuccessCheckouts = async (req) => {
	try {
		const successCheckoutPayload = req.body;
		console.log(`${TAG}: Request to manage a success payload. Payload - ${JSON.stringify(successCheckoutPayload, null, 2)}`);
		if (!isEmpty(successCheckoutPayload) && !isEmpty(successCheckoutPayload.order)) {
			const { order } = successCheckoutPayload;
			const checkoutId = order.id;
			const checkoutDetail = await findAndUpdate(
				collectionNames.checkoutCollection,
				{ _id: checkoutId },
				{
					$set: {
						checkoutStatus: 'SUCCESS',
						order: order,
					},
				}
			);
			console.log(`${TAG}: Updated document in CheckoutDetails collection.`);

			if (!isEmpty(checkoutDetail) && !isEmpty(checkoutDetail.messageList)) {
				const presentTime = Date.now();
				let lastSentMessage = '';
				for (const message of checkoutDetail.messageList) {
					const { scheduledOn, messageId } = message;
					if (!isEmpty(scheduledOn) && !isEmpty(messageId)) {
						if (scheduledOn <= presentTime) {
							lastSentMessage = messageId;
						} else {
							const result = await updateOne(
								collectionNames.messageCollection,
								{ _id: messageId },
								{
									$set: {
										messageStatus: 'CANCELED',
									},
								}
							);
							console.log(`${TAG}: Updated document for canceled message ${result} in MessageDetails collection.`);
							ScheduleMessageJobManager.cancelScheduledJob(messageId);
						}
					}
				}

				if (!isEmpty(lastSentMessage)) {
					const result = await updateOne(
						collectionNames.messageCollection,
						{ _id: lastSentMessage },
						{
							$set: {
								convertedToPayment: true,
							},
						}
					);
					console.log(`${TAG}: Updated document for payment converted message ${result} in MessageDetails collection.`);
				}
			}
		} else {
			console.log(`${TAG}: Success checkout details are missing.`);
		}
	} catch (err) {
		console.error(`${TAG}: Error occured while managing success checkouts. Error - ${err}`);
	}
};
