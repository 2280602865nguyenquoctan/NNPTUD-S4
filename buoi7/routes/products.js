var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let productModel = require('../schemas/products');
let inventoryModel = require('../schemas/inventories');

// GET all products
router.get('/', async function (req, res, next) {
    try {
        let data = await productModel.find({ isDeleted: false }).populate({
            path: 'category',
            select: 'name'
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET product by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findOne({ isDeleted: false, _id: id }).populate({
            path: 'category',
            select: 'name'
        });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST create product → auto create inventory
router.post('/', async function (req, res, next) {
    try {
        let newProduct = new productModel({
            title: req.body.title,
            slug: slugify(req.body.title, {
                replacement: '-',
                remove: undefined,
                lower: true,
                trim: true
            }),
            price: req.body.price,
            images: req.body.images,
            description: req.body.description,
            category: req.body.category
        });
        await newProduct.save();

        // Auto-create inventory for the new product
        let newInventory = new inventoryModel({
            product: newProduct._id,
            stock: 0,
            reserved: 0,
            soldCount: 0
        });
        await newInventory.save();

        res.json({
            product: newProduct,
            inventory: newInventory
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update product
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findByIdAndUpdate(id, req.body, { new: true });
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE (soft delete)
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findById(id);
        if (!result) return res.status(404).json({ error: 'Product not found' });
        result.isDeleted = true;
        await result.save();
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;
