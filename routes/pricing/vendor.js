const express = require('express');
const router = express.Router();

const {
  selectDt,
  insertDt,
  updateDt,
  deleteDt,
  checkExists,
} = require('../../libs/crud');

router.get('/', async (req, res) => {
  try {
    const Vendors = await selectDt({
      field: '*',
      table: 'MasterVendor',
    });
    res.status(200).send(JSON.stringify(Vendors));
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.get('/:VendorId', async (req, res) => {
  try {
    const { VendorId } = req.params;
    const Vendor = await selectDt({
      field: '*',
      table: 'MasterVendor',
      whereQuery: `VendorId = ${VendorId}`,
    });
    res.status(200).send(Vendor[0]);
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.post('/', async (req, res) => {
  try {
    const { Vendor, VendorAddress, VendorUrl } = req.body;
    if (!Vendor) return res.status(400).send({ message: 'Vendor is required' });
    const isDup = await checkExists({
      value: Vendor,
      field: 'Vendor',
      table: 'MasterVendor',
    });
    if (isDup) return res.status(400).send({ message: 'Vendor is duplicated' });

    const Data = await insertDt({
      field: 'Vendor, VendorAddress, VendorUrl',
      table: 'MasterVendor',
      valueQuery: `(N'${Vendor}',
        N'${VendorAddress || ''}',
        N'${VendorUrl || ''}')`,
    });
    console.log(Data[0].Id);
    res.status(201).send({ message: `Successfully add Vendor: ${Vendor}` });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.put('/:VendorId', async (req, res) => {
  try {
    const { VendorId } = req.params;
    const { Vendor, VendorAddress, VendorUrl } = req.body;
    if (!Vendor) return res.status(400).send({ message: 'Vendor is required' });

    const Data = await updateDt({
      table: 'MasterVendor',
      valueQuery: `Vendor = N'${Vendor}',
        VendorAddress = N'${VendorAddress || ''}',
        VendorUrl = N'${VendorUrl || ''}'`,
      whereQuery: `VendorId = ${VendorId}`,
    });
    res.status(200).send({ message: 'Successfully update Vendor' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.delete('/:VendorId', async (req, res) => {
  try {
    const { VendorId } = req.params;
    const hasChild = await checkExists({
      value: VendorId,
      field: 'VendorId',
      table: 'MasterPricing',
    });
    if (hasChild)
      return res.status(400).send({ message: 'Have pricing on this Vendor' });

    const Data = await deleteDt({
      table: 'MasterVendor',
      whereQuery: `VendorId = ${VendorId}`,
    });
    res.status(200).send({ message: 'Successfully delete Vendor' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

module.exports = router;
