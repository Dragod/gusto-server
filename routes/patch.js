import { body, validationResult } from 'express-validator';

const patchRoutes = (app) => {
	app.patch(
		'/data/admin/menu/:id',
		[
			body('name')
				.notEmpty()
				.isLength({ max: 100 })
				.withMessage('Name is required, and must be less than 100 characters'),
			body('description')
				.optional()
				.isLength({ max: 200 })
				.withMessage('Description must be less than 200 characters'),
			body('is_pizza')
				.isNumeric()
				.custom((value) => value === 0 || value === 1)
				.withMessage('is_pizza must be a number with a value of either 0 or 1')
		],
		async (req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				next(errors.array());
				return;
			}

			const { name, description, is_pizza } = req.body;

			try {
				// Update the menu table
				await req.db.run(
					`
            UPDATE menu
            SET name = ?, description = ?, is_pizza = ?
            WHERE id = ?
        `,
					name,
					description,
					is_pizza,
					req.params.id
				);

				// Fetch the updated data
				const updatedData = await req.db.get(
					`
            SELECT menu.id, menu.name, menu.description, menu.is_pizza, categories.category_name, GROUP_CONCAT(tags.tag_name) as tags
			FROM menu
			JOIN categories ON menu.category_id = categories.id
			LEFT JOIN menu_tags ON menu.id = menu_tags.menu_id
			LEFT JOIN tags ON menu_tags.tag_id = tags.id
			JOIN business_menu ON menu.id = business_menu.menu_id
			WHERE menu.id = ?
			GROUP BY menu.id, menu.name, menu.description, menu.is_pizza, categories.category_name
            `,
					req.params.id
				);

				res.status(200).send({
					message: 'Data updated successfully',
					...updatedData
				});
			} catch (error) {
				next(error);
				return;
			}
		}
	);

	app.patch(
		'/data/admin/categories/:id',
		[
			body('category_name')
				.notEmpty()
				.isLength({ min: 4, max: 100 })
				.withMessage('Category name is required, and must be less than 100 characters')
		],
		(req, res, next) => {
			const { id } = req.params;
			const { category_name } = req.body;
			console.log('req.params:', req.params);
			console.log('req.body:', req.body);

			req.db.run(
				`UPDATE categories SET category_name = ? WHERE id = ?`,
				[category_name, id],
				function (err) {
					if (err) {
						next(err);
						return;
					}
					return res.json({
						message: 'Category updated successfully',
						changes: this.changes
					});
				}
			);
		}
	);

	app.patch('/data/admin/business_menu/:businessId/:menuId', async (req, res, next) => {
		const { businessId, menuId } = req.params;
		const { price } = req.body;

		console.log('req.params:', req.params);
		console.log('req.body:', req.body);

		let sql = `UPDATE business_menu SET price = ? WHERE business_id = ? AND menu_id = ?`;

		req.db.run(sql, [price, businessId, menuId], function (err) {
			if (err) {
				next(err);
				return;
			}
			console.log(`Row(s) updated: ${this.changes}`);

			res.status(200).send({ message: 'Price updated successfully' });
		});
	});
};

export default patchRoutes;
