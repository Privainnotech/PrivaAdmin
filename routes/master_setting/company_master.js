const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

router.get('/data', async (req, res, next) => {
    try{
        let SelectCompany = `SELECT row_number() over(order by CompanyName) as 'index', *
            FROM MasterCompany
            WHERE CompanyActive = 1
            ORDER BY CompanyName`;
        let pool = await sql.connect(dbconfig);
        let Company = await pool.request().query(SelectCompany);
        res.status(200).send(JSON.stringify(Company.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.post('/add', async (req, res, next) => {
    try{
        let { CompanyName, CompanyAddress, CompanyTel, CompanyEmail } = req.body
        if (CompanyName == '') {
            res.status(400).send({message: "Please enter company's name"});
            return;
        }
        let pool = await sql.connect(dbconfig);
        let CheckCompany = await pool.request().query(`SELECT *
            FROM MasterCompany
            WHERE CompanyName = '${CompanyName}'`);
        if(!CheckCompany.recordset.length){
            let InsertCompany = `INSERT INTO MasterCompany(CompanyName, CompanyAddress, CompanyTel, CompanyEmail)
                VALUES(N'${CompanyName}', N'${CompanyAddress}', N'${CompanyTel}', N'${CompanyEmail}')`;
            await pool.request().query(InsertCompany);
            res.status(201).send({message: 'Successfully add company'});
        } else {
            if(CheckCompany.recordset[0].CompanyActive){
                res.status(400).send({message: 'Duplicate Company Name'});
            } else{
                let ActivateCompany = `UPDATE MasterCompany
                    SET
                    CompanyActive = 1
                    WHERE CompanyName = N'${CompanyName}'`;
                await pool.request().query(ActivateCompany);
                res.status(201).send({message: 'Successfully add company'});
            }
        }
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.put('/edit/:CompanyId', async (req, res) => {
    try{
        let CompanyId = req.params.CompanyId;
        let { CompanyName, CompanyAddress, CompanyTel, CompanyEmail } = req.body
        if (CompanyName = '') {
            res.status(400).send({message: "Please enter company's name"});
            return;
        }
        let pool = await sql.connect(dbconfig);
        let CheckCompany = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                SELECT *
                FROM MasterCompany
                WHERE CompanyName = '${CompanyName}' AND NOT CompanyId = ${CompanyId}
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckCompany.recordset[0].check){
            res.status(400).send({message: 'Duplicate Company Name'});
        } else{
            let UpdateCompany = `UPDATE MasterCompany
            SET
            CompanyName = N'${CompanyName}',
            CompanyAddress = N'${CompanyAddress}',
            CompanyTel = N'${CompanyTel}',
            CompanyEmail = N'${CompanyEmail}'
            WHERE CompanyId = ${CompanyId}`;
            await pool.request().query(UpdateCompany);
            res.status(200).send({message: `Successfully edit company`});
        }
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.delete('/delete/:CompanyId', async (req, res) => {
    try{
        let CompanyId = req.params.CompanyId;
        let DeleteCompany = `UPDATE MasterCompany
        SET CompanyActive = 0
        WHERE CompanyId = ${CompanyId}`;
        let pool = await sql.connect(dbconfig);
        await pool.request().query(DeleteCompany);
        res.status(200).send({message: `Successfully delete company`});
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})


module.exports = router