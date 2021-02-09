const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// setups router
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
    const values = {$menuId: menuItemId};
    db.all(sql, values, (err, menuItems) => {
        if(err) {
            next(err)
        } else if(menuItems) {
            req.menuItems = menuItems;
            next();
        } else {
            res.sendStatus(404);
        }
    });
})

// get all menu Items
menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
    const values = {$menuId: req.params.menuId};
    db.all(sql, values, (err, menuItems) => {
        if(err) {
            next(err)
        } else if(menuItems) {
            res.status(200).json({menuItems: menuItems});
        } else {
            res.sendStatus(404);
        }
    });
    
});

// create a menu Items 
menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    if(!name || !description || !inventory || !price){
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
                'VALUES ($name, $description, $inventory, $price, $menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(err){
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id=${this.lastID}`,
            (err, menuItem) => {
                res.status(201).json({menuItem: menuItem});
            });
        }
    });
});

// update a menut Items
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    if(!name || !description || !inventory || !price){
        return res.sendStatus(400);
    }
    const sql = 'UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price=$price ' +
    'WHERE MenuItem.id=$menuItemId';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    };

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get('SELECT * FROM MenuItem WHERE MenuItem.id=$menuItemId', {$menuItemId: req.params.menuItemId},
            (err, menu) => {
                if(menu) {
                    res.status(200).json({menuItem: menu});
                } else {
                    res.sendStatus(404);
                }
            });
        }
    });
});


// delete a menut Item
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE MenuItem.id=$menuItemId';
    const values = {$menuItemId: req.params.menuItemId};
    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = menuItemsRouter;