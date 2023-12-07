const getRoutes = (app) => {
	function getMenuQuery(businessId, orderBy, isPizza = false) {
		let pizzaCondition = isPizza ? 'AND menu.is_pizza = 1' : '';
		let menuQuery = `SELECT
    menu.id,
    menu.name,
    menu.description,
	menu.category_id,
    business_menu.price,
    menu.is_pizza,
    categories.category_name,
    GROUP_CONCAT(tags.tag_name) as tags
FROM
    menu
JOIN
    categories ON menu.category_id = categories.id
LEFT JOIN
    menu_tags ON menu.id = menu_tags.menu_id
LEFT JOIN
    tags ON menu_tags.tag_id = tags.id
JOIN
    business_menu ON menu.id = business_menu.menu_id
WHERE
    business_menu.business_id = ${businessId} ${pizzaCondition}
GROUP BY
    menu.id,
    menu.name,
    menu.description,
    business_menu.price,
    menu.is_pizza,
    categories.category_name
        ${orderBy}`;

		return menuQuery;
	}

	app.get('/data/admin/menu', (req, res, next) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY categories.id');
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/name-asc-sort', (req, res, next) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.name ASC');
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/name-desc-sort', (req, res, next) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.name DESC');
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/new-sort', (req, res, next) => {
		let businessId = req.query.business || 1;
		let orderBynew = `ORDER BY CASE WHEN tags LIKE '%NEW%' THEN 0 ELSE 1 END, tags`;
		let menuQuery = getMenuQuery(businessId, orderBynew);
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/cer-sort', (req, res, next) => {
		let businessId = req.query.business || 1;
		let orderBycer = `ORDER BY CASE WHEN tags LIKE '%CER%' THEN 0 ELSE 1 END, tags`;
		let menuQuery = getMenuQuery(businessId, orderBycer);
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/sur-sort', (req, res, next) => {
		let businessId = req.query.business || 1;
		let orderBysur = `ORDER BY CASE WHEN tags LIKE '%SUR%' THEN 0 ELSE 1 END, tags`;
		let menuQuery = getMenuQuery(businessId, orderBysur);
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/menu/pizza-sort', (req, res, next) => {
		let businessId = req.query.business || 1;
		let menuQuery = getMenuQuery(businessId, 'ORDER BY menu.is_pizza DESC', true);
		req.db.all(menuQuery, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/business', (req, res, next) => {
		req.db.all('SELECT * FROM business', (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/categories', (req, res, next) => {
		req.db.all('SELECT * FROM categories', (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/tags', (req, res, next) => {
		req.db.all('SELECT * FROM tags', (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
			}
		});
	});

	app.get('/data/admin/categories/:id', (req, res, next) => {
		console.log('req.params:', req.params);
		const { id } = req.params;

		req.db.get(`SELECT * FROM categories WHERE id = ?`, id, (err, row) => {
			if (err) {
				next(err);
				return;
			}
			if (!row) {
				next(new Error(`No category found with id: ${id}`));
				return;
			}
			return res.json(row);
		});
	});

	app.get('/data/admin/business_categories', (req, res, next) => {
		let businessId = req.query.business || 1;
		req.db.all(
			`SELECT categories.category_name
				FROM business_categories
				JOIN categories ON business_categories.category_id = categories.id
				WHERE business_categories.business_id = ${businessId};`,
			(err, result) => {
				if (err) {
					next(err);
					return;
				} else {
					const jsonResult = JSON.stringify(result);
					res.status(200).send(jsonResult);
					console.log(jsonResult);
				}
			}
		);
	});

	app.get('/data/admin/tags', (req, res, next) => {
		req.db.all(`SELECT * FROM tags`, (err, result) => {
			if (err) {
				next(err);
				return;
			} else {
				const jsonResult = JSON.stringify(result);
				res.status(200).send(jsonResult);
				console.log(jsonResult);
			}
		});
	});

	app.get('/data/admin/catIdFromCatName', (req, res, next) => {
		let catName = decodeURIComponent(req.query.category_name);
		req.db.all(
			`SELECT id FROM categories WHERE category_name = ?;`,
			[catName],
			(err, result) => {
				if (err) {
					next(err);
					return;
				} else {
					res.status(200).json(result);
					console.log(result);
				}
			}
		);
	});

	app.get('/data/admin/business_categories/:businessId', async (req, res, next) => {
		const businessId = parseInt(req.params.businessId);

		console.log('req.params:', businessId);

		try {
			// Fetch the categories for the business from your database
			const categories = await req.db.all(
				'SELECT * FROM business_categories WHERE business_id = ?',
				[businessId]
			);

			console.log('categories:', categories);

			res.json(categories);
		} catch (error) {
			console.error('Database query error:', error);
			next(error);
		}
	});

	app.get('/data/admin/business_menu/:businessId', (req, res, next) => {
		const businessId = parseInt(req.params.businessId);

		console.log('req.params:', businessId);

		new Promise((resolve, reject) => {
			req.db.all(
				'SELECT * FROM business_categories WHERE business_id = ?',
				[businessId],
				(error, categories) => {
					if (error) {
						reject(error);
					} else {
						resolve(categories);
					}
				}
			);
		})
			.then((categories) => {
				console.log('categories:', categories);
				res.json(categories);
			})
			.catch((error) => {
				console.error('Database query error:', error);
				next(error);
			});
	});

	// Select all categories of a specific business by business_id
	app.get('/data/admin/category-by-business/:businessId', (req, res, next) => {
		const businessId = req.params.businessId;
		console.log('businessId:', businessId);
		console.log('req.params:', req.params);

		new Promise((resolve, reject) => {
			req.db.all(
				`SELECT categories.id as category_id, categories.category_name
FROM business_categories
JOIN categories ON business_categories.category_id = categories.id
WHERE business_categories.business_id = ?`,
				[businessId],
				(err, result) => {
					if (err) {
						console.error('Database query error:', err);
						reject(err);
					} else {
						console.log('Database query result:', result);
						resolve(result);
					}
				}
			);
		})
			.then((result) => {
				if (result.length > 0) {
					res.status(200).json(result);
				} else {
					res.status(404).json({ message: 'No categories found for this business ID' });
				}
			})
			.catch((err) => {
				console.error('Promise error:', err);
				next(err);
			});
	});
};

export default getRoutes;
