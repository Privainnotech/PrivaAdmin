let tableVendor;

const appendVendorDropdown = (VendorId, Vendor) => {
  $('#inpPricingVendor').append(
    `<option value="${VendorId}">${Vendor}</option>`
  );
};

async function getVendor() {
  $('#inpPricingVendor').html('<option value="" selected>New Vendor</option>');
  const res = await AjaxGetData(`/pricing_vendor`);
  res.forEach((vendor) => {
    const { VendorId, Vendor } = vendor;
    appendVendorDropdown(VendorId, Vendor);
  });
}

const vendorColumn = [
  {
    title: 'Vendor',
    data: 'Vendor',
    width: '20%',
    className: 'text-left',
    render: (data, type, row) => {
      const url = row.VendorUrl
        ? `<a href="${row.VendorUrl}" target="_blank">
        <i class="fa fa-external-link"></i></a>`
        : '';
      return data + url;
    },
  },
  {
    title: 'Address',
    data: 'VendorAddress',
    width: '40%',
    className: 'text-left',
    render: (data, type, row) => {
      let show = data ? data : '-';
      return show;
    },
  },
  {
    title: 'Seller',
    width: '30%',
    render: (data, type, row) => {
      let sell = '';
      if (!row.Seller) return '-';
      row.Seller.forEach((seller) => (sell += `<div>${seller.Seller}</div>`));
      return sell || '-';
    },
  },
  {
    title: 'Action',
    width: '10%',
    defaultContent: `<div class='btn-group' role='group'>
        <button type='button' class='btn btn-primary p-1' id='btnEditVendor'>
          <i class='fa fa-pencil-square-o'></i></button>
        <button type='button' class='btn btn-danger p-1' id='btnDelVendor'>
          <i class='fa fa-remove'></i></button>
      </div>`,
  },
];

function fillVendor() {
  tableVendor = $('#tableVendor').DataTable({
    bDestroy: true,
    scrollX: true,
    scrollCollapse: true,
    ajax: {
      url: '/pricing_vendor',
      dataSrc: '',
    },
    columns: vendorColumn,
    columnDefs: [
      {
        targets: [2],
        visible: true,
        searchable: false,
      },
    ],
  });
}

function handleVendorChange() {
  if ($('#inpPricingVendor').val()) {
    getSeller($('#inpPricingVendor').val());
    return $('#vendorGroup').hide();
  }
  $('#inpPricingVendorName').val('');
  $('#inpPricingVendorAddress').val('');
  $('#inpPricingVendorUrl').val('');
  $('#inpPricingSeller').val('');
  getSeller();
  $('#vendorGroup').show();
  $('#sellerGroup').show();
}

async function callVendorAPI(method, { VendorId } = { VendorId: '' }) {
  let data = {
    Vendor: $('#inpVendorName').val() || '',
    VendorAddress: $('#inpVendorAddress').val() || '',
    VendorUrl: $('#inpVendorUrl').val() || '',
  };

  try {
    let res = await AjaxDataJson(`/pricing_vendor/${VendorId}`, method, data);
    method == 'post' ? SwalAddSuccess(res) : SwalEditSuccess(res);

    tableVendor.ajax.reload(null, false);
    tablePricing.ajax.reload(null, false);
    getVendor();
    $('#modalVendor').modal('hide');
  } catch (error) {
    SwalError(error);
  }
}

$(document).ready(function () {
  fillVendor();
  getVendor();

  //Add Vendor
  $('#addVendor').unbind();
  $('#addVendor').click(function () {
    $('#modalVendor').modal('show');
    $('#vendorSellerGroup').hide();

    $('#formVendor').trigger('reset');
    $('#saveVendor').unbind();
    $('#saveVendor').click(() => callVendorAPI('post'));
    $('.close,.no').click(function () {
      $('#modalVendor').modal('hide');
    });
  });

  //Edit Vendor
  $('#tableVendor').unbind();
  $('#tableVendor').on('click', '#btnEditVendor', function () {
    $('#modalVendor').modal('show');
    $('#vendorSellerGroup').show();

    $('#formVendor').trigger('reset');
    let rows = $(this).closest('tr');
    let { VendorId, Vendor, VendorAddress, VendorUrl } = tableVendor
      .row(rows)
      .data();
    fillSeller(VendorId);
    bindSellerAdd(VendorId);

    $('#inpVendorName').val(Vendor);
    $('#inpVendorAddress').val(VendorAddress);
    $('#inpVendorUrl').val(VendorUrl);

    $('#saveVendor').unbind();
    $('#saveVendor').click(() => callVendorAPI('put', { VendorId: VendorId }));
    $('.close,.no').click(function () {
      $('#modalVendor').modal('hide');
    });
  });

  //Delete Vendor
  $('#tableVendor').on('click', '#btnDelVendor', async function () {
    let rows = $(this).closest('tr');
    let { VendorId } = tableVendor.row(rows).data();
    try {
      let res = await AjaxDelete(`/pricing_vendor/${VendorId}`);
      SwalDeleteSuccess(res);
      tableVendor.ajax.reload(null, false);
      getVendor();
    } catch (error) {
      SwalError(error);
    }
  });
});
