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
    const Categories = await selectDt({
      field: '*',
      table: 'MasterCategory',
    });
    res.status(200).send(JSON.stringify(Categories));
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.get('/:CategoryId', async (req, res) => {
  try {
    const { CategoryId } = req.params;
    const Category = await selectDt({
      field: '*',
      table: 'MasterCategory',
      whereQuery: `CategoryId = ${CategoryId}`,
    });
    res.status(200).send(Category[0]);
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.post('/', async (req, res) => {
  try {
    const { Category } = req.body;
    if (!Category)
      return res.status(400).send({ message: 'Category is required' });
    const isDup = await checkExists({
      value: Category,
      field: 'Category',
      table: 'MasterCategory',
    });
    if (isDup)
      return res.status(400).send({ message: 'Category is duplicated' });

    const Data = await insertDt({
      field: 'Category',
      table: 'MasterCategory',
      valueQuery: `(N'${Category}')`,
    });
    res.status(201).send({ message: 'Successfully add Category' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.put('/:CategoryId', async (req, res) => {
  try {
    const { CategoryId } = req.params;
    const { Category } = req.body;
    if (!Category)
      return res.status(400).send({ message: 'Category is required' });
    const Data = await updateDt({
      table: 'MasterCategory',
      valueQuery: `Category = N'${Category}'`,
      whereQuery: `CategoryId = ${CategoryId}`,
    });
    res.status(200).send({ message: 'Successfully update Category' });
  } catch (err) {
    console.log(err);
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

router.delete('/:CategoryId', async (req, res) => {
  try {
    const { CategoryId } = req.params;
    const hasChild = await checkExists({
      value: CategoryId,
      field: 'CategoryId',
      table: 'MasterPricing',
    });
    if (hasChild)
      return res.status(400).send({ message: 'Have pricing on this Category' });

    const Data = await deleteDt({
      table: 'MasterCategory',
      whereQuery: `CategoryId = ${CategoryId}`,
    });
    res.status(200).send({ message: 'Successfully delete Category' });
  } catch (err) {
    res.status(err.name == 'Error' ? 400 : 500).send({ message: `${err}` });
  }
});

module.exports = router;
