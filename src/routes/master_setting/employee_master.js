const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

router.get('/data', async (req, res, next) => {
    try{
        let SelectEmployee = `SELECT row_number() over(order by EmployeeFname) as 'index', *, EmployeeTitle+EmployeeFname+' '+EmployeeLname EmployeeName FROM MasterEmployee ORDER BY EmployeeFname`;
        let pool = await sql.connect(dbconfig);
        let Employee = await pool.request().query(SelectEmployee);
        res.status(200).send(JSON.stringify(Employee.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.post('/add', async (req, res, next) => {
    try{
        let { EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeTel, EmployeeEmail, EmployeePosition } = req.body
        let pool = await sql.connect(dbconfig);
        console.log('checked')
        let CheckEmployee = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                SELECT *
                FROM MasterEmployee
                WHERE EmployeeEmail = N'${EmployeeEmail}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckEmployee.recordset[0].check){
            res.status(400).send({message: 'Duplicate Employee Email'});  
        } else {
            let InsertEmployee = `INSERT INTO MasterEmployee(EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeTel, EmployeeEmail, EmployeePosition)
                VALUES  (N'${EmployeeTitle}', N'${EmployeeFname}', N'${EmployeeLname}', N'${EmployeeTel}', N'${EmployeeEmail}', N'${EmployeePosition}')`;
            await pool.request().query(InsertEmployee);
            res.status(201).send({message: 'Successfully add Employee'});
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.put('/edit/:EmployeeId', async (req, res) => {
    try{
        let EmployeeId = req.params.EmployeeId;
        let { EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeTel, EmployeeEmail, EmployeePosition } = req.body
        let pool = await sql.connect(dbconfig);
        let CheckEmployee = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                SELECT *
                FROM MasterEmployee
                WHERE EmployeeEmail = N'${EmployeeEmail}  AND NOT EmployeeId = ${EmployeeId}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckEmployee.recordset[0].check){
            res.status(400).send({message: 'Duplicate Employee Email'});
        } else{
            let UpdateEmployee = `UPDATE MasterEmployee
                SET
                EmployeeTitle = N'${EmployeeTitle}',
                EmployeeFname = N'${EmployeeFname}',
                EmployeeLname = N'${EmployeeLname}',
                EmployeeTel = N'${EmployeeTel}',
                EmployeeEmail = N'${EmployeeEmail}',
                EmployeePosition = N'${EmployeePosition}'
                WHERE EmployeeId = ${EmployeeId}`;
            await pool.request().query(UpdateEmployee);
            res.status(200).send({message: `Successfully edit Employee`});
        }
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.delete('/delete/:EmployeeId', async (req, res) => {
    try{
        let EmployeeId = req.params.EmployeeId;
        let DeleteEmployee = `DELETE FROM MasterEmployee
            WHERE EmployeeId = ${EmployeeId}`;
        let pool = await sql.connect(dbconfig);
        await pool.request().query(DeleteEmployee);
        res.status(200).send({message: `Successfully delete Employee`});
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

module.exports = router