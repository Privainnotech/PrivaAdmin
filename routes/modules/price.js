const sql = require("mssql");
const { dbconfig } = require("../../config");

const PriceS = async (SubItemId) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UpdatePrice = `
        DECLARE @QuotationId bigint, @ItemId bigint
        SET @ItemId = (SELECT ItemId FROM privanet.QuotationSubItem WHERE SubItemId = ${SubItemId})
        SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId = @ItemId)
  
        UPDATE privanet.QuotationItem
        SET ItemPrice = (SELECT SUM(SubItemQty * SubItemPrice) 
          FROM privanet.QuotationSubItem
          WHERE ItemId = @ItemId)
        WHERE ItemId = @ItemId
  
        UPDATE privanet.Quotation
        SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
          FROM privanet.QuotationItem 
          WHERE QuotationId = @QuotationId)
        WHERE QuotationId = @QuotationId`;
    await pool.request().query(UpdatePrice);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

const PriceI = async (ItemId) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UpdatePrice = `
        DECLARE @QuotationId bigint
        SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId = ${ItemId})
        
        UPDATE privanet.QuotationItem
        SET ItemPrice = (SELECT SUM(SubItemQty * SubItemPrice) 
          FROM privanet.QuotationSubItem
          WHERE ItemId = ${ItemId})
        WHERE ItemId = ${ItemId}
  
        UPDATE privanet.Quotation
        SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
          FROM privanet.QuotationItem 
          WHERE QuotationId = @QuotationId)
        WHERE QuotationId = @QuotationId`;
    await pool.request().query(UpdatePrice);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

const PriceQ = async (ItemId) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UpdatePrice = `
        DECLARE @QuotationId bigint
        SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId = ${ItemId})
  
        UPDATE privanet.Quotation
        SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
          FROM privanet.QuotationItem 
          WHERE QuotationId = @QuotationId)
        WHERE QuotationId = @QuotationId`;
    await pool.request().query(UpdatePrice);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

module.exports = {
  PriceS,
  PriceI,
  PriceQ,
};
