import sqlite3 from 'sqlite3';

let db;

const connectToDatabase = async () => {
	try {
		db = new sqlite3.Database('./db/gusto.db');
		console.log('Connected to the Gusto database.');
	} catch (err) {
		console.error(err.message);
		throw err;
	}
};

const getAll = async (query) => {
	try {
		await connectToDatabase();
		db.all(query, (err, rows) => {
			if (err) {
				console.error(err.message);
				return;
			}
			console.log('Rows:', rows);
		});
	} catch (err) {
		console.error('Error connecting to the database:', err.message);
	}
};

export default { connectToDatabase, getAll };
