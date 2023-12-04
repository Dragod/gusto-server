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

	app.get('/data/admin/menu/highest-price-sort', (req, res) => {
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

	app.get('/data/admin/menu/lowest-price-sort', (req, res) => {
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

	app.get('/data/admin/menu/pizza-sort', (req, res) => {
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

	app.get('/data/admin/business', (req, res) => {
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

	app.get('/data/admin/categories/:id', (req, res) => {
		console.log('req.params:', req.params);
		const { id } = req.params;

		db.get(`SELECT * FROM categories WHERE id = ?`, id, (err, row) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			if (!row) {
				return res.status(404).json({ error: 'No category found with id: ' + id });
			}
			return res.json(row);
		});
	});

	app.patch(
		'/data/admin/categories/:id',
		[
			body('category_name')
				.notEmpty()
				.isLength({ min: 4, max: 100 })
				.withMessage('Category name is required, and must be less than 100 characters')
		],
		(req, res) => {
			const { id } = req.params;
			const { category_name } = req.body;
			console.log('req.params:', req.params);
			console.log('req.body:', req.body);

			db.run(
				`UPDATE categories SET category_name = ? WHERE id = ?`,
				[category_name, id],
				function (err) {
					if (err) {
						return res.status(500).json({ error: err.message });
					}
					return res.json({
						message: 'Category updated successfully',
						changes: this.changes
					});
				}
			);
		}
	);

	async function insertDish(dish, categoryId, tags, businessId) {
		console.log('Dish:', dish);
		try {
			// Ensure dish.is_pizza is not null or undefined
			if (dish.is_pizza === null || dish.is_pizza === undefined) {
				throw new Error('isPizza value is null or undefined');
			}

			// Convert dish.is_pizza to a number
			const isPizza = Number(dish.is_pizza);
			console.log('isPizza:', isPizza);

			let dishResult = await new Promise((resolve, reject) => {
				db.run(
					'INSERT INTO menu (name, description, price, is_pizza, category_id) VALUES (?, ?, ?, ?, ?)',
					[dish.name, dish.description, dish.price, isPizza, categoryId],
					function (err) {
						if (err) {
							return reject(err);
						}
						resolve(this);
					}
				);
			});

			console.log('Tags:', tags);

			// Tried to use `db.get` to fetch the id of each tag from the tags table and insert into the menu_tags table but it didn't work with `await` keyword
			// It was returning the `Database` object instead of the expected row data
			//The `Database {}` output indicates that the `db.get` method is not returning the expected row data. Instead, it's returning the `Database` object. This is //likely because the `await` keyword is not being used correctly with `db.get`.

			//The `db.get` method does not return a Promise, so it cannot be used with `await` directly. Instead, it uses a callback function to provide the result.

			for (const tagId of tags) {
				const tagResult = await new Promise((resolve, reject) => {
					db.get('SELECT id FROM tags WHERE id = ?', [tagId], (err, row) => {
						if (err) {
							reject(err);
						} else {
							resolve(row);
						}
					});
				});

				if (!tagResult) {
					throw new Error(`Tag with ID ${tagId} does not exist`);
				}

				console.log('Tag Result:', tagResult);

				try {
					await db.run(
						'INSERT INTO menu_tags (menu_id, tag_id) VALUES (?, ?)',
						[dishResult.lastID, tagResult.id],
						function (err) {
							if (err) {
								console.error(
									`Error running INSERT INTO menu_tags query for tag with ID ${tagId}:`,
									err
								);
							} else {
								console.log(`Tag with ID ${tagId} inserted successfully`);
							}
						}
					);
				} catch (error) {
					console.error(
						`Error running INSERT INTO menu_tags query for tag with ID ${tagId}:`,
						error
					);
				}
			}

			console.log(`businessId: ${businessId}, dishResult.lastID: ${dishResult.lastID}`);

			//To ensure that the changes are committed to the database, using the `db.serialize` method to run your queries in a serialized manner.

			try {
				await new Promise((resolve, reject) => {
					db.serialize(() => {
						db.run('BEGIN TRANSACTION');
						db.run(
							'INSERT INTO business_menu (business_id, menu_id) VALUES (?, ?)',
							[businessId, dishResult.lastID],
							(err) => {
								if (err) {
									return reject(err);
								}
								db.run('COMMIT');
								resolve();
							}
						);
					});
				});
			} catch (error) {
				console.error('Error running INSERT INTO business_menu query:', error);
				db.run('ROLLBACK');
			}

			// Insert the business_id and category_id into the business_categories table
			// Ignore the error if the business is already associated with the category
			await db.run(
				'INSERT OR IGNORE INTO business_categories (business_id, category_id) VALUES (?, ?)',
				[businessId, categoryId]
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	app.post(
		'/data/admin/menu',
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
			if (!req.body || typeof req.body !== 'object') {
				return res.status(400).send({ error: 'Invalid request body' });
			}

			const { name, description, price, is_pizza, categoryId, tags, businessId } = req.body;

			if (!name || !description || !price || !is_pizza || !categoryId || !businessId) {
				return res.status(400).send({ error: 'Missing required fields' });
			}

			const dish = { name, description, price, is_pizza };

			try {
				await insertDish(dish, categoryId, tags, businessId);
				res.status(200).send({ message: 'Dish inserted successfully' });
			} catch (error) {
				console.error(error);
				res.status(500).send({ error: 'An error occurred while inserting the dish' });
			}
		}
	);

	//Having an issue here due to the asynchronous nature of the `db.run` method the category id is not inserted in business_category table. When you're using `await` with `db.run`, it might not wait for the callback function where you're setting `categoryId = this.lastID` to complete before moving on to the next part of the code.
	//To ensure that `categoryId` is set before the code continues, we can wrap the `db.run` method in a new Promise and resolve it inside the callback function

	app.post(
		'/data/admin/categories',
		[
			body('categoryName')
				.notEmpty()
				.isLength({ min: 4, max: 50 })
				.withMessage('Category name is required, and must be between 4 and 50 characters')
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.log('errors:', errors);
				return res.status(400).json({ errors: errors.array() });
			}
			const { categoryName, businessIds } = req.body;

			console.log('req.body:', req.body);

			try {
				let categoryId = await new Promise((resolve, reject) => {
					db.run(
						'INSERT INTO categories (category_name) VALUES (?)',
						categoryName,
						function (err) {
							if (err) {
								return reject(err);
							}
							resolve(this.lastID);
						}
					);
				});

				// Associate the category with each business
				for (let businessId of businessIds) {
					await db.run(
						'INSERT INTO business_categories (business_id, category_id) VALUES (?, ?)',
						[businessId, categoryId]
					);
				}

				res.status(201).send({
					message: 'Category created successfully',
					categoryId: categoryId
				});
			} catch (error) {
				console.error(error);
				res.status(500).send({ error: 'An error occurred while creating the category' });
			}
		}
	);

	app.get('/data/admin/business_categories', (req, res) => {
		let businessId = req.query.business || 1;
		db.all(
			`SELECT categories.category_name
				FROM business_categories
				JOIN categories ON business_categories.category_id = categories.id
				WHERE business_categories.business_id = ${businessId};`,
			(err, result) => {
				if (err) {
					res.status(500).send(err);
				} else {
					const jsonResult = JSON.stringify(result);
					res.status(200).send(jsonResult);
					console.log(jsonResult);
				}
			}
		);
	});

	app.get('/data/admin/tags', (req, res) => {
		db.all(`SELECT * FROM tags`, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
				console.log(jsonResult);
			}
		});
	});

	app.get('/data/admin/catIdFromCatName', (req, res) => {
		let catName = decodeURIComponent(req.query.category_name);
		db.all(`SELECT id FROM categories WHERE category_name = ?;`, [catName], (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				res.status(200).json(result);
				console.log(result);
			}
		});
	});

	app.delete('/data/admin/menu/:id', async (req, res) => {
		try {
			// Delete associated entries from the menu_tags table
			await db.run('DELETE FROM menu_tags WHERE menu_id = ?', req.params.id);

			// Delete associated entries from the business_menu table
			await db.run('DELETE FROM business_menu WHERE menu_id = ?', req.params.id);

			// Delete the menu entry
			await db.run('DELETE FROM menu WHERE id = ?', req.params.id);

			res.json({ message: 'Dish deleted successfully' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Error deleting dish' });
		}
	});

	app.delete('/data/admin/categories/:id', async (req, res) => {
		const categoryId = req.params.id;

		try {
			// Delete the associations from the business_categories table
			await db.run('DELETE FROM business_categories WHERE category_id = ?', [categoryId]);

			// Delete the category
			await db.run('DELETE FROM categories WHERE id = ?', [categoryId]);

			res.status(200).send({ message: 'Category deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).send({ error: 'An error occurred while deleting the category' });
		}
	});
};

export default routes;
