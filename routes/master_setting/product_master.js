const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

router.get('/data', async (req, res, next) => {
    try{
        let SelectProduct = `SELECT row_number() over(order by ProductName) as 'index', * FROM MasterProduct ORDER BY ProductName`;
        let pool = await sql.connect(dbconfig);
        let Product = await pool.request().query(SelectProduct);
        res.status(200).send(JSON.stringify(Product.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.post('/add', async (req, res, next) => {
    try{
        let { ProductName, ProductPrice, ProductType } = req.body
        let pool = await sql.connect(dbconfig);
        let CheckProduct = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                SELECT *
                FROM MasterProduct
                WHERE ProductName = N'${ProductName}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckProduct.recordset[0].check){
            res.status(400).send({message: 'Duplicate Product'});  
        } else {
            let ProductCode = '';
            let CheckProductCode = await pool.request().query(`
                SELECT *
                FROM MasterProduct
                WHERE ProductCode LIKE N'%${checkMonth()}%'`)
            if (CheckProductCode.recordset.length<10) {
                ProductCode = ProductType[0]+"_"+checkMonth()+'00'+CheckProductCode.recordset.length
            } else if (CheckProductCode.recordset.length<100) {
                ProductCode = ProductType[0]+"_"+checkMonth()+'0'+CheckProductCode.recordset.length
            } else {
                ProductCode = ProductType[0]+"_"+checkMonth()+CheckProductCode.recordset.length
            }
            console.log("Gen ProductCode: " + ProductCode)
            let InsertProduct = `INSERT INTO MasterProduct(ProductCode, ProductName, ProductPrice, ProductType)
                VALUES  (N'${ProductCode}', N'${ProductName}', N'${ProductPrice}', N'${ProductType}'`;
            await pool.request().query(InsertProduct);
            res.status(201).send({message: 'Successfully add Product'});
        }
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.put('/edit/:ProductId', async (req, res) => {
    try{
        let ProductId = req.params.ProductId;
        let { ProductName, ProductPrice, ProductType } = req.body
        let pool = await sql.connect(dbconfig);
        let CheckProduct = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                SELECT *
                FROM MasterProduct
                WHERE ProductName = N'${ProductName}  AND NOT ProductId = ${ProductId}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckProduct.recordset[0].check){
            res.status(400).send({message: 'Duplicate Product'});
        } else{
            let UpdateProduct = `UPDATE MasterProduct
                SET
                ProductCode = N'${ProductCode}',
                ProductName = N'${ProductName}',
                ProductPrice = N'${ProductPrice}',
                ProductType = N'${ProductType}'
                WHERE ProductId = ${ProductId}`;
            await pool.request().query(UpdateProduct);
            res.status(200).send({message: `Successfully edit Product`});
        }
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.delete('/delete/:ProductId', async (req, res) => {
    try{
        let ProductId = req.params.ProductId;
        let DeleteProduct = `DELETE FROM MasterProduct
            WHERE ProductId = ${ProductId}`;
        let pool = await sql.connect(dbconfig);
        await pool.request().query(DeleteProduct);
        res.status(200).send({message: `Successfully delete Product`});
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

module.exports = router