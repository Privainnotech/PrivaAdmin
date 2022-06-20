const express = require('express');
const router = express.Router();
const { pool } = require('../../config');

router.get('/quotation_list', async (req, res, next) => {
    try{
        getQuotationList = `SELECT`;
        let quotationList = await pool.request().query(getQuotationList)
        res.status(200).send(JSON.stringify(quotationList.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})