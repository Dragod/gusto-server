import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
routes(app);

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
