const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { dbconfig } = require("../../config");

const sendQuotationMail = require("../modules/mail");

const SelectEmp = (EmployeeId) => {
  return `SELECT EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeEmail
    FROM MasterEmployee
    WHERE EmployeeId = ${EmployeeId}`;
};

router.post("/request", async (req, res) => {
  try {
    let UserId = req.session.UserId;
    let { QuotationId, EmployeeApproveId } = req.body;
    console.log(req.body);
    if (!UserId) return res.status(400).send({ message: "Please login" });
    if (EmployeeApproveId == "")
      return res.status(400).send({ message: "Please select Approver" });
    let pool = await sql.connect(dbconfig);
    let getSender = await pool.request().query(SelectEmp(UserId));
    console.log(getSender.recordset[0]);
    let getReceiver = await pool.request().query(SelectEmp(EmployeeApproveId));
    console.log(getReceiver.recordset[0]);
    let getQuotation = await pool.request().query(`SELECT
      b.QuotationNo, a.QuotationRevised,
      c.CustomerName, c.CustomerEmail, d.CompanyName, d.CompanyAddress, a.EndCustomer,
      a.QuotationSubject, FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
      a.QuotationTotalPrice, a.QuotationDiscount,
      a.QuotationNet, a.QuotationVat, a.QuotationNetVat
      FROM [Quotation] a
      LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN [MasterCustomer] c ON b.CustomerId = c.CustomerId
      LEFT JOIN [MasterCompany] d ON c.CompanyId = d.CompanyId
      WHERE a.QuotationId = ${QuotationId}`);
    console.log(getQuotation.recordset[0]);
    let Sender = getSender.recordset[0];
    let Receiver = getReceiver.recordset[0];
    let Quotation = getQuotation.recordset[0];
    if (Quotation.QuotationApproval) {
      return res.status(400).send({ message: "Quotation already approved" });
    }
    let checkItem = await pool.request().query(`SELECT ItemId
        FROM QuotationItem
        WHERE QuotationId = ${QuotationId}`);
    if (!checkItem.recordset.length) {
      return res.status(400).send({ message: "Please check quotation item" });
    }
    await sendQuotationMail(Sender, Receiver, Quotation);
    let WaitApproveQuotation = `UPDATE Quotation
        SET QuotationApproval = 1
        WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(WaitApproveQuotation);
    res.status(201).send({ message: "Successfully send approval request" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/approve", async (req, res) => {
  try {
    let UserId = req.session.UserId;
    let { QuotationId, EmployeeApproveId } = req.body;
    if (UserId == "") return res.status(400).send({ message: "Please login" });
    if (UserId !== EmployeeApproveId) {
      res.status(400).send({ message: "You cannot approve this quotation" });
      return;
    }
    let pool = await sql.connect(dbconfig);
    let ApproveQuotation = `UPDATE Quotation
        SET QuotationApproval = 2
        WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(ApproveQuotation);
    res.status(201).send({ message: "Successfully Approve Quotation" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
