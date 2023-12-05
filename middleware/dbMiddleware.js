import dbConnect from '../db/db-connect.js';

export const dbMiddleware = async (req, res, next) => {
	try {
		req.db = await dbConnect();
		next();
	} catch (err) {
		next(err);
	}
};
