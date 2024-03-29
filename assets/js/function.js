let tableQuoHead, tableQuo;

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

function AjaxDataJson(url, method, data = {}) {
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
  $('#tableQuoHead .filters th').each(async function (i) {
    var title = $('#tableQuoHead thead th').eq($(this).index()).text();
    disable = title == 'จัดการข้อมูล' ? 'disabled' : '';

    if (title == 'Status') {
      let data = await AjaxDataJson('/dropdown/status');
      data = JSON.parse(data);
      let statusName = data.map((item, Index) => item.StatusName);
      $(this).html(
        `<select class=" table-select select-status column-search">
          <option selected value="">${title}</option>
        </select>`
      );
      for (let i = 0; i < statusName.length; i++) {
        if (statusName[i] == "Invoice") {
          $(
            `<option value="${statusName[i]}">${statusName[i]}</option>
            <option value="${statusName[i]} 20%">${statusName[i]} 20%</option>
            <option value="${statusName[i]} 30%">${statusName[i]} 30%</option>
            <option value="${statusName[i]} 50%">${statusName[i]} 50%</option>
            <option value="${statusName[i]} 70%">${statusName[i]} 70%</option>
            <option value="${statusName[i]} 90%">${statusName[i]} 90%</option>
            <option value="${statusName[i]} 100%">${statusName[i]} 100%</option>`
          ).appendTo(".select-status");
        } else {
          $(
            `<option value="${statusName[i]}">${statusName[i]}</option>`
          ).appendTo(".select-status");
        }
      }
    } else if (title == 'Company') {
      let data = await AjaxDataJson('/company_master/data');
      data = JSON.parse(data);
      let companyNames = data.map((item, Index) => item.CompanyName);

      $(this).html(
        `<div class="search-select ">
          <input class="form-control" id="search_01" type="text" placeholder="${title}" autocomplete="off">
          <ul class="selection select-company"></ul>
         </div>`
      );
      for (let i = 0; i < companyNames.length; i++) {
        $(`<li value="${companyNames[i]}">${companyNames[i]}</li>`).appendTo(
          '.select-company'
        );
      }

      $('.search-select input').on('input', function () {
        let value = $(this).val().toLowerCase();
        // let selection = $(".selection li");
        let selection = $(this).siblings().children();
        let length = selection.length;
        for (let i = 0; i < length; i++) {
          let Text = $(selection[i]).text();
          let checkSearch = Text.toLowerCase().includes(value);
          !checkSearch
            ? $(selection[i]).addClass('d-none')
            : $(selection[i]).removeClass('d-none');
        }
      });
      $('.selection li').unbind();
      $('.selection li').click((e) => {
        let selected = $(e.target).attr('value');
        let currentElement = $(e.target).parent();
        let prevElement = currentElement.prev();
        prevElement.val(selected).trigger('change');
      });
    } else {
      $(this).html(
        `<input class="form-control p-1 column-search " type="text" placeholder="${title}" ${disable}/>`
      );
    }
  });

  $('.search-select input').on('input', function () {
    let value = $(this).val().toLowerCase();
    // let selection = $(".selection li");
    let selection = $(this).siblings().children();
    let length = selection.length;
    for (let i = 0; i < length; i++) {
      let Text = $(selection[i]).text();
      let checkSearch = Text.toLowerCase().startsWith(value);
      !checkSearch
        ? $(selection[i]).addClass('d-none')
        : $(selection[i]).removeClass('d-none');
    }
  });
  $('.selection li').unbind();
  $('.selection li').click((e) => {
    let selected = $(e.target).attr('value');
    let currentElement = $(e.target).parent();
    let prevElement = currentElement.prev();
    prevElement.val(selected).trigger('change');
  });
}
// Fill Table
//Quotation
function fill_quotationHead() {
  searchTableQuoHead();
  tableQuoHead = $('#tableQuoHead').DataTable({
    bDestroy: true,
    scrollX: false,
    scrollY: "40vh",
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
        data: 'index',
      },
      {
        data: 'StatusName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-center align-items-center"><span >${data}</span></div>`;
        },
      },
      {
        data: 'QuotationNo',
      },
      {
        data: 'CompanyName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        data: 'QuotationSubject',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        data: 'CustomerName',
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        data: 'QuotationNet',
        render: function (data, type, row) {
          data = data || 0;
          let [bath, stang] = data.toFixed(2).split('.');
          return `<div class = "d-flex justify-content-end align-items-center"><span class="text-end">${parseInt(
            bath
          ).toLocaleString()}.${stang}</span></div>`;
        },
      },
      {
        data: 'PO',
        render: function (data, type, row) {
          // console.log(data)
          data = data || [];
          let html = '';
          data.forEach((res) => {
            html += `${res.PONo} <br/>`;
          });
          return `<div class = "d-flex justify-content-center align-items-center">
          <span class="text-center">${html || "-"}</span>
          </div>`;
        },
      },
    ],
    initComplete: function () {
      let thisTable = this.api();
      thisTable
        .columns()
        .eq(0)
        .each(function (colIdx) {
          $('input,select', $('.filters th')[colIdx]).on(
            'keyup change clear',
            function (e) {
              if (colIdx == 1) {
                // ใช้ startsWith() ในการค้นหาข้อมูลที่เริ่มต้นด้วยค่าที่กำหนด
                thisTable
                  .column(colIdx)
                  .search('^' + this.value, true, false)
                  .draw();
              } else {
                thisTable.column(colIdx).search(this.value).draw();
              }
            }
          );
        });
    },
  });

  // $(".sidebar-toggle").unbind();
  // $(".sidebar-toggle").click(function () {
  //   console.log("nav click");

  //   tableQuoHead.ajax.reload(null, false);
  //   $(`#tableQuoHead`).DataTable().columns.adjust().draw();
  // });
}
function fill_quotation(QuotationNoId = null) {
  tableQuo = $('#tableQuo').DataTable({
    bDestroy: true,
    scrollX: true,
    pageLength: 5,
    searching: true,
    dom: "rtip",
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
