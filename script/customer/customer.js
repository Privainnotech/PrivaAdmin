$(document).ready(function () {
  //Reset Table
  function fill_resetTable() {
    var trHTML = "";
    trHTML += "<tr>";
    trHTML += '<td colspan="6">Select Company on Company Table...</td>';
    trHTML += "</tr>";
    document.getElementById("showTable").innerHTML = trHTML;
  }

  function fill_customer(Id) {
    //Customer Table
    tableCustomer = $("#tableCustomer").DataTable({
      bDestroy: true,
      scrollY: "300px",
      scrollCollapse: true,
      ajax: {
        url: `/customer_master/data/` + Id,
        dataSrc: "",
      },
      columns: [
        {
          data: "index",
        },
        {
          data: "CustomerName",
        },

        {
          data: "CustomerEmail",
        },
        {
          data: "CustomerTel",
        },
        {
          defaultContent:
            "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditCustomer' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelCustomer'><i class='fa fa-remove'></i></button></div></div>",
        },
        {
          data: "CustomerId",
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

  // Edit Customer
  $(document).on("click", "#btnEditCustomer", function () {
    $("#modalCustomerMaster").modal("show");

    $("#formCustomer").trigger("reset");
    $(".modal-title").text("Edit Customer");

    rows = $(this).closest("tr");
    let CompanyId = tableCustomer.rows(rows).data()[0].CompanyId;
    let CustomerId = tableCustomer.rows(rows).data()[0].CustomerId;
    let CustomerName = tableCustomer.rows(rows).data()[0].CustomerName;
    let CustomerEmail = tableCustomer.rows(rows).data()[0].CustomerEmail;
    let CustomerTel = tableCustomer.rows(rows).data()[0].CustomerTel;

    $("#modalInpCustomerName").val(CustomerName);
    $("#modalInpCustomerEmail").val(CustomerEmail);
    $("#modalInpCustomerTel").val(CustomerTel);
    $("#modalInpCompanyId").val(CompanyId);

    $("#modalSaveCustomer").unbind();
    $("#modalSaveCustomer").click(function () {
      let CustomerName = $.trim($("#modalInpCustomerName").val());
      let CustomerEmail = $.trim($("#modalInpCustomerEmail").val());
      let CustomerTel = $.trim($("#modalInpCustomerTel").val());
      let CompanyId = $.trim($("#modalInpCompanyId").val());

      $.ajax({
        url: "/customer_master/edit/" + CustomerId,
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({
          CustomerName: CustomerName,
          CustomerEmail: CustomerEmail,
          CustomerTel: CustomerTel,
          CompanyId: CompanyId,
        }),
        success: function (success) {
          successText = success.message;
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Created",
            text: successText,
            showConfirmButton: false,
            timer: 1500,
          });
          tableCustomer.ajax.reload(null, false);
          $("#modalCustomerMaster").modal("hide");
        },
        error: function (err) {
          errorText = err.responseJSON.message;
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
    });
    $(".close,.no").click(function () {
      $("#modalCustomerMaster").modal("hide");
    });
  });

  //Delete Customer
  $(document).on("click", "#btnDelCustomer", function () {
    $("#modalDeleteConfirm").modal("show");

    rows = $(this).closest("tr");
    let CustomerId = tableCustomer.rows(rows).data()[0].CustomerId;
    $(".modal-title").text("Confirm Delete");
    $("#btnYes").unbind("click");
    $("#btnYes").click(function () {
      $.ajax({
        url: "/customer_master/delete/" + CustomerId,
        method: "delete",
        contentType: "application/json",
        success: function (success) {
          successText = success.message;
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Deleted",
            text: successText,
            showConfirmButton: false,
            timer: 1500,
          });
          tableCustomer.ajax.reload(null, false);
        },
      });
      $("#modalDeleteConfirm").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalDeleteConfirm").modal("hide");
    });
  });

  //==================================================================================//
  // click on tableCompany Number table
  $("#tableCompany tbody").on("click", "tr", function () {
    rows = $(this).closest("tr");
    let CompanyId = tableCompany.rows(rows).data()[0].CompanyId;

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      $("#addCustomer").removeClass("visually-hidden");
      $("#addCustomer").toggleClass("visually-hidden");
      fill_resetTable();
    } else {
      $("#tableCompany tr").removeClass("selected");
      $(this).toggleClass("selected");
      $("#addCustomer").removeClass("visually-hidden");

      fill_customer(CompanyId);

      //Create Customer
      $(document).on("click", "#addCustomer", function () {
        $("#modalCustomerMaster").modal("show");

        $("#formCustomer").trigger("reset");
        $(".modal-title").text("Add Customer");

        $("#modalInpCompanyId").val(CompanyId);

        $("#modalSaveCustomer").unbind();
        $("#modalSaveCustomer").click(function () {
          let CustomerName = $.trim($("#modalInpCustomerName").val());
          let CustomerEmail = $.trim($("#modalInpCustomerEmail").val());
          let CustomerTel = $.trim($("#modalInpCustomerTel").val());
          let CompanyId = $.trim($("#modalInpCompanyId").val());

          if (CustomerName !== null) {
            $.ajax({
              url: "/customer_master/add",
              method: "post",
              contentType: "application/json",
              data: JSON.stringify({
                CustomerName: CustomerName,
                CustomerEmail: CustomerEmail,
                CustomerTel: CustomerTel,
                CompanyId: CompanyId,
              }),
              success: function (success) {
                successText = success.message;
                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Created",
                  text: successText,
                  showConfirmButton: false,
                  timer: 1500,
                });
                tableCustomer.ajax.reload(null, false);
                $("#modalCustomerMaster").modal("hide");
              },
              error: function (err) {
                errorText = err.responseJSON.message;
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
        });
        $(".close,.no").click(function () {
          $("#modalCustomerMaster").modal("hide");
        });
      });
    }
  });
});
