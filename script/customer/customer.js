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
$(document).ready(function () {
  //Reset Table

  // Edit Customer
  $("#tableCustomer").unbind();
  $("#tableCustomer").on("click", "#btnEditCustomer", function () {
    $("#modalCustomerMaster").modal("show");

    $("#formCustomer").trigger("reset");
    $(".modal-title").text("Edit Customer");

    let rows = $(this).closest("tr");
    let { CompanyId, CustomerId, CustomerName, CustomerEmail, CustomerTel } =
      tableCustomer.row(rows).data();

    $("#modalInpCustomerName").val(CustomerName);
    $("#modalInpCustomerEmail").val(CustomerEmail);
    $("#modalInpCustomerTel").val(CustomerTel);
    $("#modalInpCompanyId").val(CompanyId);

    $("#modalSaveCustomer").unbind();
    $("#modalSaveCustomer").click(async function () {
      let data = {
        CustomerName: $("#modalInpCustomerName").val(),
        CustomerEmail: $("#modalInpCustomerEmail").val(),
        CustomerTel: $("#modalInpCustomerTel").val(),
        CompanyId: $("#modalInpCompanyId").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/customer_master/edit/${CustomerId}`,
          `put`,
          data
        );
        SwalEditSuccess(res);
        tableCustomer.ajax.reload(null, false);
        $("#modalCustomerMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalCustomerMaster").modal("hide");
    });
  });

  //Delete Customer
  $("#tableCustomer").on("click", "#btnDelCustomer", async function () {
    let rows = $(this).closest("tr");
    let { CustomerId } = tableCustomer.row(rows).data();
    try {
      let res = await AjaxDelete(`/customer_master/delete/${CustomerId}`);
      SwalDeleteSuccess(res);
      tableCustomer.ajax.reload(null, false);
    } catch (error) {
      SwalError(error);
    }
  });

  //==================================================================================//
  // click on tableCompany Number table
  $("#tableCompany tbody").unbind();
  $("#tableCompany tbody").on("click", "tr", function () {
    let rows = $(this).closest("tr");
    let { CompanyId } = tableCompany.row(rows).data();

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
      $("#addCustomer").unbind();
      $("#addCustomer").click(function () {
        $("#modalCustomerMaster").modal("show");

        $("#formCustomer").trigger("reset");
        $(".modal-title").text("Add Customer");

        $("#modalInpCompanyId").val(CompanyId);

        $("#modalSaveCustomer").unbind();
        $("#modalSaveCustomer").click(async function () {
          
          let data = {
            CustomerName: $("#modalInpCustomerName").val(),
            CustomerEmail: $("#modalInpCustomerEmail").val(),
            CustomerTel: $("#modalInpCustomerTel").val(),
            CompanyId: $("#modalInpCompanyId").val(),
          };
          try {
            let res = await AjaxDataJson(`/customer_master/add`, `post`, data);
            SwalAddSuccess(res);
            tableCustomer.ajax.reload(null, false);
            $("#modalCustomerMaster").modal("hide");
          } catch (error) {
            SwalError(error);
          }
        });
        $(".close,.no").click(function () {
          $("#modalCustomerMaster").modal("hide");
        });
      });
    }
  });
});
