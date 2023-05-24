function AjaxGetData(url) {
  return new Promise(async (resolve, reject) => {
    $.ajax({
      url: url,
      method: 'get',
      contentType: 'application/json',
      dataType: 'json',
      success: function (res) {
        resolve(res);
      },
      error: function (err) {
        console.log(err);
        let error = err.responseJSON.message;
        Swal.fire({
          icon: 'error',
          title: 'Get Data Error...',
          text: error,
        });
        reject(err);
      },
    });
  });
}

function AjaxDataJson(url, method, data = null) {
  return new Promise(async (resolve, reject) => {
    $.ajax({
      url: url,
      method: method,
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (res) {
        resolve(res);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
}
function SwalSuccess(res, SwalTitle = `Success`) {
  successText = res.message;
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: SwalTitle,
    text: successText,
    showConfirmButton: false,
    timer: 1500,
  });
}
function SwalAddSuccess(res) {
  successText = res.message;
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: 'Created',
    text: successText,
    showConfirmButton: false,
    timer: 1500,
  });
}
function SwalEditSuccess(res) {
  successText = res.message;
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: 'Updated',
    text: successText,
    showConfirmButton: false,
    timer: 1500,
  });
}
function SwalDeleteSuccess(res) {
  successText = res.message;
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: 'Deleted',
    text: successText,
    showConfirmButton: false,
    timer: 1500,
  });
}
function SwalError(err) {
  errorText = err.responseJSON.message;
  Swal.fire({
    position: 'center',
    icon: 'warning',
    title: 'Warning',
    text: errorText,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    confirmButtonColor: '#FF5733',
  });
}

function AjaxPutWithImage(url, fileImg = {}) {
  return new Promise(async (resolve, reject) => {
    $.ajax({
      url: url,
      method: 'put',
      processData: false,
      contentType: false,
      data: JSON.stringify(fileImg),
      success: (res) => {
        resolve(res);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
function AjaxImportFile(url, exFile = {}) {
  return new Promise(async (resolve, reject) => {
    $.ajax({
      url: url,
      method: 'post',
      processData: false,
      contentType: false,
      data: JSON.stringify(exFile),
      beforeSend: function () {
        Swal.fire({
          title: 'Upload',
          text: 'Please wait, uploading file',
          didOpen: () => {
            Swal.showLoading();
          },
        });
      },
      success: (res) => {
        resolve(res);
      },
      error: (err) => {
        reject(err);
      },
      complete: function () {
        Swal.hideLoading();
      },
    });
  });
}
function AjaxDelete(url) {
  return new Promise(async (resolve, reject) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: url,
          method: 'delete',
          contentType: 'application/json',
          success: (res) => {
            resolve(res);
          },
          error: (err) => {
            reject(err);
          },
        });
      }
    });
  });
}
// Search Table Title

//Quotation
function searchTableQuoHead() {
  $('#tableQuoHead thead tr')
    .clone(true)
    .addClass('filters')
    .appendTo('#tableQuoHead thead');
  $('#tableQuoHead .filters th').each(function (i) {
    var title = $('#tableQuoHead thead th').eq($(this).index()).text();
    disable = title == 'จัดการข้อมูล' ? 'disabled' : '';
    $(this).html(
      `<input class="form-control p-1 column-search" type="text" placeholder="${title}" ${disable}/>`
    );
  });
}
// Fill Table
//Quotation
function fill_quotationHead() {
  searchTableQuoHead();
  tableQuoHead = $('#tableQuoHead').DataTable({
    bDestroy: true,
    scrollX: true,
    scrollY: '40vh',
    searching: true,
    ordering: false,
    paging: false,
    autoWidth: false,
    dom: 'rtp',
    ajax: {
      url: '/quotation/quotation_no_list',
      dataSrc: '',
    },
    columns: [
      {
        width: '10px',
        // width: "5%",
        data: 'index',
      },
      {
        // width: "10%",
        data: 'StatusName',
        render: function (data, type, row) {
          // let L_Status = data.toLowerCase();
          // return `<div class = "d-flex justify-content-center align-items-center"><span class="d-block status status-${L_Status}">${data}</span></div>`;
          return `<div class = "d-flex justify-content-center align-items-center"><span >${data}</span></div>`;
        },
      },
      {
        // width: "10%",
        data: 'QuotationNo',
      },
      {
        // width: "25%",
        data: 'CompanyName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        // width: "25%",
        data: 'QuotationSubject',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        // width: "15%",
        data: 'CustomerName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        // width: "10%",
        data: 'QuotationNet',
        render: function (data, type, row) {
          let [bath, stang] = data.toFixed(2).split('.');
          return `<div class = "d-flex justify-content-end align-items-center"><span class="text-end">${parseInt(
            bath
          ).toLocaleString()}.${stang}</span></div>`;
        },
      },
    ],
    initComplete: function () {
      let thisTable = this.api();
      thisTable
        .columns()
        .eq(0)
        .each(function (colIdx) {
          $('input', $('.filters th')[colIdx]).on(
            'keyup change clear',
            function (e) {
              // console.log(colIdx, this.value);
              thisTable.column(colIdx).search(this.value).draw();
            }
          );
        });
    },
  });
}
function fill_quotation(QuotationNoId = null) {
  tableQuo = $('#tableQuo').DataTable({
    bDestroy: true,
    scrollX: true,
    pageLength: 5,
    searching: true,
    dom: 'rtip',
    // "bInfo": false,
    // bLengthChange: false,
    ajax: {
      url: `/quotation/quotation_list/${QuotationNoId}`,
      dataSrc: '',
    },
    order: [[0, 'desc']],
    columns: [
      {
        width: '10%',
        data: 'QuotationRevised',
      },
      {
        width: '25%',
        data: 'StatusName',
        render: function (data, type, row) {
          let status = data.split(' ');
          let L_Status = status[0].toLowerCase();
          return `<div class = "d-flex justify-content-center align-items-center"><span class="d-block status status-${L_Status}">${data}</span></div>`;
        },
      },
      {
        width: '15%',
        data: 'QuotationDate',
        render: function (data, type, row) {
          if (data != null) return data;
          else return (data = '-');
        },
      },
      {
        width: '15%',
        data: 'QuotationUpdatedDate',
        render: function (data, type, row) {
          if (data != null) return data.replaceAll(' ', '<br/>');
          else return (data = '-');
        },
      },
      {
        width: '25%',
        data: 'EmployeeFname',
        render: function (data, type, row) {
          if (data != null) return data;
          else return (data = '-');
        },
      },
      {
        width: '10%',
        data: 'Action',
        render: function (data, type, row) {
          if (row.QuotationStatus === 1) {
            return "<div class='text-center'><div class='btn-group'><button  class='btn btn-danger p-1 m-2' id='btnDelProject' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>";
          } else {
            return "<div class='text-center'><div class='btn-group'><button  class='btn btn-dark p-1 m-2 disabled' id='btnDelProject' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>";
          }
        },
      },
    ],
  });
}
function fill_item(Id, status) {
  tableItem = $('#tableItem').DataTable({
    bDestroy: true,
    scrollY: '28vh',
    scrollX: true,
    scrollCollapse: true,
    searching: false,
    bPaginate: false,
    bInfo: false,
    bLengthChange: false,
    ajax: {
      url: `/quotation/item/` + Id,
      dataSrc: '',
    },
    columns: [
      {
        width: '10%',
        data: 'Item',
      },
      {
        width: '40%',
        data: 'ItemName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start text-wrap">${data}</span></div>`;
        },
      },
      {
        width: '15%',
        data: 'ItemPrice',
        render: function (data, type, row) {
          return data.toLocaleString();
        },
      },
      {
        width: '15%',
        data: 'ItemQty',
      },
      {
        width: '20%',
        data: 'Action',
        render: function () {
          if (status === 1) {
            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditItem' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnSubItem' style='width: 2rem;'><i class='fa fa-plus'></i></button><button type='button' class='btn btn-danger p-1 ' id='btnDelItem' style='width: 2rem;'><i class='fa fa-remove'></i></button></div></div>";
          }
          // disabled
          else {
            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditItem' style='width: 2rem;' disabled><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnSubItem' style='width: 2rem;' disabled onclick='LoadDropDown()'><i class='fa fa-plus'></i></button><button type='button' class='btn btn-danger p-1 ' id='btnDelItem' style='width: 2rem;' disabled><i class='fa fa-remove'></i></button></div></div>";
          }
        },
      },
      {
        data: 'ItemId',
        data: 'QuotationId',
        data: 'QuotationStatus',
      },
    ],
    columnDefs: [
      {
        targets: [5],
        visible: false,
      },
    ],
  });
}
function fill_subitem(Id, status) {
  tableSubItem = $('#tableSubItem').DataTable({
    bDestroy: true,
    scrollY: '28vh',
    scrollX: true,
    scrollCollapse: true,
    searching: false,
    bPaginate: false,
    bInfo: false,
    bLengthChange: false,
    ajax: {
      url: `/quotation/subitem/` + Id,
      dataSrc: '',
    },
    columns: [
      {
        width: '10%',
        data: 'Index',
      },
      {
        width: '40%',
        data: 'SubItemName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start text-wrap">${data}</span></div>`;
        },
      },
      {
        width: '15%',
        data: 'SubItemPrice',
        render: function (data, type, row) {
          return data.toLocaleString();
        },
      },
      {
        width: '15%',
        data: 'SubItemQtyUnit',
      },
      {
        width: '20%',
        data: 'Action',
        render: function () {
          if (status === 1) {
            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditSubItem' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelSubItem'><i class='fa fa-remove'></i></button></div></div>";
          }
          // disabled
          else {
            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditSubItem' style='width: 2rem;' disabled><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelSubItem' disabled><i class='fa fa-remove'></i></button></div></div>";
          }
        },
      },
      {
        data: 'SubItemId',
        data: 'QuotationId',
        data: 'ProductId',
        data: 'ProductType',
      },
    ],
    columnDefs: [
      {
        targets: [5],
        visible: false,
      },
    ],
  });
}
