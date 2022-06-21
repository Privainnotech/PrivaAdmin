const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

router.get('/data', async (req, res, next) => {
    try{
        let SelectEmployee = `SELECT row_number() over(order by EmployeeFname) as 'index', * FROM MasterEmployee ORDER BY EmployeeFname`;
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
            let InsertEmployee = `INSERT INTO MasterEmployee(EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeTel, EmployeeEmail, EmployeePosition)
                VALUES  (N'${EmployeeTitle}', N'${EmployeeFname}', N'${EmployeeLname}', N'${EmployeeTel}', N'${EmployeeEmail}', N'${EmployeePosition}')`;
            await pool.request().query(InsertEmployee);
            res.status(201).send({message: 'Successfully add Employee'});
        } else {
            if(CheckEmployee.recordset[0].EmployeeActive){
                console.log('checked')
                res.status(400).send({message: 'Duplicate Employee Email'});
            } else{
                let ActivateEmployee = `UPDATE MasterEmployee
                    SET
                    EmployeeActive = 1
                    WHERE EmployeeEmail = N'${EmployeeEmail}'`;
                await pool.request().query(ActivateEmployee);
                res.status(201).send({message: 'Successfully add Employee'});
            }
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.put('/edit/:EmployeeId', async (req, res) => {
    try{
        let CustomerId = req.params.CustomerId;
        let { CustomerTitle, CustomerFname, CustomerLname, CustomerTel, CustomerEmail, CompanyId } = req.body
        if(CompanyId == 'null'){
            res.status(400).send({message: 'Please select Company'});
            return;
        }
        let pool = await sql.connect(dbconfig);
        let CheckCustomer = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                SELECT *
                FROM MasterCustomer
                WHERE CustomerEmail = N'${CustomerEmail}  AND NOT CompanyId = ${CustomerId}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckCustomer.recordset[0].check){
            res.status(400).send({message: 'Duplicate Customer Email'});
        } else{
            let UpdateCustomer = `UPDATE MasterCustomer
                SET
                CustomerTitle = N'${CustomerTitle}',
                CustomerFname = N'${CustomerFname}',
                CustomerLname = N'${CustomerLname}',
                CustomerTel = N'${CustomerTel}',
                CustomerEmail = N'${CustomerEmail}'
                WHERE CustomerId = ${CustomerId}`;
            await pool.request().query(UpdateCustomer);
            res.status(200).send({message: `Successfully edit customer`});
        }
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.delete('/delete/:CustomerId', async (req, res) => {
    try{
        let CustomerId = req.params.CustomerId;
        let DeleteCustomer = `UPDATE MasterCustomer
            SET CustomerActive = 0
            WHERE CustomerId = ${CustomerId}`;
        let pool = await sql.connect(dbconfig);
        await pool.request().query(DeleteCustomer);
        res.status(200).send({message: `Successfully delete customer`});
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

module.exports = router