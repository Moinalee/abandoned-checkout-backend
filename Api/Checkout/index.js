// Import the necessary modules
const express = require('express');
const router = express.Router();
const { manageAbandonedCheckouts, manageSuccessCheckouts } = require('./manageCheckout');

// Define a constant for logging purposes
const TAG = 'CHECKOUT';

// This endpoint will be shared with ecommerce site to create webhook for abandoned checkouts.
router.post('/abandoned', async (req, res) => {
	manageAbandonedCheckouts(req);
	res.sendStatus(200);
});

// This endpoint will be shared with ecommerce site to create webhook for success orders.
router.post('/success', async (req, res) => {
	manageSuccessCheckouts(req);
	res.sendStatus(200);
});

module.exports = router;
