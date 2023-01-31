function AjaxGetDownload(url) {
  console.log('upload url : ', url)
  $.ajax({
    url: url,
    method: "get",
    contentType: "application/json",
    dataType: "json",
    success: function (res) {
      window.open(url);
    },
    error: function (err) {
      console.log(err)
      let error = err.responseJSON.message;
      Swal.fire({
        icon: 'error',
        title: 'Error...',
        text: error,
      })
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
      table.ajax.reload(null, false);
      modalId != null ? modalId.modal("hide") : console.log("no modal");
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
function AjaxPutCheckbox(url, table, data = '', swalTitle) {
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
function AjaxPost(url, table, data, modalId = null) {
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
      table.ajax.reload(null, false);
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
}
function AjaxDelete(url, table, method = "delete") {
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
        method: method,
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
          table.ajax.reload(null, false);
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
function getFilter(ReportFilter) {
  let Filter;
  Filter = {
    FromDate: $(`#ReportDateFrom_${ReportFilter}`).val(),
    ToDate: $(`#ReportDateTo_${ReportFilter}`).val(),
    FromTime: $(`#ReportTimeFrom_${ReportFilter}`).val(),
    ToTime: $(`#ReportTimeTo_${ReportFilter}`).val(),
  };
  return Filter;
}

// Search Table Title
function searchtbDailyReport() {
  $("#DailyReportTable thead tr")
    .clone(true)
    .addClass("filters")
    .appendTo("#DailyReportTable thead");
  $("#DailyReportTable .filters th").each(function (i) {
    var title = $("#DailyReportTable thead th").eq($(this).index()).text();
    disable = title == 'จัดการข้อมูล' ? 'disabled' : ''
    $(this).html(
      `<input class="form-control p-1" type="text" placeholder="${title}" ${disable}/>`
    );
  });
  tbDailyReport
    .columns()
    .eq(0)
    .each(function (colIdx) {
      $("input", $("#DailyReportTable .filters th")[colIdx]).on(
        "keyup change",
        function () {
          console.log(colIdx, this.value);
          tbDailyReport.column(colIdx).search(this.value).draw();
        }
      );
    });
}
function searchtbSaTable() {
  $("#SaTable thead tr")
    .clone(true)
    .addClass("filters")
    .appendTo("#SaTable thead");
  $("#SaTable .filters th").each(function (i) {
    var title = $("#SaTable thead th").eq($(this).index()).text();
    disable = title == 'จัดการข้อมูล' ? 'disabled' : ''
    $(this).html(
      `<input class="form-control p-1" type="text" placeholder="${title}" ${disable}/>`
    );
  });
  tbSaTable
    .columns()
    .eq(0)
    .each(function (colIdx) {
      $("input", $("#SaTable .filters th")[colIdx]).on(
        "keyup change",
        function () {
          console.log(colIdx, this.value);
          tbSaTable.column(colIdx).search(this.value).draw();
        }
      );
    });
}
function searchtbPoReport() {
  $("#PoReportTable thead tr")
    .clone(true)
    .addClass("filters")
    .appendTo("#PoReportTable thead");
  $("#PoReportTable .filters th").each(function (i) {
    var title = $("#PoReportTable thead th").eq($(this).index()).text();
    disable = title == 'จัดการข้อมูล' ? 'disabled' : ''
    $(this).html(
      `<input class="form-control p-1" type="text" placeholder="${title}" ${disable}/>`
    );
  });
  tbPoReport
    .columns()
    .eq(0)
    .each(function (colIdx) {
      $("input", $("#PoReportTable .filters th")[colIdx]).on(
        "keyup change",
        function () {
          console.log(colIdx, this.value);
          tbPoReport.column(colIdx).search(this.value).draw();
        }
      );
    });
}
function searchtbUser() {
  $("#tbUser thead tr")
    .clone(true)
    .addClass("filters")
    .appendTo("#tbUser thead");
  $("#tbUser .filters th").each(function (i) {
    var title = $("#tbUser thead th").eq($(this).index()).text();
    disable = title == 'action' || title == 'QA CHECK' ? 'disabled' : ''
    $(this).html(
      `<input class="form-control p-1" type="text" placeholder="${title}" ${disable}/>`
    );
  });
  tbUser
    .columns()
    .eq(0)
    .each(function (colIdx) {
      $("input", $("#tbUser .filters th")[colIdx]).on(
        "keyup change",
        function () {
          console.log(colIdx, this.value);
          tbUser.column(colIdx).search(this.value).draw();
        }
      );
    });
}
function searchtbDmUser() {
  $("#tbDmUser thead tr")
    .clone(true)
    .addClass("filters")
    .appendTo("#tbDmUser thead");
  $("#tbDmUser .filters th").each(function (i) {
    var title = $("#tbDmUser thead th").eq($(this).index()).text();
    disable = title == 'action' || title == 'AlternateCheck' || title == 'AlternateApprove' ? 'disabled' : ''
    $(this).html(
      `<input class="form-control p-1" type="text" placeholder="${title}" ${disable}/>`
    );
  });
  tbDmUser
    .columns()
    .eq(0)
    .each(function (colIdx) {
      $("input", $("#tbDmUser .filters th")[colIdx]).on(
        "keyup change",
        function () {
          console.log(colIdx, this.value);
          tbDmUser.column(colIdx).search(this.value).draw();
        }
      );
    });
}



// Fill Table
function filltbDailyReport(Filter) {
  tbDailyReport = $("#DailyReportTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    searching: true,
    paging: true,
    lengthChange: false,
    info: false,
    autoWidth: false,
    dom: "rtp",
    ajax: {
      url: `/report/daily/${JSON.stringify(Filter)}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "SlipNo", // เลขที่ใบแจ้ง
      },
      {
        data: "RequestUser", // ชื่อผู้แจ้ง
      },
      {
        data: "RepairUser", // ผู้ซ่อม
      },
      {
        data: "InjShot", // จำนวน Shot
      },
      {
        data: "OrderTypeText", // ประเภทงาน
      },
      {
        data: "PartName", // ชื่อชิ้นงาน
      },
      {
        data: "MoldName", // ชื่อแม่พิมพ์
      },
      {
        data: "Section", // ส่วนงาน
      },
      {
        data: "ProblemSource", // ที่มาของปัญหา
      },
      {
        data: "ProblemNo", // ประเภทของปัญหา
      },
      {
        data: "RequestTime", // วัน/เวลา แจ้ง
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "Problem", // อาการ
      },
      {
        data: "Cause", // สาเหตุ
      },
      {
        data: "FixDetail", // การแก้ไข
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "DmApproveTime", // วัน/เวลา เสร็จสิ้น
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "TryDate", // วัน/เวลา injection
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        width: "20%",
        defaultContent:
          '<div class="btn-group btn-group-sm" role="group"><button class="btn btn-warning" id="editDailyReportBtn" type="button"><i class="fa fa-pencil-square-o m-1"></i>แก้ไข</button></div>',
      },
    ],
  });

}
function filltbMonthlyMoldProb(Month) {
  tbMonthlyProb = $("#MonthlyProblemTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    scrollx: true,
    searching: false,
    paging: true,
    lengthChange: false,
    info: false,
    autoWidth: false,
    ajax: {
      url: `/report/monthly/mold_problem/${Month}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "ProblemNo", // ลำดับ
      },
      {
        data: "Problem", // ปัญหาแม่พิมพ์ Dc/Po
      },
      {
        data: "ProblemCount", // จำนวน
      },
      {
        data: "ProblemPercent", // %
      },
    ],
  });

  tbMonthlyTopProb = $("#MonthlyMoldProblemTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    scrollx: true,
    searching: false,
    paging: true,
    lengthChange: false,
    info: false,
    autoWidth: false,
    ajax: {
      url: `/report/monthly/top_mold_problem/${Month}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "ProblemNo", // ลำดับ
      },
      {
        data: "MoldName", // ชื่อแม่พิมพ์
      },
      {
        data: "RequestTime", // วันที่
      },
      {
        data: "Problem", // อาการ
      },
      {
        data: "MoldCount", // จำนวนครั้ง
      },
    ],
  });
  tbMonthlyFix = $("#MonthlyFixTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    scrollx: true,
    searching: false,
    paging: false,
    lengthChange: false,
    info: false,
    autoWidth: false,
    ajax: {
      url: `/report/monthly/mold_countermeasure/${Month}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "IndexMold", // ลำดับ
      },
      {
        data: "MoldName", // ชื่อแม่พิมพ์
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "RepairDateShow", // วันที่
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "Cause", // สาเหตุ
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "FixDetail", // มาตรการแก้ไข
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "ResponsibleUser", // ผู้รับผิดชอบ	
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        width: "20%",
        defaultContent:
          '<div class="btn-group btn-group-sm" role="group"><button class="btn btn-warning" id="editMonthlyFixBtn" type="button"><i class="fa fa-pencil-square-o m-1"></i>แก้ไข</button></div>',
      },
    ],
  });
  tbMonthlyPre = $("#MonthlyPrepareTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    scrollx: true,
    searching: false,
    paging: true,
    lengthChange: false,
    info: false,
    autoWidth: false,
    ajax: {
      url: `/report/monthly/mold_prepare/${Month}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "ProblemNo", // ลำดับ
      },
      {
        data: "Problem", // เตรียมการแม่พิมพ์ Dc/Po
      },
      {
        data: "ProblemCount", // จำนวนครั้ง
      },
      {
        data: "ProblemPercent", // %
      },
    ],
  });
}
function filltbSaTable(Filter) {
  tbSaTable = $("#SaTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    searching: true,
    paging: true,
    lengthChange: false,
    info: false,
    autoWidth: false,
    dom: "rtp",
    ajax: {
      url: `/report/repair/${JSON.stringify(Filter)}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "SlipNo", // เลขที่ใบแจ้ง
      },
      {
        data: "InjShot", // จำนวน shot
      },
      {
        data: "OrderTypeText", // ประเภทงาน
      },
      {
        data: "PartName", // ชื่อชิ้นงาน
      },
      {
        data: "PartNo", // หมายเลขชิ้นงาน
      },
      {
        data: "MoldName", // ชื่อแม่พิมพ์
      },
      {
        data: "McName", // ชื่อเครื่องจักร
      },
      {
        data: "Section", // ส่วนงาน
      },
      {
        data: "ProblemSource", // ที่มาของปัญหา
      },
      {
        data: "ProblemNo", // ประเภทของปัญหา
      },
      {
        data: "Problem", // อาการ
      },
      {
        data: "Cause", // สาเหตุ
      },
      {
        data: "FixDetail", // การแก้ไข
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "QaResult", // ผลการทดลองผลิต
      },
      {
        data: "TryDate", // วัน/เวลา Injection
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "RequestTime", // วัน/เวลาแจ้ง
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "RequestUser", // ชื่อผู้แจ้ง
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "ReceiveTime", // วัน/เวลา รับงาน
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "ReceiveUser", // ชื่อผู้รับงาน
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "RepairStart", // วัน/เวลา เริ่มทำงาน
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "RepairUser", // ชื่อผู้ทำงาน
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "DmCheckTime", // วัน/เวลา ตรวจสอบ
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "DmCheckUser", // ชื่อผู้ตรวจสอบ
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "DmApproveTime", // วัน/เวลา อนุมัติ
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "DmApproveUser", // ชื่อผู้อนุมัติ
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        data: "DmApproveTime", // วัน/เวลา แก้ไขเสร็จสิ้น
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "RepairFinishTime", // วัน/เวลา จบงาน
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "RepairTime", // เวลาที่ใช้
      },
      {
        data: "QaUser", // ชื่อQAผู้ตรวจสอบ
        render: function (data, type, row) {
          if (data) return data;
          else return "-";
        },
      },
      {
        width: "20%",
        defaultContent:
          '<div class="btn-group btn-group-sm" role="group"><button class="btn btn-warning" id="editSaTableBtn" type="button"><i class="fa fa-pencil-square-o m-1"></i>แก้ไข</button></div>',
      },
    ],
  });
}

function filltbPoReport(Filter) {
  tbPoReport = $("#PoReportTable").DataTable({
    bDestroy: true,
    scrollCollapse: true,
    searching: true,
    paging: true,
    lengthChange: false,
    info: false,
    autoWidth: false,
    dom: "rtp",
    ajax: {
      url: `/report/po/${JSON.stringify(Filter)}`,
      dataSrc: "",
    },
    columns: [
      {
        data: "index", // No
      },
      {
        data: "RequestDate", // วันที่แจ้งซ่อม
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "SlipNo", // เลขที่ใบแจ้ง
      },
      {
        data: "Section", // แผนกที่แจ้ง
      },
      {
        data: "PartNo", // DWG no.(PART NO) ที่มีการผลิตครั้งแรก
      },
      {
        data: "PartName", // ชื่อชิ้นงาน
      },
      {
        data: "McName", // MACHINE
      },
      {
        data: "RequestTime", // เวลาที่แจ้ง TIME
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "NoHAT", // Control NO. HAT
        render: function (data, type, row) {
          if (data) return data
          else return "-";
        },
      },
      {
        data: "AS400", // AS400  เปรียบเทียบList
        render: function (data, type, row) {
          if (data) return data
          else return "-";
        },
      },
      {
        data: "Problem", // รายละเอียดการเปลี่ยนแปลง
      },
      {
        data: "Document", // เอกสารแนบ
      },
      {
        data: "RequestUser", // ผู้แจ้ง
      },
      {
        data: "MgLeader", // หัวหน้า
        render: function (data, type, row) {
          if (data) return data
          else return "-";
        },
      },
      {
        data: "MgMgr", // ผู้จัดการแผนก
        render: function (data, type, row) {
          if (data) return data
          else return "-";
        },
      },
      {
        data: "FixDetail", // รายละเอียดการแก้ไข
        render: function (data, type, row) {
          if (data) return data
          else return "-";
        },
      },
      {
        data: "TryDate", // วันดำเนินการใบสั่งซ่อมแม่พิมพ์
        render: function (data, type, row) {
          if (data) return data.replace(" ", "<br/>");
          else return "-";
        },
      },
      {
        data: "QaResult", // ผลการตัดสินใบสั่งซ่อมแม่พิมพ์ (RESULT)
      },
      {
        data: "QaRemark", // REMARK
      },
      {
        width: "20%",
        defaultContent:
          '<div class="btn-group btn-group-sm" role="group"><button class="btn btn-warning" id="editPoReportBtn" type="button"><i class="fa fa-pencil-square-o m-1"></i>แก้ไข</button></div>',
      },
    ],
  });
}


