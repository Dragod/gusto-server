import { body, validationResult } from 'express-validator';

const postRoutes = (app) => {
	async function insertDish(db, dish, categoryId, tags, businessId) {
		console.log('Dish:', dish);
		try {
			if (dish.is_pizza === null || dish.is_pizza === undefined) {
				next(new Error('isPizza value is null or undefined'));
				return;
			}

			const isPizza = Number(dish.is_pizza);

			let dishResult = await new Promise((resolve, reject) => {
				db.run(
					'INSERT INTO menu (name, description, is_pizza, category_id) VALUES (?, ?, ?, ?)',
					[dish.name, dish.description, isPizza, categoryId],
					function (err) {
						if (err) {
							return reject(err);
						}
						resolve(this);
					}
				);
			});

			for (const tagId of tags) {
				const tagResult = await new Promise((resolve, reject) => {
					db.get('SELECT id FROM tags WHERE id = ?', [tagId], (err, row) => {
						if (err) {
							next(err);
							return reject(err);
						} else {
							resolve(row);
						}
					});
				});

				if (!tagResult) {
					next(new Error(`Tag with ID ${tagId} does not exist`));
					return;
				}

				try {
					await db.run(
						'INSERT INTO menu_tags (menu_id, tag_id) VALUES (?, ?)',
						[dishResult.lastID, tagResult.id],
						function (err) {
							if (err) {
								next(err);
								return;
							} else {
								console.log(`Tag with ID ${tagId} inserted successfully`);
							}
						}
					);
				} catch (error) {
					next(error);
					return;
				}
			}

			try {
				await new Promise((resolve, reject) => {
					if (dish.price === null || dish.price === undefined) {
						console.log('Error: dish.price is null or undefined');
						return reject(new Error('dish.price is null or undefined'));
					}
					db.serialize(() => {
						db.run('BEGIN TRANSACTION');
						db.run(
							'INSERT INTO business_menu (business_id, menu_id, price) VALUES (?, ?, ?)',
							[businessId, dishResult.lastID, dish.price],
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
				db.run('ROLLBACK');
				return console.log('error:', error);
			}

			await db.run(
				'INSERT OR IGNORE INTO business_categories (business_id, category_id) VALUES (?, ?)',
				[businessId, categoryId]
			);
		} catch (error) {
			return console.log(error);
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
				.optional()
				.isLength({ max: 200 })
				.withMessage('Description is required, and must be less than 500 characters'),
			body('is_pizza')
				.isNumeric()
				.custom((value) => value === 0 || value === 1)
				.withMessage('is_pizza must be a number with a value of either 0 or 1'),
			body('price') // Add price validation
				.isNumeric()
				.withMessage('Price must be a number')
		],
		async (req, res, next) => {
			if (!req.body || typeof req.body !== 'object') {
				next(new Error('Invalid request body'));
				return;
			}

			const { name, description, is_pizza, categoryId, tags, businessId, price } = req.body;

			if (
				!name ||
				!description ||
				!is_pizza ||
				!categoryId ||
				!businessId ||
				price === undefined
			) {
				// Check if price is undefined
				next(new Error('Missing required fields'));
				return;
			}

			const dish = { name, description, is_pizza, price }; // Add price here

			try {
				await insertDish(req.db, dish, categoryId, tags, businessId);
				res.status(200).send({ message: 'Dish inserted successfully' });
			} catch (error) {
				next(error);
				return;
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
		async (req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				console.log('errors:', errors);
				next(errors.array());
				return;
			}
			const { categoryName, businessIds } = req.body;

			console.log('req.body:', req.body);

			try {
				let categoryId = await new Promise((resolve, reject) => {
					req.db.run(
						'INSERT INTO categories (category_name) VALUES (?)',
						categoryName,
						function (err) {
							if (err) {
								next(err);
								return reject(err);
							}
							resolve(this.lastID);
						}
					);
				});

				// Associate the category with each business
				for (let businessId of businessIds) {
					await req.db.run(
						'INSERT INTO business_categories (business_id, category_id) VALUES (?, ?)',
						[businessId, categoryId]
					);
				}

				res.status(201).send({
					message: 'Category created successfully',
					categoryId: categoryId
				});
			} catch (error) {
				next(error);
				return;
			}
		}
	);
};

export default postRoutes;
