const express = require('express');
const router = express.Router();

const { selectDt, insertDt, updateDt, deleteDt } = require('../../libs/crud');

router.get('/', async (req, res) => {
  try {
    const POs = await selectDt({ field: '*', table: 'QuotationPO' });
    res.status(200).send(JSON.stringify(POs));
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.get('/:POId', async (req, res) => {
  try {
    const { POId } = req.params;
    const PO = await selectDt({
      field: '*',
      table: 'QuotationPO',
      whereQuery: `POId = ${POId}`,
    });
    res.status(200).send(PO[0]);
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { QuotationId, PONo, PODate } = req.body;
    if (!QuotationId || !PONo || !PODate)
      return res
        .status(400)
        .send({ message: 'Quatation, PO No and Date is required' });

    const Data = await insertDt({
      field: 'QuotationId,PONo,PODate',
      table: 'QuotationPO',
      valueQuery: `(${QuotationId},N'${PONo}',N'${PODate}')`,
    });
    console.log(Data);
    res.status(201).send({ message: 'Successfully add PO' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.put('/:POId', async (req, res) => {
  try {
    const { POId } = req.params;
    const { QuotationId, PONo, PODate } = req.body;
    if (!QuotationId || !PONo || !PODate)
      return res
        .status(400)
        .send({ message: 'Quatation, PO No and Date is required' });

    const Data = await updateDt({
      table: 'QuotationPO',
      valueQuery: `QuotationId = ${QuotationId}, PONo = N'${PONo}, PODate = N'${PODate}'`,
      whereQuery: `POId = ${POId}`,
    });
    console.log(Data);
    res.status(200).send({ message: 'Successfully update PO' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.delete('/:POId', async (req, res) => {
  try {
    const { POId } = req.params;

    const Data = await deleteDt({
      table: 'QuotationPO',
      whereQuery: `POId = ${POId}`,
    });
    console.log(Data);
    res.status(200).send({ message: 'Successfully delete PO' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

module.exports = router;
