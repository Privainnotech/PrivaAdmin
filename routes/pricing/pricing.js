const express = require('express');
const router = express.Router();
const { checkNewVendor, checkNewCategory } = require('./pricing.controller');
const { selectDt, insertDt, updateDt, deleteDt } = require('../../libs/crud');

router.get('/', async (req, res) => {
  try {
    const Pricings = await selectDt({
      field: '*',
      table: 'MasterPricing a',
      otherQuery: `
        LEFT JOIN privanet.[MasterVendor] b ON a.VendorId = b.VendorId
        LEFT JOIN privanet.[MasterCategory] c ON a.CategoryId = c.CategoryId`,
    });
    res.status(200).send(JSON.stringify(Pricings));
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.get('/:PricingId', async (req, res) => {
  try {
    const { PricingId } = req.params;
    const Pricing = await selectDt({
      field: '*',
      table: 'MasterPricing',
      whereQuery: `PricingId = ${PricingId}`,
    });
    res.status(200).send(Pricing[0]);
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { Pricing, PricingUrl, Cost, SellingPrice, Vendor, Category } =
      req.body;
    if (!Pricing || !Cost)
      return res.status(400).send({ message: 'Pricing and Cost is required' });
    const VendorId = await checkNewVendor(Vendor);
    const CategoryId = await checkNewCategory(Category);

    const Data = await insertDt({
      field: 'Pricing,PricingUrl,Cost,SellingPrice,VendorId,CategoryId',
      table: 'MasterPricing',
      valueQuery: `(N'${Pricing || ''}',N'${PricingUrl || ''}',${Cost || 0},${
        SellingPrice || 0
      },${VendorId},${CategoryId})`,
    });
    console.log(Data);
    res.status(201).send({ message: 'Successfully add pricing' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.put('/:PricingId', async (req, res) => {
  try {
    const { PricingId } = req.params;
    const { Pricing, PricingUrl, Cost, SellingPrice, Vendor, Category } =
      req.body;
    if (!Pricing || !Cost)
      return res.status(400).send({ message: 'Pricing and Cost is required' });
    const VendorId = await checkNewVendor(Vendor);
    const CategoryId = await checkNewCategory(Category);

    const Data = await updateDt({
      table: 'MasterPricing',
      valueQuery: `Pricing = N'${Pricing || ''}',
        PricingUrl = N'${PricingUrl || ''}',
        Cost = ${Cost || 0},
        SellingPrice = ${SellingPrice || 0},
        VendorId = ${VendorId},
        CategoryId = ${CategoryId}`,
      whereQuery: `PricingId = ${PricingId}`,
    });
    console.log(Data);
    res.status(200).send({ message: 'Successfully update pricing' });
  } catch (err) {
    console.log(err);
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

router.delete('/:PricingId', async (req, res) => {
  try {
    const { PricingId } = req.params;

    const Data = await deleteDt({
      table: 'MasterPricing',
      whereQuery: `PricingId = ${PricingId}`,
    });
    console.log(Data);
    res.status(200).send({ message: 'Successfully delete pricing' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: err.message });
  }
});

module.exports = router;
