import sqlite3 from 'sqlite3';
import { body, validationResult } from 'express-validator';

const db = new sqlite3.Database('./db/gusto.db');

const routes = (app) => {
	app.get('/', (req, res) => {
		res.send('Hello, World!');
	});

	function getMenuQuery(businessId, orderBy) {
		let menuQuery = `SELECT menu.id, menu.name, menu.description, menu.price, menu.is_pizza, categories.category_name, GROUP_CONCAT(tags.tag_name) as tags
        FROM menu
        JOIN categories ON menu.category_id = categories.id
        LEFT JOIN menu_tags ON menu.id = menu_tags.menu_id
        LEFT JOIN tags ON menu_tags.tag_id = tags.id
        JOIN business_menu ON menu.id = business_menu.menu_id
        WHERE business_menu.business_id = ${businessId}
        GROUP BY menu.id, menu.name, menu.description, menu.price, menu.is_pizza, categories.category_name
        ${orderBy}`;

		return menuQuery;
	}

	app.get('/data/admin/menu', (req, res) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY categories.id');
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/name-asc-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.name ASC');
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/name-desc-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.name DESC');
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/highest-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.price DESC');
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/lowest-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.price ASC');
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/new-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let orderBynew = `ORDER BY CASE WHEN tags LIKE '%NEW%' THEN 0 ELSE 1 END, tags`;
		let menuQuery = getMenuQuery(businessId, orderBynew);
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/cer-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let orderBycer = `ORDER BY CASE WHEN tags LIKE '%CER%' THEN 0 ELSE 1 END, tags`;
		let menuQuery = getMenuQuery(businessId, orderBycer);
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/sur-sort', (req, res) => {
		let businessId = req.query.business || 1;
		let orderBysur = `ORDER BY CASE WHEN tags LIKE '%SUR%' THEN 0 ELSE 1 END, tags`;
		let menuQuery = getMenuQuery(businessId, orderBysur);
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/is-pizza', (req, res) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.is_pizza DESC');
		db.all(menuQuery, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/business', (req, res) => {
		db.all('SELECT * FROM business', (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/categories', (req, res) => {
		db.all('SELECT * FROM categories', (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/tags', (req, res) => {
		db.all('SELECT * FROM tags', (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.patch(
		'/data/admin/menu/:id',
		[
			body('name')
				.notEmpty()
				.isLength({ max: 100 })
				.withMessage('Name is required, and must be less than 100 characters'),
			body('description')
				.notEmpty()
				.isLength({ max: 500 })
				.withMessage('Description is required, and must be less than 500 characters'),
			body('price')
				.isNumeric()
				.isLength({ min: 1, max: 2 })
				.withMessage('Price must be a number, and between 1 and 2 digits'),
			body('is_pizza')
				.isNumeric()
				.custom((value) => value === 0 || value === 1)
				.withMessage('is_pizza must be a number with a value of either 0 or 1')
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { name, description, price, is_pizza } = req.body;

			try {
				// Update the menu table
				await db.run(
					`
            UPDATE menu
            SET name = ?, description = ?, price = ?, is_pizza = ?
            WHERE id = ?
        `,
					name,
					description,
					price,
					is_pizza,
					req.params.id
				);

				// Fetch the updated data
				const updatedData = await db.get(
					`
            SELECT menu.id, menu.name, menu.description, menu.price, menu.is_pizza, categories.category_name, GROUP_CONCAT(tags.tag_name) as tags
            FROM menu
            JOIN categories ON menu.category_id = categories.id
            LEFT JOIN menu_tags ON menu.id = menu_tags.menu_id
            LEFT JOIN tags ON menu_tags.tag_id = tags.id
            JOIN business_menu ON menu.id = business_menu.menu_id
            WHERE menu.id = ?
            GROUP BY menu.id, menu.name, menu.description, menu.price, menu.is_pizza, categories.category_name
            `,
					req.params.id
				);

				res.status(200).send({
					message: 'Data updated successfully',
					...updatedData
				});
			} catch (error) {
				res.status(500).send({
					error: 'An error occurred while updating the menu data',
					message: error.message
				});
			}
		}
	);

	app.post('/data/admin/menu', async (req, res) => {
		const { name, description, price, isPizza, categoryId, businessId } = req.body;

		try {
			await db.run(
				'INSERT INTO menu(name, description, price, is_pizza, category_id, business_id) VALUES(?, ?, ?, ?, ?, ?)',
				[name, description, price, isPizza, categoryId, businessId]
			);
			res.json({ message: 'Dish inserted successfully' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Error inserting dish' });
		}
	});

	app.delete('/data/admin/menu/:id', async (req, res) => {
		try {
			await db.run('DELETE FROM menu WHERE id = ?', req.params.id);
			res.json({ message: 'Dish deleted successfully' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Error deleting dish' });
		}
	});
};

export default routes;
