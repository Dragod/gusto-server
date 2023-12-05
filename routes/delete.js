const deleteRoutes = (app) => {
	app.delete('/data/admin/menu/:id', async (req, res, next) => {
		try {
			// Delete associated entries from the menu_tags table
			await req.db.run('DELETE FROM menu_tags WHERE menu_id = ?', req.params.id);

			// Delete associated entries from the business_menu table
			await req.db.run('DELETE FROM business_menu WHERE menu_id = ?', req.params.id);

			// Delete the menu entry
			await req.db.run('DELETE FROM menu WHERE id = ?', req.params.id);

			res.json({ message: 'Dish deleted successfully' });
		} catch (err) {
			next(err);
			return;
		}
	});

	app.delete('/data/admin/categories/:id', async (req, res, next) => {
		const categoryId = req.params.id;

		try {
			// Delete the associations from the business_categories table
			await req.db.run('DELETE FROM business_categories WHERE category_id = ?', [categoryId]);

			// Delete the category
			await req.db.run('DELETE FROM categories WHERE id = ?', [categoryId]);

			res.status(200).send({ message: 'Category deleted successfully' });
		} catch (error) {
			next(error);
			return;
		}
	});
};

export default deleteRoutes;
