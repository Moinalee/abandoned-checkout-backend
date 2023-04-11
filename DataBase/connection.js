const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');

const { isEmpty } = require('../utils');

const TAG = 'MONGO_CLIENT';

let mongodbClient = null;

// Will check if we already have active Mongodb client connection, if not it will create a connection.
const connectMongoDbClient = async () => {
	if (!isEmpty(mongodbClient)) return mongodbClient;
	console.log(`${TAG} Here to connect Mongodb client.`);
	try {
		const uri = process.env.MONGODB_CLUSTER_CONNECTION_STRING;
		const client = new MongoClient(uri);
		await client.connect();
		mongodbClient = client.db(process.env.MONGODB_DATABASE);
	} catch (err) {
		console.log(`${TAG} Mongodb Client Connection error: ${err}`);
		// Can add event emitter to notify admin, we are having error in connecting mongodb client.
	}
	return mongodbClient;
};

module.exports.connectMongoDbClient = connectMongoDbClient;
