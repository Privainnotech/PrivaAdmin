let tableSeller;

const appendSellerDropdown = (SellerId, Seller) => {
  $('#inpPricingSeller').append(
    `<option value="${SellerId}">${Seller}</option>`
  );
};

async function getSeller(VendorId = null) {
  $('#inpPricingSeller').html('<option value="" selected>New Seller</option>');
  if (!VendorId) return;
  const res = await AjaxGetData(`/pricing_vendor/${VendorId}/seller`);
  res.forEach((vendor) => {
    const { SellerId, Seller } = vendor;
    appendSellerDropdown(SellerId, Seller);
  });
}

const sellerColumn = [
  {
    title: 'Seller',
    data: 'Seller',
    width: '50%',
  },
  {
    title: 'Email',
    data: 'SellerEmail',
    width: '30%',
    render: (data, type, row) => {
      let show = data ? data : '-';
      return show;
    },
  },
  {
    title: 'Tel',
    data: 'SellerTel',
    width: '20%',
    render: (data, type, row) => {
      let show = data ? data : '-';
      return show;
    },
  },
];

function fillSeller(VendorId) {
  tableSeller = $(`#tableSeller`).DataTable({
    bDestroy: true,
    scrollY: 400,
    scrollCollapse: true,
    paging: false,
    searching: false,
    ajax: {
      url: `/pricing_vendor/${VendorId}/seller`,
      dataSrc: '',
    },
    columns: sellerColumn,
  });

  //Select Seller
  $('#tableSeller').unbind();
  $('#tableSeller').on('click', 'tr', function () {
    let rows = $(this).closest('tr');
    if (rows.hasClass('selected')) {
      rows.removeClass('selected');
      $('#inpSellerName').val('');
      $('#inpSellerEmail').val('');
      $('#inpSellerTel').val('');
      bindSellerAdd(VendorId);
      return;
    }
    $('#tableSeller tr').removeClass('selected');
    if (!tableSeller.row(rows).data()) return;
    rows.addClass('selected');
    let { SellerId, Seller, SellerEmail, SellerTel } = tableSeller
      .row(rows)
      .data();

    $('#inpSellerName').val(Seller);
    $('#inpSellerEmail').val(SellerEmail);
    $('#inpSellerTel').val(SellerTel);

    bindSellerEdit(SellerId);
  });
}

function handleSellerChange() {
  if ($('#inpPricingSeller').val()) return $('#sellerGroup').hide();
  $('#inpPricingSellerName').val('');
  $('#inpPricingSellerEmail').val('');
  $('#inpPricingSellerTell').val('');
  $('#sellerGroup').show();
}

async function callSellerAPI(method, { SellerId } = { SellerId: '' }) {
  let data = {
    Seller: $('#inpSellerName').val() || '',
    SellerAddress: $('#inpSellerAddress').val() || '',
    SellerUrl: $('#inpSellerUrl').val() || '',
  };

  try {
    let res = await AjaxDataJson(`/pricing_vendor/${SellerId}`, method, data);
    method == 'post' ? SwalAddSuccess(res) : SwalEditSuccess(res);

    tableSeller.ajax.reload(null, false);
    tablePricing.ajax.reload(null, false);
    getSeller();
    $('#modalSeller').modal('hide');
  } catch (error) {
    SwalError(error);
  }
}

async function bindSellerAdd(VendorId) {
  $('#delSeller').hide();
  //Add Seller
  $('#saveSeller').unbind();
  $('#saveSeller').click(async function (e) {
    console.log('add seller');
    let data = {
      Seller: $('#inpSellerName').val(),
      SellerEmail: $('#inpSellerEmail').val(),
      SellerTel: $('#inpSellerTel').val(),
    };

    try {
      let res = await AjaxDataJson(
        `/pricing_vendor/${VendorId}/seller`,
        'post',
        data
      );
      SwalAddSuccess(res);
      tableSeller.ajax.reload(null, false);
      $('#inpSellerName').val('');
      $('#inpSellerEmail').val('');
      $('#inpSellerTel').val('');
    } catch (err) {
      SwalError(err);
    }
  });
}
async function bindSellerEdit(SellerId) {
  $('#delSeller').show();
  //Edit Seller
  $('#saveSeller').unbind();
  $('#saveSeller').click(async function (e) {
    let data = {
      Seller: $('#inpSellerName').val(),
      SellerEmail: $('#inpSellerEmail').val(),
      SellerTel: $('#inpSellerTel').val(),
    };

    try {
      let res = await AjaxDataJson(
        `/pricing_vendor/seller/${SellerId}`,
        'put',
        data
      );
      SwalEditSuccess(res);
      tableSeller.ajax.reload(null, false);
      $('#inpSellerName').val('');
      $('#inpSellerEmail').val('');
      $('#inpSellerTel').val('');
    } catch (err) {
      SwalError(err);
    }
  });

  //Delete Seller
  $('#delSeller').unbind();
  $('#delSeller').click(async function (e) {
    try {
      let res = await AjaxDelete(`/pricing_vendor/seller/${SellerId}`);
      SwalDeleteSuccess(res);
      tableSeller.ajax.reload(null, false);
    } catch (error) {
      SwalError(error);
    }
  });
}
