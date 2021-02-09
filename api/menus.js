const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuitems');

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE id = $menuId'; 
    const values = {$menuId: menuId};
    db.get(sql, values, (err, menu) => {
        if(err) {
            next(err);
        } else if(menu) {
            req.menus = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
})

// get all menus 
menusRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Menu';
    db.all(sql, (err, menus) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

// get a menus
menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menus});
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// create a menus
menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {$title: title};
    db.run(sql, values, function(err) {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, 
            (err, menus) => {
                res.status(201).json({menu: menus});
            })
        }
    });
});

// update a menu 
menusRouter.put('/:menuId', (req, res, next) => {;
    const title = req.body.menu.title;
    if(!title) {
        res.sendStatus(400);
    }
    const sql = 'UPDATE Menu SET title=$title WHERE id=$menuId';
    const values = {
        $title: title,
        $menuId: req.params.menuId
    };
    db.run(sql, values, (err) => {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id=${req.params.menuId}`, 
            (err, menus) => {
                res.status(200).jsonp({menu: menus});
            });
        }
    });
});

// delete menu
menusRouter.delete('/:menuId', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
    const values = {$menuId: req.params.menuId};
    db.get(sql, values, (err, menu) => {
        if(err) {
            next(err);
        } else if(menu) {
            res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Menu WHERE Menu.id=${req.params.menuId}`, 
            (err) => { 
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    })

 
});

module.exports = menusRouter;