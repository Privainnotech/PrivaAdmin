function fill_company() {
  tableCompany = $("#tableCompany").DataTable({
    bDestroy: true,
    scrollY: "300px",
    scrollCollapse: true,
    ajax: {
      url: "/company_master/data",
      dataSrc: "",
    },
    columns: [
      {
        data: "index",
      },
      {
        data: "CompanyName",
      },
      {
        data: "CompanyAddress",
      },
      {
        data: "CompanyEmail",
      },
      {
        data: "CompanyTel",
      },
      {
        defaultContent:
          "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditCompany' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelCompany'><i class='fa fa-remove'></i></button></div></div>",
      },
      
    ],
    
    createdRow: function( row, data, dataIndex ) {
      console.log($(row).children())
      let last =  $(row).children().length - 1

      $($( row ).children()[last]).addClass('test');
  }
  });
}
async function LoadDropDown() {
  // Edit Customer
  $.ajax({
    url: "/dropdown/company",
    method: "get",
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      $("#modalInpCompanyId").html("<option value='null'>-</option>");
      response.forEach((Company) => {
        $("#modalInpCompanyId").append(
          "<option value=" +
            Company.CompanyId +
            "><span>" +
            Company.CompanyName +
            "</span></option>"
        );
      });
      // console.log(response)
    },
  });
}

$(document).ready(function () {
  //Company Table

  fill_company();
  LoadDropDown();

  //Create Company
  $("#addCompany").unbind();
  $("#addCompany").click("#addCompany", function () {
    $("#modalCompanyMaster").modal("show");

    $("#formCompany").trigger("reset");
    $(".modal-title").text("Add Company");

    $("#modalSaveCompany").unbind();
    $("#modalSaveCompany").click(async function () {
      let data = {
        CompanyName: $("#modalInpCompanyName").val(),
        CompanyAddress: $("#modalInpCompanyAddress").val(),
        CompanyEmail: $("#modalInpCompanyEmail").val(),
        CompanyTel: $("#modalInpCompanyTel").val(),
      };
      try {
        let res = await AjaxDataJson(`/company_master/add`, `post`, data);
        SwalAddSuccess(res);
        tableCompany.ajax.reload(null, false);
        fill_resetTable();
        LoadDropDown();
        $("#modalCompanyMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalCompanyMaster").modal("hide");
    });
  });

  //Edit Company
  $("#tableCompany").unbind();
  $("#tableCompany").on("click", "#btnEditCompany", function () {
    $("#modalCompanyMaster").modal("show");

    $(".modal-title").text("Edit Company");
    let rows = $(this).closest("tr");
    let { CompanyId, CompanyName, CompanyAddress, CompanyEmail, CompanyTel } =
      tableCompany.row(rows).data();

    $("#modalInpCompanyName").val(CompanyName);
    $("#modalInpCompanyAddress").val(CompanyAddress);
    $("#modalInpCompanyEmail").val(CompanyEmail);
    $("#modalInpCompanyTel").val(CompanyTel);

    $("#modalSaveCompany").unbind();
    $("#modalSaveCompany").click(async function () {
      let data = {
        CompanyName: $("#modalInpCompanyName").val(),
        CompanyAddress: $("#modalInpCompanyAddress").val(),
        CompanyEmail: $("#modalInpCompanyEmail").val(),
        CompanyTel: $("#modalInpCompanyTel").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/company_master/edit/${CompanyId}`,
          `put`,
          data
        );
        SwalEditSuccess(res);
        tableCompany.ajax.reload(null, false);
        fill_resetTable();
        LoadDropDown();
        $("#modalCompanyMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalCompanyMaster").modal("hide");
    });
  });

  //Delete Company
  $("#tableCompany").on("click", "#btnDelCompany", async function () {
    let rows = $(this).closest("tr");
    let { CompanyId } = tableCompany.row(rows).data();
    try {
      let res = await AjaxDelete(`/company_master/delete/${CompanyId}`);
      SwalDeleteSuccess(res);
      tableCompany.ajax.reload(null, false);
      fill_resetTable();
      LoadDropDown();
    } catch (error) {
      SwalError(error);
    }
  });
});
