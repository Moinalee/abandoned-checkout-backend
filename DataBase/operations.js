const { connectMongoDbClient } = require('./connection');

const TAG = 'MONGO_OPERATIONS';

// Common function to insert data into a collection
const insertOne = async (collectionName, data) => {
	try {
		const db = await connectMongoDbClient();
		const collection = db.collection(collectionName);
		const result = await collection.insertOne(data);
		console.log(`${TAG} Inserted document into the ${collectionName} collection.`);
		return result.insertedId;
	} catch (err) {
		console.log(`${TAG} Error in inserting document into the ${collectionName} collection: ${err}`);
		throw err;
	}
};

// Common function to update data in a collection
const updateOne = async (collectionName, filter, update) => {
	try {
		const db = await connectMongoDbClient();
		const collection = db.collection(collectionName);
		const result = await collection.updateOne(filter, update);
		console.log(`${TAG} Updated document in the ${collectionName} collection.`);
		return result.modifiedCount;
	} catch (err) {
		console.log(`${TAG} Error in updating document in the ${collectionName} collection: ${err}`);
		throw err;
	}
};

// Common function to update data in a collection
const findAndUpdate = async (collectionName, filter, update) => {
	try {
		const db = await connectMongoDbClient();
		const collection = db.collection(collectionName);
		const result = await collection.findOneAndUpdate(filter, update, { returnOriginal: false });
		console.log(`${TAG} Updated document in the ${collectionName} collection.`);
		return result.value;
	} catch (err) {
		console.log(`${TAG} Error in updating document in the ${collectionName} collection: ${err}`);
		throw err;
	}
};

// Common function to get data from a collection
const find = async (collectionName, filter) => {
	try {
		const db = await connectMongoDbClient();
		const collection = db.collection(collectionName);
		let result = await collection.findOne(filter);
		console.log(`${TAG} Fetched document from the ${collectionName} collection.`);
		return result;
	} catch (err) {
		console.log(`${TAG} Error in fetching document from the ${collectionName} collection: ${err}`);
		throw err;
	}
};

// Common function to get and sort data from a collection.
const findAndDocumentsSorted = async (collectionName, filter, sort) => {
	try {
		const db = await connectMongoDbClient();
		const collection = db.collection(collectionName);
		const result = await collection.find(filter).sort(sort).toArray();
		console.log(
			`${TAG} Fetched ${result.length} documents from the ${collectionName} collection and sorted them by scheduledOn in ascending order.`
		);
		return result;
	} catch (err) {
		console.log(`${TAG} Error in fetching documents from the ${collectionName} collection: ${err}`);
		throw err;
	}
};

module.exports = {
	insertOne,
	updateOne,
	find,
	findAndUpdate,
	findAndDocumentsSorted,
};
