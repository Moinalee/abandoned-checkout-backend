const { isEmpty } = require('../../utils');
const { findAndDocumentsSorted } = require('../../DataBase/operations');
const collectionNames = require('../../DataBase/collections');

const TAG = 'MANAGE_CHECKOUTS';

module.exports.getAllSentMessages = async () => {
	const filter = { messageStatus: 'SUCCESS' };
	// Sort parameter to sort the result in ascending order based on the scheduledOn field
	const sort = { scheduledOn: 1 };
	const allSentMessages = await findAndDocumentsSorted(collectionNames.messageCollection, filter, sort);
	return allSentMessages;
};
