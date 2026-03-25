var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// POST /add_stock - Tang stock theo quantity
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid product or quantity' });
        }

        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found for this product' });
        }

        inventory.stock += quantity;
        await inventory.save();

        res.json({
            message: `Added ${quantity} to stock successfully`,
            inventory
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /remove_stock - Giam stock theo quantity
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid product or quantity' });
        }

        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found for this product' });
        }

        if (inventory.stock < quantity) {
            return res.status(400).json({ error: `Insufficient stock. Current stock: ${inventory.stock}` });
        }

        inventory.stock -= quantity;
        await inventory.save();

        res.json({
            message: `Removed ${quantity} from stock successfully`,
            inventory
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /reservation - Giam stock va tang reserved
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid product or quantity' });
        }

        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found for this product' });
        }

        if (inventory.stock < quantity) {
            return res.status(400).json({ error: `Insufficient stock for reservation. Current stock: ${inventory.stock}` });
        }

        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();

        res.json({
            message: `Reserved ${quantity} units successfully`,
            inventory
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /sold - Giam reserved va tang soldCount
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid product or quantity' });
        }

        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found for this product' });
        }

        if (inventory.reserved < quantity) {
            return res.status(400).json({ error: `Insufficient reserved quantity. Current reserved: ${inventory.reserved}` });
        }

        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();

        res.json({
            message: `Sold ${quantity} units successfully`,
            inventory
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET all inventories (populate product info)
router.get('/', async function (req, res, next) {
    try {
        let data = await inventoryModel.find().populate({
            path: 'product',
            select: 'title slug price images description category'
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET inventory by ID (populate product info)
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate({
            path: 'product',
            select: 'title slug price images description category'
        });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Inventory not found' });
        }
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;
