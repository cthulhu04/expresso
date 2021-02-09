const e = require('express');
const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets');


// routers setting




// get all employees
employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employee) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({employees: employee});
        }
    });
});


// get a employee
employeesRouter.get('/:employeeId', (req, res, next) => {
    const sql  = 'SELECT * FROM Employee WHERE id = $employeeId';
    const values = {$employeeId: req.params.employeeId};
    db.get(sql, values, (err, employee) => {
        if(err) {
            next(err);
        } else if (employee) {
            res.status(200).json({employee: employee});
        } else {
            res.sendStatus(404);
        }
    });
});


// surpass timesheets route
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);


// create a employee
employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage) {
        return res.sendStatus(400);
    } 
    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) ' +
                'VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
    };
    db.run(sql, values, function(err){
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, 
            (err, employee) => {
                res.status(201).json({employee: employee});
            });
        }
    })
});


// update a employee
employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage) {
        return res.sendStatus(400);
    } 
    const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
                'wage = $wage, is_current_employee = $isCurrentEmployee ' +
                'WHERE id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId,
    };

    db.run(sql, values, (err) => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, 
            (err, employee) => {
                if(!employee) {
                    res.sendStatus(404);
                } else {
                    res.status(200).json({employee: employee});
                }
            });
        }
    });
    
});


// delete unemployed a employee
employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId';
    const values = {$employeeId: req.params.employeeId};
    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
            (err, employee) => {
                if(employee) {
                    res.sendStatus(200);
                }  else {
                    res.sendStatus(404);
                    //  16) should return the deleted employee after employee delete
                    // check again 
                }
            });
        }
    });
});

module.exports = employeesRouter;