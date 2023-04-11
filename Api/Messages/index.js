const express = require('express');
const router = express.Router();

const { getAllSentMessages } = require('./manageMessages');

const TAG = 'MESSAGES';

// Get method to get all the messages sent to customers.
router.get('/get-messages', async (req, res) => {
	try {
		const allSentMessages = await getAllSentMessages();
		res.status(200).json(allSentMessages);
	} catch (err) {
		console.log(`${TAG}: Error occured while getting all sent messages. Error - ${err}`);
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
