const sql = require("mssql");
const { dbconfig } = require("../../config");

const PriceS = async (SubItemId) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UpdatePrice = `
        DECLARE @QuotationId bigint, @ItemId bigint
        SET @ItemId = (SELECT ItemId FROM QuotationSubItem WHERE SubItemId = ${SubItemId})
        SET @QuotationId = (SELECT QuotationId FROM QuotationItem WHERE ItemId = @ItemId)
  
        UPDATE QuotationItem
        SET ItemPrice = (SELECT SUM(SubItemQty * SubItemPrice) 
          FROM QuotationSubItem
          WHERE ItemId = @ItemId)
        WHERE ItemId = @ItemId
  
        UPDATE Quotation
        SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
          FROM QuotationItem 
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
        SET @QuotationId = (SELECT QuotationId FROM QuotationItem WHERE ItemId = ${ItemId})
        
        UPDATE QuotationItem
        SET ItemPrice = (SELECT SUM(SubItemQty * SubItemPrice) 
          FROM QuotationSubItem
          WHERE ItemId = ${ItemId})
        WHERE ItemId = ${ItemId}
  
        UPDATE Quotation
        SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
          FROM QuotationItem 
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
        SET @QuotationId = (SELECT QuotationId FROM QuotationItem WHERE ItemId = ${ItemId})
  
        UPDATE Quotation
        SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
          FROM QuotationItem 
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
