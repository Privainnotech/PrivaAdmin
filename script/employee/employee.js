function fill_employee() {
  tableEmploy = $("#tableEmploy").DataTable({
    bDestroy: true,
    scrollX: true,
    scrollCollapse: true,
    ajax: {
      url: "/employee_master/data",
      dataSrc: "",
    },
    columns: [
      
      {
        data: "EmployeeName",
      },
      {
        data: "EmployeePosition",
        render: function (data,type,row) {
          let show = !data ? '-' : data
          return show;
        }
      },
      {
        data: "EmployeeEmail",
        render: function (data,type,row) {
          let show = !data ? '-' : data
          return show;
        }
      },
      {
        data: "EmployeeTel",
        render: function (data,type,row) {
          let show = !data ? '-' : data
          return show;
        }
      },
      {
        data: "Authority",
        render: function (data, type, row) {
          if (row.Authority == 1) {
            return " <div class='form-check'><input class='form-check-input' type='checkbox' value='1' id='AuthCheck' checked></div>";
          } else {
            return " <div class='form-check'><input class='form-check-input' type='checkbox' value='0' id='AuthCheck'></div>";
          }
        },
      },
      {
        data: "Approver",
        render: function (data, type, row) {
          if (row.Approver == 1) {
            return " <div class='form-check'><input class='form-check-input' type='checkbox' value='1' id='ApproveCheck' checked></div>";
          } else {
            return " <div class='form-check'><input class='form-check-input' type='checkbox' value='0' id='ApproveCheck'></div>";
          }
        },
      },
      {
        defaultContent:
          "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditEmploy' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnEditPass' style='width: 2rem;'><i class='fa fa-key' aria-hidden='true'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelEmploy'><i class='fa fa-remove'></i></button></div></div>",
      },
      {
        data: "index",
      },
    ],
    columnDefs: [
      { orderData: [7], targets: [0] },
      {
        targets: [7],
        visible: false,
        searchable: false,
      },
    ],
  });
}

$(document).ready(function () {
  //Employee Table

  fill_employee();

  //Add Employee
  $("#addEmploy").unbind();
  $("#addEmploy").click(function () {
    $("#modalEmployeeMaster").modal("show");

    $("#passbox").removeClass("visually-hidden");
    $("#Autbox").removeClass("visually-hidden");

    $("#formEmployee").trigger("reset");
    $(".modal-title").text("Add Employee");
    $("#modalSaveEmployee").unbind();
    $("#modalSaveEmployee").click(async function () {
      let data = {
        EmployeeTitle: $("#modalInpEmployTitle").val(),
        EmployeeFname: $("#modalInpEmployFname").val(),
        EmployeeLname: $("#modalInpEmployLname").val(),
        Password: $("#modalInpEmployPassword").val(),
        Authority: $("#modalInpAut").val(),
        Approver: $("#modalInpApprove").val(),
        EmployeePosition: $("#modalInpEmployPosition").val(),
        EmployeeEmail: $("#modalInpEmployEmail").val(),
        EmployeeTel: $("#modalInpEmployTel").val(),
      };
      try {
        let res = await AjaxDataJson(`/employee_master/add`, `post`, data);
        SwalAddSuccess(res);
        tableEmploy.ajax.reload(null, false);
        $("#modalEmployeeMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalEmployeeMaster").modal("hide");
    });
  });

  //Edit Employee
  $("#tableEmploy").unbind();
  $("#tableEmploy").on("click", "#btnEditEmploy", function () {
    $("#modalEmployeeMaster").modal("show");

    $("#passbox").addClass("visually-hidden");
    $("#Autbox").addClass("visually-hidden");

    $("#formCompany").trigger("reset");
    $(".modal-title").text("Edit Company");
    let rows = $(this).closest("tr");
    let {
      EmployeeId,
      EmployeeTitle,
      EmployeeFname,
      EmployeeLname,
      EmployeePosition,
      EmployeeEmail,
      EmployeeTel,
    } = tableEmploy.row(rows).data();

    $("#modalInpEmployTitle").val(EmployeeTitle);
    $("#modalInpEmployFname").val(EmployeeFname);
    $("#modalInpEmployLname").val(EmployeeLname);
    $("#modalInpEmployPosition").val(EmployeePosition);
    $("#modalInpEmployEmail").val(EmployeeEmail);
    $("#modalInpEmployTel").val(EmployeeTel);

    $("#modalSaveEmployee").unbind();
    $("#modalSaveEmployee").click(async function () {
      let data = {
        EmployeeTitle: $("#modalInpEmployTitle").val(),
        EmployeeFname: $("#modalInpEmployFname").val(),
        EmployeeLname: $("#modalInpEmployLname").val(),
        EmployeePosition: $("#modalInpEmployPosition").val(),
        EmployeeEmail: $("#modalInpEmployEmail").val(),
        EmployeeTel: $("#modalInpEmployTel").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/employee_master/edit/${EmployeeId}`,
          `put`,
          data
        );
        SwalEditSuccess(res);
        tableEmploy.ajax.reload(null, false);
        $("#modalEmployeeMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalEmployeeMaster").modal("hide");
    });
  });

  //Change Pass
  $("#tableEmploy").on("click", "#btnEditPass", function () {
    $("#modalPassMaster").modal("show");
    $("#formPass").trigger("reset");
    $(".modal-title").text("Change Password");

    let rows = $(this).closest("tr");
    let { EmployeeId } = tableEmploy.row(rows).data();

    $("#modalSaveEdit").unbind();
    $("#modalSaveEdit").click(async function () {
      let data = {
        Password: $("#modalInpEdEmployPassword").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/employee_master/change_password/${EmployeeId}`,
          `put`,
          data
        );
        SwalEditSuccess(res);
        tableEmploy.ajax.reload(null, false);
        $("#modalPassMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalPassMaster").modal("hide");
    });
  });

  //Delete Employee
  $("#tableEmploy").on("click", "#btnDelEmploy", async function () {
    let rows = $(this).closest("tr");
    let { EmployeeId } = tableEmploy.row(rows).data();
    try {
      let res = await AjaxDelete(`/employee_master/delete/${EmployeeId}`);
      SwalDeleteSuccess(res);
      tableEmploy.ajax.reload(null, false);
    } catch (error) {
      SwalError(error);
    }
  });

  //Change Authority
  $("#tableEmploy").on("click", "#AuthCheck",async function () {
    let rows = $(this).closest("tr");
    let { EmployeeId } = tableEmploy.row(rows).data();
    let Authority = 0;
    $(this).is(":checked") ? (Authority = 1) : "";
    // checkbox is not checked -> do something different
    let data = {Authority: Authority};
    try {
      let res = await AjaxDataJson(`/employee_master/change_authority/${EmployeeId}`,`put`,data);
      SwalSuccess(res);
      tableEmploy.ajax.reload(null, false);
    } catch (error) {
      SwalError(error);
      tableEmploy.ajax.reload(null, false);
    }
  });

  //Change Approver
  $("#tableEmploy").on("click", "#ApproveCheck",async function () {
    let rows = $(this).closest("tr");
    let {EmployeeId} = tableEmploy.row(rows).data();
    let Approver = 0;
    $(this).is(":checked") ? (Approver = 1) : "";
    // checkbox is not checked -> do something different
    let data = {Approver: Approver}
    try {
      let res = await AjaxDataJson(`/employee_master/change_approval/${EmployeeId}`,`put`,data);
      SwalSuccess(res);
      tableEmploy.ajax.reload(null, false);
    } catch (error) {
      SwalError(error);
      tableEmploy.ajax.reload(null, false);
    }
    
  });
});
