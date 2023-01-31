const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { dbconfig } = require("../../config");

const { checkMonth, checkDate, checkTime } = require("../../libs/datetime");
const { PriceS, PriceI, PriceQ } = require("../modules/price");

router.get("/quotation_no_list", async (req, res, next) => {
  try {
    let getQuotationNoList = `SELECT
        row_number() over(order by a.QuotationNo desc) as 'index',
        a.QuotationNoId, a.QuotationNo, a.CustomerId, c.CustomerName,
        c.CompanyId,d.CompanyName,
        (SELECT TOP 1 QuotationSubject
          FROM privanet.[Quotation]
          ORDER BY )
      FROM privanet.[QuotationNo] a
      LEFT JOIN privanet.[Quotation] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterCustomer] c ON a.CustomerId = c.CustomerId
      LEFT JOIN privanet.[MasterCompany] d ON c.CompanyId = d.CompanyId
      WHERE NOT c.CustomerName = N'Fake'`;
    let pool = await sql.connect(dbconfig);
    let quotationNos = await pool.request().query(getQuotationNoList);
    res.status(200).send(JSON.stringify(quotationNos.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/quotation_list/:QuotationNoId", async (req, res, next) => {
  try {
    let { QuotationNoId } = req.params;
    let getQuotationList = `SELECT
        row_number() over(
          order by a.QuotationStatus,a.QuotationRevised desc,a.QuotationUpdatedDate desc
        ) as 'index',
        b.QuotationNoId, a.QuotationId, a.QuotationStatus, b.QuotationNo,
        a.QuotationRevised, a.QuotationSubject,
        FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
        FORMAT(a.QuotationUpdatedDate, 'dd-MM-yyyy HH:mm') QuotationUpdatedDate,
        c.StatusName, a.EmployeeApproveId, d.EmployeeFname, a.QuotationApproval
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterStatus] c ON a.QuotationStatus = c.StatusId
      LEFT JOIN privanet.[MasterEmployee] d ON a.EmployeeEditId = d.EmployeeId
      WHERE a.QuotationNoId = ${QuotationNoId}`;
    let pool = await sql.connect(dbconfig);
    let quotations = await pool.request().query(getQuotationList);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/list", async (req, res, next) => {
  try {
    getQuotationList = `SELECT
      row_number() over(order by a.QuotationUpdatedDate desc) as 'index',
      b.QuotationNoId, a.QuotationId, a.QuotationStatus, b.QuotationNo,
      a.QuotationRevised, a.QuotationSubject, c.CustomerName,
      FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
      FORMAT(a.QuotationUpdatedDate, 'dd-MM-yyyy HH:mm') QuotationUpdatedDate,
      d.StatusName, a.EmployeeApproveId, e.EmployeeFname, a.QuotationApproval
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterCustomer] c ON b.CustomerId = c.CustomerId
      LEFT JOIN privanet.[MasterStatus] d ON a.QuotationStatus = d.StatusId
      LEFT JOIN privanet.[MasterEmployee] e ON a.EmployeeEditId = e.EmployeeId
      WHERE NOT c.CustomerName = N'Fake'`;
    let pool = await sql.connect(dbconfig);
    let quotations = await pool.request().query(getQuotationList);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = `SELECT
        b.QuotationNoId, b.QuotationNo, a.QuotationRevised, a.QuotationStatus, d.StatusName,
        c.CustomerName, c.CustomerEmail, f.CompanyName,
        f.CompanyAddress, a.QuotationId, a.QuotationSubject, a.EndCustomer,
        FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
        FORMAT(a.QuotationUpdatedDate, 'dd-MM-yyyy HH:mm') QuotationUpdatedDate,
        a.QuotationTotalPrice, a.QuotationDiscount, a.QuotationNet,
        a.QuotationVat, a.QuotationNetVat,
        CONVERT(nvarchar(max), a.QuotationValidityDate) AS 'QuotationValidityDate',
        CONVERT(nvarchar(max), a.QuotationPayTerm) AS 'QuotationPayTerm',
        CONVERT(nvarchar(max), a.QuotationDelivery) AS 'QuotationDelivery',
        CONVERT(nvarchar(max), a.QuotationRemark) AS 'QuotationRemark',
        CONVERT(nvarchar(max), a.QuotationDetail) AS 'QuotationDetail',
        a.EmployeeApproveId, e.EmployeeFname + ' ' + e.EmployeeLname EmployeeName,
        e.EmployeeEmail, e.EmployeePosition, a.QuotationApproval,
        g.TableShow, g.TablePrice, g.TableQty, g.TableTotal
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterCustomer] c ON b.CustomerId = c.CustomerId
      LEFT JOIN privanet.[MasterStatus] d ON a.QuotationStatus = d.StatusId
      LEFT JOIN privanet.[MasterEmployee] e ON a.EmployeeApproveId = e.EmployeeId
      LEFT JOIN privanet.[MasterCompany] f ON c.CompanyId = f.CompanyId
      LEFT JOIN privanet.[QuotationSetting] g ON a.QuotationId = g.QuotationId
      WHERE a.QuotationId = ${QuotationId}`;
    let quotations = await pool.request().query(getQuotation);
    let { QuotationNo, QuotationRevised } = quotations.recordset[0];
    let { QuotationPayTerm, EmployeeApproveId } = quotations.recordset[0];
    let { QuotationDetail } = quotations.recordset[0];
    let Revised = "";
    QuotationRevised < 10
      ? (Revised = "0" + QuotationRevised.toString())
      : (Revised = QuotationRevised.toString());
    quotations.recordset[0].QuotationNo_Revised = `${QuotationNo}_${Revised}`;
    if (
      typeof QuotationPayTerm == "object" ||
      !QuotationPayTerm.includes("QuotationPayTerm")
    ) {
      quotations.recordset[0].QuotationPayTerm = "";
    } else {
      quotations.recordset[0].QuotationPayTerm = JSON.parse(QuotationPayTerm);
    }
    if (typeof EmployeeApproveId == "object") {
      quotations.recordset[0].EmployeeApproveId = "";
    }
    if (typeof QuotationDetail === "object" || QuotationDetail === "null" || QuotationDetail === "") {
      quotations.recordset[0].QuotationDetail = detailDefault;
    } else {
      quotations.recordset[0].QuotationDetail = JSON.parse(QuotationDetail);
      if (quotations.recordset[0].QuotationDetail.blocks.length === 0) {
        quotations.recordset[0].QuotationDetail = detailDefault;
      }
    }
    quotations.recordset[0].QuotationRevised = Revised;
    res.status(200).send(JSON.stringify(quotations.recordset[0]));
  } catch (err) {
    console.log(`${err}`);
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/item/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotationItem = `SELECT row_number() over(order by a.ItemId) as 'Item',
      a.QuotationId, a.ItemId, a.ItemName,
      a.ItemPrice, a.ItemQty, b.QuotationStatus
      FROM privanet.[QuotationItem] a
      LEFT JOIN privanet.[Quotation] b on a.QuotationId = b.QuotationId
      WHERE a.QuotationId = ${QuotationId}`;
    let quotations = await pool.request().query(getQuotationItem);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/subitem/:ItemId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let ItemId = req.params.ItemId;
    let getQuotationSubItem = `SELECT row_number() over(order by a.SubItemId) as 'Index',
      c.QuotationId, a.SubItemId, b.ProductId, b.ProductType, b.ProductCode,
      a.SubItemName, a.SubItemPrice, a.SubItemQty, a.SubItemUnit,
      CONVERT(nvarchar(5), a.SubItemQty)+' '+a.SubItemUnit SubItemQtyUnit
      FROM privanet.[QuotationSubItem] a
      LEFT JOIN privanet.[MasterProduct] b ON a.ProductId = b.ProductId
      LEFT JOIN privanet.[QuotationItem] c ON a.ItemId = c.ItemId
      WHERE a.ItemId = ${ItemId}`;
    let quotations = await pool.request().query(getQuotationSubItem);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.post("/add_pre_quotation", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    let { QuotationSubject, CustomerId } = req.body;
    if (!UserId) return res.status(400).send({ message: "Please login" });
    if (QuotationSubject == "")
      return res.status(400).send({ message: "Please enter Project name" });
    if (CustomerId == "")
      return res.status(400).send({ message: "Please select Customer" });

    // Generate QuotationNo
    let month = checkMonth();
    console.log(month);
    let genQuotationNo = "";
    let SearchQuotationNo = await pool.request().query(`
      SELECT *
      FROM privanet.QuotationNo
      WHERE QuotationNo LIKE N'pre_${month}%'`);
    // Check QuotationNo
    let duplicateNo = true;
    let Number = SearchQuotationNo.recordset.length;
    do {
      if (Number < 10) {
        genQuotationNo = "pre_" + month + "00" + Number;
      } else if (Number < 100) {
        genQuotationNo = "pre_" + month + "0" + Number;
      } else {
        genQuotationNo = "pre_" + month + Number;
      }
      let CheckQuotationNo = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
          SELECT *
          FROM privanet.QuotationNo
          WHERE QuotationNo = N'${genQuotationNo}'
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`);
      duplicateNo = CheckQuotationNo.recordset[0].check;
      if (duplicateNo) {
        Number++;
      }
    } while (duplicateNo);
    // Insert QuotationNo
    let InsertQuotationNo = `INSERT INTO privanet.QuotationNo(QuotationNo,CustomerId)
      VALUES(N'${genQuotationNo}',${CustomerId})
      SELECT SCOPE_IDENTITY() AS Id`;
    let QuotationNo = await pool.request().query(InsertQuotationNo);
    console.log("Quotation NO");
    let QuotationNoId = QuotationNo.recordset[0].Id;
    // Insert Quotation with QuotationNoId
    let time = checkTime();
    console.log(time);
    let InsertQuotation = `INSERT INTO privanet.Quotation(
        QuotationNoId, QuotationSubject, QuotationUpdatedDate, EmployeeEditId
      )
      VALUES(${QuotationNoId}, N'${QuotationSubject}', N'${time}', ${UserId})
      SELECT SCOPE_IDENTITY() AS Id`;
    let Quotation = await pool.request().query(InsertQuotation);
    console.log("Quotation");
    let QuotationId = Quotation.recordset[0].Id;
    let InsertSetting = `INSERT INTO privanet.QuotationSetting(QuotationId)
      VALUES(${QuotationId})`;
    await pool.request().query(InsertSetting);
    console.log("Quotation Setting");
    res.status(201).send({
      message: "Successfully add Quotation",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.post("/add_item/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let { ItemName, ItemPrice, ItemQty } = req.body;
    //Unit = {Pc, Set, Lot} => Dropdown
    if (ItemName == "") {
      res.status(400).send({ message: "Please enter Item name" });
      return;
    }
    if (ItemPrice == "") ItemPrice = 0;
    if (ItemQty == "") ItemQty = 0;
    let CheckQuotationItem = await pool.request().query(`SELECT CASE
      WHEN EXISTS(
        SELECT *
        FROM privanet.QuotationItem
        WHERE ItemName = N'${ItemName}' AND QuotationId = ${QuotationId}
      )
      THEN CAST (1 AS BIT)
      ELSE CAST (0 AS BIT) END AS 'check'`);
    if (CheckQuotationItem.recordset[0].check) {
      res.status(400).send({ message: "Duplicate item in quotation" });
    } else {
      console.log("insert");
      console.log(QuotationId + ItemName + ItemPrice + ItemQty);
      let InsertItem = `INSERT INTO privanet.QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty)
        VALUES(${QuotationId}, N'${ItemName}', ${ItemPrice}, ${ItemQty})
        SELECT SCOPE_IDENTITY() AS Id`;
      let Item = await pool.request().query(InsertItem);
      if (!(ItemPrice === 0 || ItemQty === 0)) {
        PriceQ(Item.recordset[0].Id);
      }
      res.status(201).send({ message: "Successfully add Item" });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.post("/add_subitem/:ItemId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let ItemId = req.params.ItemId;
    console.log(req.body);
    let { ProductId, ProductType, SubItemName } = req.body;
    let { SubItemPrice, SubItemQty, SubItemUnit } = req.body;
    // ProductType = {Labor, Material, Internal, Unknown} => Dropdown
    // Unit = {Pc, Set, Lot} => Dropdown
    if (SubItemName == "") {
      res.status(400).send({ message: "Please enter description" });
      return;
    }
    if (SubItemPrice == "") SubItemPrice = 0;
    if (SubItemQty == "") SubItemQty = 0;
    if (ProductId == "") {
      // Add new product
      let CheckProduct = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
          SELECT *
          FROM privanet.MasterProduct
          WHERE ProductName = N'${SubItemName}'
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`);
      if (CheckProduct.recordset[0].check) {
        let getProductId = await pool.request().query(
          `SELECT ProductId FROM privanet.MasterProduct
            WHERE ProductName = N'${SubItemName}'`
        );
        let ProductId = getProductId.recordset[0].ProductId;
        console.log(ProductId);
        console.log(ItemId);
        let CheckSubItem = await pool.request().query(`SELECT CASE
          WHEN EXISTS(
            SELECT *
            FROM privanet.QuotationSubItem 
            WHERE ProductId = ${ProductId} and ItemId = ${ItemId}
          )
          THEN CAST (1 AS BIT)
          ELSE CAST (0 AS BIT) END AS 'check'`);
        if (CheckSubItem.recordset[0].check) {
          res.status(400).send({ message: "Duplicate Sub-item" });
        } else {
          console.log("check");
          let InsertSubItem = `INSERT INTO privanet.QuotationSubItem
            (ItemId, ProductId, SubItemName, SubItemPrice, SubItemQty, SubItemUnit)
            VALUES(${ItemId}, ${ProductId}, N'${SubItemName}', ${SubItemPrice},
              ${SubItemQty}, N'${SubItemUnit}')`;
          await pool.request().query(InsertSubItem);
          if (!(SubItemPrice === 0 || SubItemQty === 0)) {
            PriceI(ItemId);
          }
          res.status(201).send({ message: "Sub-item has been added" });
        }
      } else {
        let month = checkMonth();
        let ProductCode = "";
        let CheckProductCode = await pool.request().query(`
          SELECT *
          FROM privanet.MasterProduct
          WHERE ProductCode LIKE N'%${month}%'`);
        let length = CheckProductCode.recordset.length;
        if (length < 10) {
          ProductCode = ProductType[0] + "_" + month + "00" + length;
        } else if (length < 100) {
          ProductCode = ProductType[0] + "_" + month + "0" + length;
        } else {
          ProductCode = ProductType[0] + "_" + month + length;
        }
        console.log("Gen ProductCode: " + ProductCode);
        let InsertProduct = `INSERT INTO privanet.MasterProduct(ProductCode, ProductName, ProductType)
          VALUES(N'${ProductCode}', N'${SubItemName}', N'${ProductType}')
          SELECT SCOPE_IDENTITY() AS Id`;
        let newProduct = await pool.request().query(InsertProduct);
        console.log("ProductId: " + newProduct.recordset[0].Id);
        let InsertSubItem = `INSERT INTO privanet.QuotationSubItem
          (ItemId, ProductId, SubItemName, SubItemPrice, SubItemQty, SubItemUnit)
          VALUES(${ItemId}, ${newProduct.recordset[0].Id}, N'${SubItemName}', ${SubItemPrice},
            ${SubItemQty}, N'${SubItemUnit}')`;
        await pool.request().query(InsertSubItem);
        if (!(SubItemPrice === 0 || SubItemQty === 0)) {
          PriceI(ItemId);
        }
        res.status(201).send({ message: "Successfully add Sub-item" });
      }
    } else {
      // Already have product
      let CheckSubItem = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
          SELECT *
          FROM privanet.QuotationSubItem
          WHERE ProductId = ${ProductId} and ItemId = ${ItemId}
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`);
      if (CheckSubItem.recordset[0].check) {
        res.status(400).send({ message: "Duplicate Sub-item" });
      } else {
        let InsertSubItem = `INSERT INTO privanet.QuotationSubItem
          (ItemId, ProductId, SubItemName, SubItemPrice,SubItemQty, SubItemUnit)
          VALUES(${ItemId}, ${ProductId}, N'${SubItemName}', ${SubItemPrice},
            N'${SubItemQty}', N'${SubItemUnit}')`;
        await pool.request().query(InsertSubItem);
        if (!(SubItemPrice === 0 || SubItemQty === 0)) {
          PriceI(ItemId);
        }
        res.status(201).send({ message: "Sub-item has been added" });
      }
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.delete("/delete_quotation/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let Status = await pool.request().query(
      `SELECT QuotationStatus, QuotationRevised
        FROM privanet.Quotation WHERE QuotationId = ${QuotationId}`
    );
    if (Status.recordset[0].QuotationStatus == 1) {
      // Delete SubItem
      let selectItem = await pool.request().query(
        `SELECT ItemId FROM privanet.QuotationItem
          WHERE QuotationId = ${QuotationId}`
      );
      if (selectItem.recordset.length) {
        for (const item of selectItem.recordset) {
          let DeleteSubItem = `DELETE FROM privanet.QuotationSubItem WHERE ItemId=${item.ItemId}`;
          await pool.request().query(DeleteSubItem);
        }
      }
      let DeleteQuotation = `DECLARE @QuotationNoId bigint;
        SET @QuotationNoId = (SELECT QuotationNoId FROM privanet.Quotation WHERE QuotationId =  ${QuotationId});
        DELETE FROM privanet.QuotationItem WHERE QuotationId=${QuotationId}
        DELETE FROM privanet.QuotationSetting WHERE QuotationId=${QuotationId}
        DELETE FROM privanet.Quotation WHERE QuotationId=${QuotationId}
        DELETE FROM privanet.QuotationNo WHERE QuotationNoId = @QuotationNoId AND QuotationNo LIKE N'pre_%'`;
      await pool.request().query(DeleteQuotation);
      res.status(200).send({ message: "Successfully delete pre-quotation" });
    } else {
      res.status(400).send({ message: "Cannot delete quotation" });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.delete("/delete_item/:ItemId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let ItemId = req.params.ItemId;
    let DeleteItem = `DECLARE @QuotationId bigint;
      SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId =  ${ItemId});
      UPDATE privanet.QuotationItem
      SET ItemQty = 0
      WHERE ItemId = ${ItemId};
      UPDATE privanet.Quotation
      SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
        FROM privanet.QuotationItem 
        WHERE QuotationId = @QuotationId)
      WHERE QuotationId = @QuotationId;
      DELETE FROM privanet.QuotationItem WHERE ItemId=${ItemId}`;
    let DeleteSubItem = `DELETE FROM privanet.QuotationSubItem WHERE ItemId = ${ItemId}`;
    await pool.request().query(DeleteSubItem);
    await pool.request().query(DeleteItem);
    res.status(200).send({ message: "Successfully delete Item" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.delete("/delete_subitem/:SubItemId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SubItemId = req.params.SubItemId;
    let DeleteSubItem = `DECLARE @QuotationId bigint, @ItemId bigint;
      SET @ItemId = (SELECT ItemId FROM privanet.QuotationSubItem WHERE SubItemId = ${SubItemId});
      SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId = @ItemId);
      DELETE FROM privanet.QuotationSubItem WHERE SubItemId = ${SubItemId};
      UPDATE privanet.QuotationItem
      SET ItemPrice = (SELECT SUM(SubItemQty * SubItemPrice) 
        FROM privanet.QuotationSubItem 
        WHERE ItemId = @ItemId)
      WHERE ItemId = @ItemId;
      UPDATE privanet.Quotation
      SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
        FROM privanet.QuotationItem 
        WHERE QuotationId = @QuotationId)
      WHERE QuotationId = @QuotationId;`;
    await pool.request().query(DeleteSubItem);
    res.status(200).send({ message: "Successfully delete Sub-item" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/edit_quotation/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    if (!UserId) return res.status(400).send({ message: "Please login" });
    let QuotationId = req.params.QuotationId;
    let { QuotationSubject, QuotationValidityDate } = req.body;
    let { QuotationPayTerm, QuotationDelivery, QuotationDiscount } = req.body;
    let { QuotationRemark, EmployeeApproveId, EndCustomer } = req.body;
    let PayTerm = JSON.stringify(QuotationPayTerm);
    let ValidityDateFilter = QuotationValidityDate.replace(/'/g, "''");
    let PayTermFilter = PayTerm.replace(/'/g, "''");
    let DeliveryFilter = QuotationDelivery.replace(/'/g, "''");
    let RemarkFilter = QuotationRemark.replace(/'/g, "''");
    let EndCustomerFilter = EndCustomer.replace(/'/g, "''");
    if (EmployeeApproveId == "")
      return res.status(400).send({ message: "Please select Approver" });

    // Insert Quotation with QuotationNoId
    let UpdateQuotation = `UPDATE privanet.Quotation
      SET QuotationSubject = N'${QuotationSubject}',
        QuotationDiscount = ${QuotationDiscount || 0},
        QuotationValidityDate = N'${ValidityDateFilter}', 
        QuotationPayTerm = N'${PayTermFilter}',
        QuotationDelivery = N'${DeliveryFilter}',
        QuotationRemark = N'${RemarkFilter}',
        EmployeeApproveId = ${EmployeeApproveId},
        EndCustomer = N'${EndCustomerFilter}',
        EmployeeEditId = ${UserId}
      WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(UpdateQuotation);
    res.status(201).send({ message: "Successfully Edit Quotation" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/edit_detail/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let { QuotationDetail } = req.body;
    console.log(QuotationDetail);
    let Detail = '';
    if (QuotationDetail.blocks.length !== 0) {
      Detail = JSON.stringify(QuotationDetail);
    }
    Detail = Detail.replaceAll("&nbsp;", " ")
      .replaceAll("'", "")
      .replaceAll("amp;", "");
    console.log(Detail);
    let UpdateDetail = `UPDATE privanet.Quotation
      SET QuotationDetail = N'${Detail}'
      WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(UpdateDetail);
    res.status(201).send({ message: "Successfully Edit Quotation Detail" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/edit_setting/:QuotationId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let { TableShow, TablePrice, TableQty, TableTotal } = req.body;
    let UpdateSetting = `UPDATE privanet.QuotationSetting
      SET TableShow = ${TableShow}, TablePrice = ${TablePrice},
        TableQty = ${TableQty},  TableTotal = ${TableTotal}
      WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(UpdateSetting);
    res.status(201).send({ message: "Quotation Setting Updated" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/edit_item/:ItemId", async (req, res) => {
  try {
    let ItemId = req.params.ItemId;
    let { ItemName, ItemPrice, ItemQty } = req.body;
    if (ItemName == "")
      return res.status(400).send({ message: "Please enter Item name" });
    if (ItemPrice === "") ItemPrice = 0;
    if (ItemQty === "") ItemQty = 0;
    let pool = await sql.connect(dbconfig);
    let UpdateQuotationItem = `UPDATE privanet.QuotationItem
      SET ItemName = N'${ItemName}', ItemPrice = ${ItemPrice},
      ItemQty = ${ItemQty}
      WHERE ItemId = ${ItemId}`;
    await pool.request().query(UpdateQuotationItem);
    if (!(ItemPrice === 0 || ItemQty === 0)) PriceQ(ItemId);
    res.status(200).send({ message: "Successfully Edit Item" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/edit_subitem/:SubItemId", async (req, res) => {
  try {
    let SubItemId = req.params.SubItemId;
    console.log(SubItemId)
    let { SubItemName, SubItemPrice, SubItemQty, SubItemUnit } = req.body;
    console.log(req.body);
    if (SubItemName == "")
      return res.status(400).send({ message: "Please enter description" });
    if (SubItemPrice === "") SubItemPrice = 0;
    if (SubItemQty === "") SubItemQty = 0;
    let pool = await sql.connect(dbconfig);
    let UpdateQuotationSubItem = `UPDATE privanet.QuotationSubItem
      SET SubItemName = N'${SubItemName}', SubItemPrice = ${SubItemPrice},
      SubItemQty = ${SubItemQty}, SubItemUnit =N'${SubItemUnit}'
      WHERE SubItemId = ${SubItemId}`;
    await pool.request().query(UpdateQuotationSubItem);
    if (!(SubItemPrice === 0 || SubItemQty === 0)) PriceS(SubItemId);
    res.status(200).send({ message: "Successfully Edit Sub-Item" });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

const detailDefault = {
  time: 1659069460288,
  blocks: [
    {
      id: "cyZjplMOZ0",
      type: "paragraph",
      data: {
        text: "<b>ตัวอย่างการพิมพ์(ไม่ต้องทำอะไรถ้าไม่มี Detail แต่ถ้ามีการแก้ไข ให้ลบตัวอย่าง 2 บรรทัดแรกออกแล้วกด Save)</b>",
      },
    },
    {
      id: "Mj_9XdxLe0",
      type: "paragraph",
      data: {
        text: "1 รายละเอียด; จำนวน หน่วย; ราคา",
      },
    },
  ],
  version: "2.25.0",
};

module.exports = router;
