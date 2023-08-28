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
      field: `VendorId,Vendor,VendorAddress,VendorUrl`,
      table: 'MasterVendor',
    });
    for (let vendor of Vendors) {
      const Seller = await selectDt({
        field: `Seller`,
        table: 'MasterSeller',
        whereQuery: `VendorId = ${vendor.VendorId}`,
      });
      vendor.Seller = Seller;
    }
    res.status(200).send(JSON.stringify(Vendors));
  } catch (err) {
    console.log(err);
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

router.get('/:VendorId/seller', async (req, res) => {
  try {
    const { VendorId } = req.params;
    const Sellers = await selectDt({
      field: '*',
      table: 'MasterSeller',
      whereQuery: `VendorId = ${VendorId}`,
    });
    res.status(200).send(JSON.stringify(Sellers));
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.post('/:VendorId/seller', async (req, res) => {
  try {
    const { VendorId } = req.params;
    const { Seller, SellerEmail, SellerTel } = req.body;
    if (!Seller) return res.status(400).send({ message: 'Seller is required' });

    const Data = await insertDt({
      field: 'Seller, SellerEmail, SellerTel,VendorId',
      table: 'MasterSeller',
      valueQuery: `(N'${Seller}',
        N'${SellerEmail || ''}',
        N'${SellerTel || ''}',
        ${VendorId})`,
    });
    console.log(Data[0].Id);
    res.status(201).send({ message: `Successfully add Seller: ${Seller}` });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.put('/seller/:SellerId', async (req, res) => {
  try {
    const { SellerId } = req.params;
    const { Seller, SellerEmail, SellerTel } = req.body;
    if (!Seller) return res.status(400).send({ message: 'Seller is required' });

    const Data = await updateDt({
      table: 'MasterSeller',
      valueQuery: `Seller = N'${Seller}',
        SellerEmail = N'${SellerEmail || ''}',
        SellerTel = N'${SellerTel || ''}'`,
      whereQuery: `SellerId = ${SellerId}`,
    });
    res.status(200).send({ message: 'Successfully update Sellor' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.delete('/seller/:SellerId', async (req, res) => {
  try {
    const { SellerId } = req.params;
    const hasChild = await checkExists({
      value: SellerId,
      field: 'SellerId',
      table: 'MasterPricing',
    });
    if (hasChild)
      return res.status(400).send({ message: 'Have pricing on this Seller' });

    const Data = await deleteDt({
      table: 'MasterSeller',
      whereQuery: `SellerId = ${SellerId}`,
    });
    res.status(200).send({ message: 'Successfully delete Seller' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

module.exports = router;
