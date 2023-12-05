import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import db from './db/db-connect.js';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
routes(app);

// Error handler - send errors to the database and return a 500 status code
app.use(async (err, req, res, next) => {
	const db1 = await db.dbconn();
	console.log('err:', err); // Log the err object

	const errorMessage = JSON.stringify(err);
	console.log('errorMessage:', errorMessage); // Log the errorMessage string

	const endpoint = req.originalUrl;

	console.error(`Error message: ${errorMessage}`);

	db1.run(
		`INSERT INTO error_logs (error_message, endpoint) VALUES (?, ?)`,
		[errorMessage, endpoint],
		function (err) {
			if (err) {
				console.error('Database error:', err.message); // Log any database errors
				return;
			}
			console.log(`An error has been logged with rowid ${this.lastID}`);
		}
	);

	res.status(500).json({ message: 'An error occurred' });
});

const server = app.listen(port, (err) => {
	if (err) {
		console.error('Error starting the server:', err);
	} else {
		console.log(`Server is running on port ${port}`);
	}
});

process.on('SIGINT', () => {
	server.close(() => {
		console.log('Server has been gracefully terminated');
		process.exit(0);
	});
});
