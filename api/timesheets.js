const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id=$employeeId';
    const values = {$employeeId: timesheetId};
    db.all(sql, values,  (err, timesheets) => {
        if(err) {
            next(err);
        } else if(timesheets) {
            req.timesheets = timesheets;
            next()
        } else {
            res.sendStatus(404);
        }
       
    });
});


// validation
const validation = (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    if(!hours || !rate || !date ) {
        return res.sendStatus(400);
    } else {
        next();
    }
}


// get all employeeId timesheets
timesheetsRouter.get('/', (req, res, next) => {
   
    const query = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id=$employeeId';
    const values = {
      $employeeId: req.params.employeeId
    };
  
    db.all(query, values, (err, timesheets) => {
      if(err) {
        next(err);
      } 
        res.status(200).json({timesheets: timesheets});
    })
});


// create a employeeId timesheets
timesheetsRouter.post('/', validation, (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    // if(!hours || !rate || !date ) {
    //     return res.sendStatus(400);
    // }
    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
    };

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (err, timesheet) => {
                res.status(201).json({timesheet: timesheet});
            });
        }
    });
});


// update a timehsheet
timesheetsRouter.put('/:timesheetId', validation, (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const sql = 'UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date WHERE Timesheet.id=$timesheetId';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: req.params.timesheetId,
    };
    db.run(sql, values, (err) => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (err, timesheet) => {
                  if (timesheet) {
                    res.status(200).json({timesheet: timesheet});
                } else {
                    res.sendStatus(404);
                }
            });
        }
    });
});

// delete a timesheet
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};
    db.run(sql, values, (err) => {
        res.sendStatus(204);
    })
});


module.exports = timesheetsRouter;