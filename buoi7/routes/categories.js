var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/categories');

// GET all categories
router.get('/', async function (req, res, next) {
    try {
        let data = await categoryModel.find({ isDeleted: false });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET category by ID
router.get('/:id', async function (req, res, next) {
    try {
        let result = await categoryModel.findById(req.params.id);
        if (!result) return res.status(404).json({ error: 'Category not found' });
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST create category
router.post('/', async function (req, res, next) {
    try {
        let newCategory = new categoryModel({
            name: req.body.name,
            slug: req.body.slug,
            image: req.body.image
        });
        await newCategory.save();
        res.json(newCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update category
router.put('/:id', async function (req, res, next) {
    try {
        let result = await categoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE (soft delete)
router.delete('/:id', async function (req, res, next) {
    try {
        let result = await categoryModel.findById(req.params.id);
        if (!result) return res.status(404).json({ error: 'Category not found' });
        result.isDeleted = true;
        await result.save();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
