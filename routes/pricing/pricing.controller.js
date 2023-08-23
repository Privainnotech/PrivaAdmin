const { insertDt, checkExists } = require('../../libs/crud');

const checkNewVendor = async (Vendors) => {
  let { VendorId } = Vendors;
  console.log(`VendorId ${VendorId}`);
  if (VendorId) return VendorId;
  const { Vendor, VendorAddress, VendorUrl } = Vendors;
  if (!Vendor) throw new Error('Vendor is required');
  const isDup = await checkExists({
    value: Vendor,
    field: 'Vendor',
    table: 'MasterVendor',
  });
  if (isDup) throw new Error('Vendor is duplicated');

  const Data = await insertDt({
    field: 'Vendor, VendorAddress, VendorUrl',
    table: 'MasterVendor',
    valueQuery: `(N'${Vendor}',
      N'${VendorAddress || ''}',
      N'${VendorUrl || ''}')`,
  });
  console.log(`New VendorId ${Data[0].Id}`);
  return Data[0].Id;
};

const checkNewCategory = async (Categories) => {
  let { CategoryId } = Categories;
  console.log(`CategoryId ${CategoryId}`);
  if (CategoryId) return CategoryId;
  const { Category } = Categories;
  if (!Category) throw new Error('Category is required');
  const isDup = await checkExists({
    value: Category,
    field: 'Category',
    table: 'MasterCategory',
  });
  if (isDup) throw new Error('Category is duplicated');

  const Data = await insertDt({
    field: 'Category',
    table: 'MasterCategory',
    valueQuery: `(N'${Category}')`,
  });
  console.log(`New CategoryId ${Data[0].Id}`);
  return Data[0].Id;
};

module.exports = { checkNewVendor, checkNewCategory };
