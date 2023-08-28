let tablePricing;
const pricingColumn = [
  {
    title: 'Item',
    data: 'Pricing',
    width: '25%',
    className: 'text-left',
    render: (data, type, row) => {
      const url = row.PricingUrl
        ? `<a href="${row.PricingUrl}" target="_blank">
        <i class="fa fa-external-link"></i></a>`
        : '';
      return data + url;
    },
  },
  {
    title: 'Cost',
    data: 'Cost',
    width: '10%',
    render: (data, type, row) => {
      let show = data ? data : '-';
      return show;
    },
  },
  {
    title: 'Selling Price',
    data: 'SellingPrice',
    width: '10%',
    render: (data, type, row) => {
      let show = data ? data : '-';
      return show;
    },
  },
  {
    title: 'Category',
    data: 'Category',
    width: '10%',
  },
  {
    title: 'Seller',
    data: 'Seller',
    width: '25%',
    render: (data, type, row) => {
      const { SellerEmail, SellerTel } = row;
      let show = data ? data : '-';
      let contact =
        SellerEmail || SellerTel
          ? `: ${SellerEmail || ''} ${SellerTel || ''}`
          : '';
      return `${show}${contact}`;
    },
  },
  {
    title: 'Vendor',
    data: 'Vendor',
    width: '10%',
    render: (data, type, row) => {
      const url = row.VendorUrl
        ? `<a href="${row.VendorUrl}" target="_blank">
        <i class="fa fa-external-link"></i></a>`
        : '';
      return data + url;
    },
  },
  {
    title: 'Action',
    width: '10%',
    defaultContent: `<div class='btn-group' role='group'>
        <button type='button' class='btn btn-primary p-1' id='btnEditPricing'>
          <i class='fa fa-pencil-square-o'></i></button>
        <button type='button' class='btn btn-danger p-1' id='btnDelPricing'>
          <i class='fa fa-remove'></i></button>
      </div>`,
  },
];
function fillPricing() {
  tablePricing = $('#tablePricing').DataTable({
    bDestroy: true,
    scrollX: true,
    scrollCollapse: true,
    ajax: {
      url: '/pricing',
      dataSrc: '',
    },
    columns: pricingColumn,
    columnDefs: [
      {
        targets: [5],
        visible: true,
        searchable: false,
      },
    ],
  });
}

async function callPricingAPI(method, { PricingId } = { PricingId: '' }) {
  let data = {
    Pricing: $('#inpPricingName').val() || '',
    PricingUrl: $('#inpPricingUrl').val() || '',
    Cost: $('#inpPricingCost').val() || 0,
    SellingPrice: $('#inpPricingPrice').val() || 0,
    Vendor: {
      VendorId: $('#inpPricingVendor').val(),
      Vendor: $('#inpPricingVendorName').val() || '',
      VendorAddress: $('#inpPricingVendorAddress').val() || '',
      VendorUrl: $('#inpPricingVendorUrl').val() || '',
    },
    Seller: {
      SellerId: $('#inpPricingSeller').val(),
      Seller: $('#inpPricingSellerName').val() || '',
      SellerEmail: $('#inpPricingSellerEmail').val() || '',
      SellerTel: $('#inpPricingSellerTel').val() || '',
    },
    Category: {
      CategoryId: $('#inpPricingCategory').val(),
      Category: $('#inpPricingCategoryName').val() || '',
    },
  };
  try {
    let res = await AjaxDataJson(`/pricing/${PricingId}`, method, data);
    method == 'post' ? SwalAddSuccess(res) : SwalEditSuccess(res);

    tablePricing.ajax.reload(null, false);
    tableVendor.ajax.reload(null, false);
    getCategory();
    getVendor();
    $('#modalPricing').modal('hide');
  } catch (error) {
    SwalError(error);
  }
}

function triggerPricingModal() {
  $('#modalPricing').modal('show');
  $('#formPricing').trigger('reset');

  $('#inpPricingCategory,#inpPricingVendor').unbind();
  $('#inpPricingCategory').on('change', handleCategoryChange);
  $('#inpPricingVendor').on('change', handleVendorChange);
  $('#inpPricingSeller').on('change', handleSellerChange);

  $('#savePricing').unbind();
  $('.close,.no').click(function () {
    $('#modalPricing').modal('hide');
  });
}

$(document).ready(function () {
  //Pricing Table
  fillPricing();

  //Add Pricing
  $('#addPricing').unbind();
  $('#addPricing').click(function () {
    triggerPricingModal();
    $('#categoryGroup').show();
    $('#vendorGroup').show();
    $('#savePricing').click(() => callPricingAPI('post'));
  });

  //Edit Pricing
  $('#tablePricing').unbind();
  $('#tablePricing').on('click', '#btnEditPricing', async function () {
    triggerPricingModal();
    let rows = $(this).closest('tr');
    let {
      PricingId,
      Pricing,
      PricingUrl,
      Cost,
      SellingPrice,
      VendorId,
      Vendor,
      VendorAddress,
      VendorUrl,
      SellerId,
      Seller,
      SellerEmail,
      SellerTel,
      CategoryId,
      Category,
    } = tablePricing.row(rows).data();

    if (CategoryId) $('#categoryGroup').hide();
    else $('#categoryGroup').show();
    if (VendorId) {
      await getSeller(VendorId);
      $('#vendorGroup').hide();
    } else $('#vendorGroup').show();

    if (SellerId) $('#sellerGroup').hide();
    else $('#sellerGroup').show();
    $('#inpPricingName').val(Pricing);
    $('#inpPricingUrl').val(PricingUrl);
    $('#inpPricingCost').val(Cost);
    $('#inpPricingPrice').val(SellingPrice);
    $('#inpPricingVendor').val(VendorId);
    $('#inpPricingVendorName').val(Vendor);
    $('#inpPricingVendorAddress').val(VendorAddress);
    $('#inpPricingVendorUrl').val(VendorUrl);
    $('#inpPricingSeller').val(SellerId);
    $('#inpPricingSellerName').val(Seller);
    $('#inpPricingSellerEmail').val(SellerEmail);
    $('#inpPricingSellerTel').val(SellerTel);
    $('#inpPricingCategory').val(CategoryId);
    $('#inpPricingCategoryName').val(Category);

    $('#savePricing').click(() => callPricingAPI('put', { PricingId }));
  });

  //Delete Pricing
  $('#tablePricing').on('click', '#btnDelPricing', async function () {
    let rows = $(this).closest('tr');
    let { PricingId } = tablePricing.row(rows).data();
    try {
      let res = await AjaxDelete(`/pricing/${PricingId}`);
      SwalDeleteSuccess(res);
      tablePricing.ajax.reload(null, false);
    } catch (error) {
      SwalError(error);
    }
  });
});
