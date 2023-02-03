function AjaxGetData(url) {
  return new Promise(async (resolve, reject) => {
    $.ajax({
      url: url,
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        resolve(res);
      },
      error: function (err) {
        console.log(err);
        let error = err.responseJSON.message;
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: error,
        });
        reject(err)
      },
    });
  })
  
}
function AjaxGetDownload(url) {
  console.log("upload url : ", url);
  $.ajax({
    url: url,
    method: "get",
    contentType: "application/json",
    dataType: "json",
    success: function (res) {
      window.open(url);
    },
    error: function (err) {
      console.log(err);
      let error = err.responseJSON.message;
      Swal.fire({
        icon: "error",
        title: "Error...",
        text: error,
      });
    },
  });
}
function AjaxPut(url, table, data, modalId = null) {
  $.ajax({
    url: url,
    method: "put",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: (res) => {
      let success = res.message;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Updated",
        text: success,
        showConfirmButton: false,
        timer: 1500,
      });
      if (table != null) table.ajax.reload(null, false);
      if (modalId != null) modalId.modal("hide");
    },
    error: (err) => {
      let error = err.responseJSON.message;
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: error,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    },
  });
}
function AjaxPutWithImage(url, table, modalId, fileImg = JSON.stringify({})) {
  $.ajax({
    url: url,
    method: "put",
    processData: false,
    contentType: false,
    data: fileImg,
    success: (res) => {
      let success = res.message;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Updated",
        text: success,
        showConfirmButton: false,
        timer: 1500,
      });
      table.ajax.reload(null, false);
      modalId.modal("hide");
    },
    error: (err) => {
      let error = err.responseJSON.message;
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: error,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    },
  });
}
function AjaxPutCheckbox(url, table, data = "", swalTitle) {
  $.ajax({
    url: url,
    method: "put",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (succ) {
      successText = succ.message;
      Swal.fire({
        position: "center",
        icon: "success",
        title: swalTitle,
        text: successText,
        showConfirmButton: false,
        timer: 1500,
      });
      table.ajax.reload(null, false);
    },
    error: function (err) {
      table.ajax.reload(null, false);
    },
  });
}
function AjaxPost(url, table1, table2 = null, data, modalId = null) {
  $.ajax({
    url: url,
    method: "post",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: (res) => {
      let successText = res.message;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Created",
        text: successText,
        showConfirmButton: false,
        timer: 1500,
      });
      table1.ajax.reload(null, false);
      if (table2 != null) table2.ajax.reload(null, false);
        
      modalId != null ? modalId.modal("hide") : console.log("no modal");
    },
    error: (err) => {
      let errorText = err.responseJSON.message;
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: errorText,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    },
  });
}
function AjaxPostWithImage(url, table, modalId, fileImg = JSON.stringify({})) {
  $.ajax({
    url: url,
    method: "post",
    processData: false,
    contentType: false,
    data: fileImg,
    success: (res) => {
      let success = res.message;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Created",
        text: success,
        showConfirmButton: false,
        timer: 1500,
      });
      table.ajax.reload(null, false);
      modalId.modal("hide");
    },
    error: (err) => {
      let error = err.responseJSON.message;
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: error,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    },
  });
}
const AjaxImportExcel = (url, table, exFile = {}) => {
  $.ajax({
    url: url,
    method: "post",
    processData: false,
    contentType: false,
    data: JSON.stringify(exFile),
    beforeSend: function () {
      Swal.fire({
        title: "Upload",
        text: "Please wait, uploading file",
        didOpen: () => {
          Swal.showLoading();
        },
      });
    },
    success: (res) => {
      let success = res.message;
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Uploaded",
        text: success,
        showConfirmButton: false,
        timer: 1500,
      });
      table.ajax.reload(null, false);
    },
    error: (err) => {
      let error = err.responseJSON.message;
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: error,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    },
    complete: function () {
      Swal.hideLoading();
    },
  });
};
function AjaxDelete(url, table1, table2 = null) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: url,
        method: "delete",
        contentType: "application/json",
        success: (res) => {
          let success = res.message;
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Deleted",
            text: success,
            showConfirmButton: false,
            timer: 1500,
          });
          table1.ajax.reload(null, false);
          if (table2 != null) table2.ajax.reload(null, false);
        },
        error: (err) => {
          let error = err.responseJSON.message;
          console.log(err);
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: error,
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
        },
      });
    }
  });
}

// Search Table Title
//Quotation
function searchTableQuoHead() {
  $("#tableQuoHead thead tr")
    .clone(true)
    .addClass("filters")
    .appendTo("#tableQuoHead thead");
  $("#tableQuoHead .filters th").each(function (i) {
    var title = $("#tableQuoHead thead th").eq($(this).index()).text();
    disable = title == "จัดการข้อมูล" ? "disabled" : "";
    $(this).html(
      `<input class="form-control p-1" type="text" placeholder="${title}" ${disable}/>`
    );
  });
  tableQuoHead
    .columns()
    .eq(0)
    .each(function (colIdx) {
      $("input", $("#tableQuoHead .filters th")[colIdx]).on(
        "keyup change",
        function () {
          console.log(colIdx, this.value);
          tableQuoHead.column(colIdx).search(this.value).draw();
        }
      );
    });
}

// Fill Table
//Quotation
function fill_quotationHead() {
  tableQuoHead = $("#tableQuoHead").DataTable({
    bDestroy: true,
    // scrollX: true,
    scrollCollapse: true,
    searching: true,
    paging: true,
    pageLength: 5,
    lengthChange: false,
    info: false,
    autoWidth: true,
    dom: "rtp",
    ajax: {
      url: "/quotation/quotation_no_list",
      dataSrc: "",
    },
    columns: [
      {
        width: "10%",
        data: "index",
      },

      {
        data: "QuotationNo",
      },
      {
        data: "CompanyName",
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        data: "QuotationSubject",
        render: function (data, type, row) {
          return `<div class = "d-flex justify-content-start align-items-center"><span class="text-start">${data}</span></div>`;
        },
      },
      {
        data: "CustomerName",
      },
      {
        width: "20%",
        data: "QuotationNet",
        render: function (data,type,row) {
          if(!data) return data = "-"  
        }
      },
    ],
  });
}
function fill_quotation(QuotationNoId = null) {
  tableQuo = $("#tableQuo").DataTable({
    bDestroy: true,
    scrollX: true,
    pageLength: 5,
    searching: true,
    dom: "rtip",
    // "bInfo": false,
    // bLengthChange: false,
    ajax: {
      url: `/quotation/quotation_list/${QuotationNoId}`,
      dataSrc: "",
    },
    columns: [
      {
        width: "5%",
        data: "QuotationRevised",
      },
      {
        width: "10%",
        data: "QuotationDate",
        render: function (data, type, row) {
          if (data != null) return data;
          else return (data = "-");
        },
      },
      {
        width: "10%",
        data: "QuotationUpdatedDate",
      },
      {
        width: "10%",
        data: "StatusName",
        render: function (data, type, row) {
          let L_Status = data.toLowerCase();
          return `<div class = "d-flex justify-content-center align-items-center"><span class="d-block status status-${L_Status}">${data}</span></div>`;
        },
      },
      {
        width: "8%",
        data: "EmployeeFname",
        render: function (data, type, row) {
          if (data != null) return data;
          else return (data = "-");
        },
      },
      {
        width: "5%",
        data: "Action",
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
  tableItem = $("#tableItem").DataTable({
    bDestroy: true,
    scrollY: "28vh",
    scrollX: true,
    scrollCollapse: true,
    searching: false,
    bPaginate: false,
    bInfo: false,
    bLengthChange: false,
    ajax: {
      url: `/quotation/item/` + Id,
      dataSrc: "",
    },
    columns: [
      {
        width: "10%",
        data: "Item",
      },
      {
        width: "40%",
        data: "ItemName",
      },
      {
        width: "15%",
        data: "ItemPrice",
      },
      {
        width: "15%",
        data: "ItemQty",
      },
      {
        width: "20%",
        data: "Action",
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
        data: "ItemId",
        data: "QuotationId",
        data: "QuotationStatus",
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
  tableSubItem = $("#tableSubItem").DataTable({
    bDestroy: true,
    scrollY: "28vh",
    scrollX: true,
    scrollCollapse: true,
    searching: false,
    bPaginate: false,
    bInfo: false,
    bLengthChange: false,
    ajax: {
      url: `/quotation/subitem/` + Id,
      dataSrc: "",
    },
    columns: [
      {
        width: "10%",
        data: "Index",
      },
      {
        width: "40%",
        data: "SubItemName",
      },
      {
        width: "15%",
        data: "SubItemPrice",
      },
      {
        width: "15%",
        data: "SubItemQtyUnit",
      },
      {
        width: "20%",
        data: "Action",
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
        data: "SubItemId",
        data: "QuotationId",
        data: "ProductId",
        data: "ProductType",
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
