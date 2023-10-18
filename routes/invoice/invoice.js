const express = require('express');
const router = express.Router();

const { selectDt, insertDt, updateDt, deleteDt } = require('../../libs/crud');

router.get('/', async (req, res) => {
  try {
    const Invoices = await selectDt({ field: '*', table: 'QuotationInvoice' });
    res.status(200).send(JSON.stringify(Invoices));
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.get('/:InvoiceId', async (req, res) => {
  try {
    const { InvoiceId } = req.params;
    const Invoice = await selectDt({
      field: '*',
      table: 'QuotationInvoice',
      whereQuery: `InvoiceId = ${InvoiceId}`,
    });
    res.status(200).send(Invoice[0]);
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { QuotationId, InvoiceNo, InvoiceDate } = req.body;
    if (!QuotationId || !InvoiceNo || !InvoiceDate)
      return res
        .status(400)
        .send({ message: 'Quatation, Invoice No and Date is required' });

    const Data = await insertDt({
      field: 'QuotationId,InvoiceNo,InvoiceDate',
      table: 'QuotationInvoice',
      valueQuery: `(${QuotationId},N'${InvoiceNo}',N'${InvoiceDate}')`,
    });
    console.log(Data);
    res.status(201).send({ message: 'Successfully add Invoice' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.put('/:InvoiceId', async (req, res) => {
  try {
    const { InvoiceId } = req.params;
    const { QuotationId, InvoiceNo, InvoiceDate } = req.body;
    if (!QuotationId || !InvoiceNo || !InvoiceDate)
      return res
        .status(400)
        .send({ message: 'Quatation, Invoice No and Date is required' });

    const Data = await updateDt({
      table: 'QuotationInvoice',
      valueQuery: `QuotationId = ${QuotationId}, InvoiceNo = N'${InvoiceNo}, InvoiceDate = N'${InvoiceDate}'`,
      whereQuery: `InvoiceId = ${InvoiceId}`,
    });
    console.log(Data);
    res.status(200).send({ message: 'Successfully update Invoice' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.delete('/:InvoiceId', async (req, res) => {
  try {
    const { InvoiceId } = req.params;

    const Data = await deleteDt({
      table: 'QuotationInvoice',
      whereQuery: `InvoiceId = ${InvoiceId}`,
    });
    console.log(Data);
    res.status(200).send({ message: 'Successfully delete Invoice' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

module.exports = router;
