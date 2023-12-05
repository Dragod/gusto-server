import sqlite3 from 'sqlite3';

let db;

const dbConnect = async () => {
	if (!db) {
		try {
			db = new sqlite3.Database('./db/gusto.db');
			console.log('Connected to the Gusto database.');
		} catch (err) {
			console.error(err.message);
			throw err;
		}
	}
	return db;
};

export default dbConnect;
