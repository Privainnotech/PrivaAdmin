const $fieldProject = $(
  "#PJ_Name, #PJ_Discount, #PJ_End_Customer, #PJ_Validity, #PJ_Delivery, #PJ_Remark, #PJ_Approve, #CusName"
);
const $SettingTable = $(
  "#IP-Set-TableShow, #IP-Set-TablePrice, #IP-Set-TableQty, #IP-Set-TableTotal"
);
const $StatusButton = $("#btn-cancel, #btn-quotation, #btn-book, #btn-loss");
// let loadDetail = null;
let $LoadingPreview = $("#loading-preview").hide();
$("#loading-close").on("click", function () {
  $LoadingPreview.hide();
});
//Hide Edit Button
function hideEdit() {
  $("#modalEditProject").addClass("invisible");
  $("#btnExample").addClass("invisible");
  $("#btnRevised").addClass("invisible");
  //   $("#modalEditProject").toggleClass("invisible");
}
//Hide Add Item Button
function hideAdd() {
  $("#addItem").addClass("visually-hidden");
}

//Hide Setting
function hideSetting() {
  //   $("#modalSaveSetting").removeClass("visually-hidden");
  $("#modalSaveSetting").addClass("visually-hidden");
  $SettingTable.attr("disabled", "disabled");
}

//Show Setting
function ShowSetting() {
  $("#modalSaveSetting").removeClass("visually-hidden");
  $SettingTable.removeAttr("disabled");
}

//Show Project
function ShowPro(QuotationId) {
  $.ajax({
    url: "/quotation/" + QuotationId,
    method: "get",
    cache: false,
    success: function (response) {
      var obj = JSON.parse(response);
      // console.log(obj)
      let {
        QuotationApproval,
        QuotationNo_Revised,
        CustomerId,
        QuotationDate,
        CustomerEmail,
        CompanyName,
        CompanyAddress,
        QuotationSubject,
        QuotationDiscount,
        QuotationValidityDate,
        QuotationPayTerm,
        QuotationDelivery,
        QuotationRemark,
        EndCustomer,
        EmployeeApproveId,
        QuotationTotalPrice,
        QuotationNet,
        QuotationVat,
        QuotationNetVat,
        TableShow,
        TablePrice,
        TableQty,
        TableTotal,
        DetailShow,
        DetailQty,
        DetailTotal,
        QuotationDetail,
      } = obj;
      let ApproveStatus = "";
      if (QuotationApproval == 2) {
        $("#btn-approve").hide();
        ApproveStatus = '<i class="fa fa-check-circle"></i>';
      } else {
        $("#btn-approve").show();
        if (QuotationApproval == 1) {
          ApproveStatus = '<i class="fa fa-hourglass"></i>';
        }
      }
      $("#ProNo").html(`${QuotationNo_Revised} ${ApproveStatus}`);
      // $('#Revised').val("_"+QuotationRevised);
      //dropdown customer
      $.ajax({
        url: `/dropdown/customer`,
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (res) {
          console.log("dpMold: ", res);
          if (res.length == 0) {
            $("#CusName option").remove();
            $("#CusName").append("<option value='No data'>");
            $("#CusName").attr("disabled", "");
          } else {
            $("#CusName option").remove();
            $("#CusName optgroup").remove();
            $("#CusName").append("<option value=''> ");
            res.forEach((obj) => {
              console.log(obj);
              $("#CusName").append(
                `<option value='${obj.CustomerId}'>${obj.CustomerName}</option>`
              );
            });
          }
        },
        error: function (err) {
          $("#CusName option").remove();
          $("#CusName").append("<option value='No data'>");
          $("#CusNameIp").attr("disabled", "");
        },
      });
      console.log(CustomerId);
      $("#CusName").val(CustomerId);
      $("#QDate").val(QuotationDate);
      $("#CusEmail").val(CustomerEmail);
      $("#ComName").val(CompanyName);
      $("#Adress").val(CompanyAddress);

      $("#PJ_Name").val(QuotationSubject);
      $("#PJ_Discount").val(QuotationDiscount);
      $("#PJ_Validity").val(QuotationValidityDate);
      // console.log(typeof QuotationPayTerm);
      $("#PJ_Payment1").val(QuotationPayTerm.QuotationPayTerm1);
      $("#PJ_Payment2").val(QuotationPayTerm.QuotationPayTerm2);
      $("#PJ_Payment3").val(QuotationPayTerm.QuotationPayTerm3);
      if (typeof QuotationPayTerm == "object") {
        // console.log(Object.keys(QuotationPayTerm).length);
        // console.log(QuotationPayTerm[`QuotationPayTerm${1}`]);
        $(".box-payment .input-group").remove();
        for (let i = 1; i <= Object.keys(QuotationPayTerm).length; i++) {
          $(".box-payment").append(`
          	<div class="input-group mb-1">
              <input type="text" class="form-control edit f-9 mb-0 me-3 payment" value="${
                QuotationPayTerm[`QuotationPayTerm${i}`]
              }" disabled>
              <input type="number" class=" edit f-9 mb-0 me-1 payment" value="0" disabled>
              <span class = "bg-white border-0 input-group-text group-title edit f-9 mb-0 ps-2">%</span>
              <button class="btn btn-sm btn-danger payment btn-del-payment" disabled >Del</button>
            </div>
        `);
        }
      } else {
        console.log(QuotationPayTerm.length);
      }
      $("#PJ_Delivery").val(QuotationDelivery);
      $("#PJ_Remark").val(QuotationRemark);
      $("#PJ_End_Customer").val(EndCustomer);
      $("#PJ_Approve").val(EmployeeApproveId);

      $("#TotalPrice").val(QuotationTotalPrice);
      $("#PriceAfter").val(QuotationNet);
      $("#Vat").val(QuotationVat);
      $("#NetTotal").val(QuotationNetVat);

      // setting show status
      $("#IP-Set-TableShow").val(TableShow);
      $("#IP-Set-TablePrice").val(TablePrice);
      $("#IP-Set-TableQty").val(TableQty);
      $("#IP-Set-TableTotal").val(TableTotal);
      $("#IP-Set-DetailShow").val(DetailShow);
      $("#IP-Set-DetailQty").val(DetailQty);
      $("#IP-Set-DetailTotal").val(DetailTotal);

      // getDetail
      const loadDetail = JSON.stringify(QuotationDetail);
      const editor = new EditorJS({
        tools: {
          text: {
            class: SimpleText,
            inlineToolbar: ["link"],
          },
        },
      });

      editor.isReady.then(() => {
        editor.render(JSON.parse(loadDetail));
      });

      //  Edit Detail
      const saveButton = document.getElementById("save-button");

      saveButton.addEventListener("click", () => {
        $("#modalEditConfirm").modal("show");
        $(".modal-title").text("Confirm Edit Detail");
        $("#btnEditYes").unbind();
        $("#btnEditYes").click(function () {
          editor.save().then((savedData) => {
            load = JSON.stringify(savedData, null, 4);
            $.ajax({
              url: "/quotation/edit_detail/" + QuotationId,
              method: "put",
              contentType: "application/json",
              data: JSON.stringify({
                QuotationDetail: savedData,
              }),
              success: function () {
                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Edit",
                  text: "Successfully Edit Detail",
                  showConfirmButton: false,
                  timer: 1500,
                });
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
            $("#modalEditConfirm").modal("hide");
          });
        });
      });
      $(".close,.no").click(function () {
        $("#modalEditConfirm").modal("hide");
      });
    },
  });
}

//Reset Project
function RePro() {
  // QuotationId = null
  $("#btn-approve").hide();
  $("#ProNo").html("Project NO.");
  $("#CusName,#QDate,#CusEmail,#ComName,#Adress").val("");

  $(
    "#PJ_Name,#PJ_Discount,#PJ_Validity,#PJ_Delivery,#PJ_Remark,#PJ_End_Customer"
  ).val("");
  $("#PJ_Approve").val("-");

  $("#TotalPrice,#PriceAfter,#Vat,#NetTotal").val("");
  $SettingTable.val("0");
}

//Remove Detail Paper
function removeDetailPaper() {
  const detailPaper = document.querySelectorAll(".codex-editor");
  if ($("div").hasClass("codex-editor")) {
    detailPaper.forEach((paper) => {
      paper.remove();
    });
  }
}

//Reset Quo Table
function fill_resetQuoTable() {
  var trHTML = "";
  trHTML += "<tr>";
  trHTML += '<td colspan="6">please select a project...</td>';
  trHTML += "</tr>";
  document.getElementById("showQuoTable").innerHTML = trHTML;
}

//Reset Item Table
function fill_resetTable() {
  var trHTML = "";
  trHTML += "<tr>";
  trHTML += '<td colspan="6">please select a revised...</td>';
  trHTML += "</tr>";
  document.getElementById("showTable").innerHTML = trHTML;
}

//Reset Sub-Item Table
function fill_resetSubTable() {
  var trHTML = "";
  trHTML += "<tr>";
  trHTML += '<td colspan="6">please select a item...</td>';
  trHTML += "</tr>";
  document.getElementById("showSubTable").innerHTML = trHTML;
}

$(document).ready(function () {
  fill_quotationHead();
  searchTableQuoHead();
  fill_resetQuoTable();
  fill_quotation();

  $("#save-button").hide();
  $("#btn_AddPayment").hide();

  //======================== Quotation =============================//
  $("#CusName").change(async (e) => {
    let CusId = $(this).val();
    console.log(CusId)
  });
  //Create Project
  $("#addProject").unbind();
  $("#addProject").on("click", function () {
    $("#modalQuotationMaster").modal("show");
    $("#formQuotation").trigger("reset");
    $(".modal-title").text("Add Project");
    $("#modalSaveProject").unbind();
    $("#modalSaveProject").click(function () {
      let url = "/quotation/add_pre_quotation";
      let Data = {
        QuotationSubject: $("#modalInpProjectName").val(),
        CustomerId: $("#modalInpCustomerId").val(),
      };
      AjaxPost(url, tableQuoHead, tableQuo, Data, $("#modalQuotationMaster"));
    });
    $(".close,.no").click(function () {
      $("#modalQuotationMaster").modal("hide");
    });
  });
  //clickTableQuotationHead
  $("#tableQuoHead tbody").unbind();
  $("#tableQuoHead tbody").on("click", "tr", function () {
    $("#save-button").hide();
    $("#btn_AddPayment").hide();
    $StatusButton.attr("disabled", "disabled");
    removeDetailPaper();
    hideAdd();
    hideEdit();
    hideSetting();
    fill_resetTable();
    RePro();
    fill_resetQuoTable();
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      //
      $("#save-button").hide();
      $StatusButton.attr("disabled", "disabled");
      removeDetailPaper();
      hideAdd();
      hideEdit();
      hideSetting();
      fill_resetTable();
      RePro();
      fill_resetQuoTable();
      // console.log("un selecte");
    } else {
      $("#tableQuoHead tr").removeClass("selected");
      $(this).addClass("selected");
      let rows = $(this).closest("tr");
      let { QuotationNoId } = tableQuoHead.row(rows).data();
      fill_quotation(QuotationNoId);
    }
  });

  //Delete Project
  $("#tableQuo").unbind();
  $("#tableQuo").on("click", "#btnDelProject", function () {
    rows = $(this).closest("tr");
    let { QuotationId } = tableQuo.row(rows).data();
    let url = `/quotation/delete_quotation/${QuotationId}`;
    AjaxDelete(url, tableQuo, tableQuoHead);
  });

  //clickTableQuotation
  $("#tableQuo tbody").unbind();
  $("#tableQuo tbody").on("click", "tr", function () {
    $("#btn_AddPayment").hide();
    fill_resetSubTable();
    $("#btn-text").text("Edit");
    $fieldProject.attr("disabled", "");
    $StatusButton.attr("disabled", "");
    $SettingTable.attr("disabled", "");

    rows = $(this).closest("tr");
    let { QuotationId, QuotationApproval, QuotationStatus } = tableQuo
      .row(rows)
      .data();

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      $("#save-button").hide();
      removeDetailPaper();
      hideAdd();
      hideEdit();
      hideSetting();
      fill_resetTable();
      RePro();
    } else {
      $("#tableQuo tr").removeClass("selected");
      $(this).addClass("selected");

      $("#save-button").hide();
      $("#modalEditProject").removeClass("save");
      $("#btnExample").removeClass("invisible");
      removeDetailPaper();
      ShowPro(QuotationId);
      fill_item(QuotationId, QuotationStatus);

      if (QuotationStatus === 1) {
        //Show Edit Button
        $("#modalEditProject").removeClass("invisible");
        //Show AddItem Button
        $("#addItem").removeClass("visually-hidden");
        //Show Quotation Button
        $("#btn-quotation").removeAttr("disabled");
        //Show Detail Custom Button
        $("#save-button").show();
        //Hide Revise Button
        $("#btnRevised").addClass("invisible");

        //Show Setting
        ShowSetting();

        $("#modalEditProject").unbind();
        $("#modalEditProject").click(function () {
          if ($("#modalEditProject").hasClass("save")) {
            $("#modalEditConfirm").modal("show");
            $(".modal-title").text("Confirm Save Edit Project");

            $("#btnEditYes").unbind();
            $("#btnEditYes").click(function () {
              let QuotationPayTerm = [];

              console.log($(".box-payment .input-group").length);

              for (let i = 0; i < $(".box-payment .input-group").length; i++) {
                let pay = $(".box-payment .input-group").eq(i);
                console.log($(pay).children()[0].value);
                let pay_detail = $(pay).children()[0].value;
                let pay_percent = $(pay).children()[1].value;
                if (pay_detail)
                  QuotationPayTerm.push({
                    PayTerm: pay_detail,
                    Percent: pay_percent,
                  });
              }

              console.log(QuotationPayTerm);
              $.ajax({
                url: "/quotation/edit_quotation/" + QuotationId,
                method: "put",
                contentType: "application/json",
                data: JSON.stringify({
                  QuotationSubject: $("#PJ_Name").val(),
                  QuotationDiscount: $("#PJ_Discount").val(),
                  QuotationValidityDate: $("#PJ_Validity").val(),
                  QuotationPayTerm: QuotationPayTerm,
                  QuotationDelivery: $("#PJ_Delivery").val(),
                  QuotationRemark: $("#PJ_Remark").val(),
                  EndCustomer: $("#PJ_End_Customer").val(),
                  EmployeeApproveId: $("#PJ_Approve").val(),
                }),
                success: function () {
                  Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Saved",
                    text: "Successfully Edit Quotation",
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  tableQuo.ajax.reload(null, false);
                  tableQuoHead.ajax.reload(null, false);
                  ShowPro(QuotationId);
                  $("#modalEditProject").removeClass("save");
                  $("#btn-text").text("Edit");
                  $fieldProject.attr("disabled", "disabled");
                  $("#btn_AddPayment").hide();
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
              $("#modalEditConfirm").modal("hide");
            });
            $(".close,.no").click(function () {
              $("#modalEditConfirm").modal("hide");
            });
          } else {
            // $("#modalEditProject").removeClass("save");
            $("#modalEditProject").addClass("save");
            $("#btn-text").text("Save");
            $fieldProject.removeAttr("disabled");
            $(".payment").removeAttr("disabled");
            $("#btn_AddPayment").show();
            $("#btn_AddPayment").unbind();
            $("#btn_AddPayment").click(function () {
              $(".box-payment").append(`
                <div class="input-group mb-1">
                  <input type="text" class="form-control edit f-9 mb-0 me-3 payment" value="">
                  <input type="number" class="edit f-9 mb-0 me-1 payment" value="">
                  <span class = "bg-white border-0 input-group-text group-title edit f-9 mb-0 ps-2">%</span>
                  <button class="btn btn-sm btn-danger payment btn-del-payment" >Del</button>
                </div>
              `);
            });
          }
        });
        // Save Setting
        $("#modalSaveSetting").unbind();
        $("#modalSaveSetting").on("click", function () {
          $("#modalSettingConfirm").modal("show");

          $(".modal-title").text("Confirm Setting");
          $("#btnSettingYes").unbind();
          $("#btnSettingYes").click(function () {
            let url = `/quotation/edit_setting/${QuotationId}`;
            let Data = {
              TableShow: $("#IP-Set-TableShow").val(),
              TablePrice: $("#IP-Set-TablePrice").val(),
              TableQty: $("#IP-Set-TableQty").val(),
              TableTotal: $("#IP-Set-TableTotal").val(),
            };
            AjaxPut(url, null, Data, $("#modalSettingConfirm"));
          });
          $(".close,.no").click(function () {
            $("#modalSettingConfirm").modal("hide");
          });
        });
      }
      //======================== Set Status =============================//
      // Status Quotation
      if (QuotationStatus === 2) {
        $("#btn-text").text("Edit");

        //Eidt button
        hideEdit();
        $("#btnExample").removeClass("invisible");
        $("#btnRevised").removeClass("invisible");
        //AddItem button
        hideAdd();

        hideSetting();

        $("#btn-loss").removeAttr("disabled");
        $("#btn-book").removeAttr("disabled");
        $("#btn-cancel").removeAttr("disabled");
      }

      // Status booking
      if (QuotationStatus === 3) {
        $("#btn-text").text("Edit");
        //Eidt button
        hideEdit();
        $("#btnExample").removeClass("invisible");
        $("#btnRevised").removeClass("invisible");
        //AddItem button
        hideAdd();

        hideSetting();

        $("#btn-loss").removeAttr("disabled");
        $("#btn-quotation").removeAttr("disabled");
        $("#btn-cancel").removeAttr("disabled");
      }

      // Status loss
      if (QuotationStatus === 4) {
        $("#btn-text").text("Edit");
        //Eidt button
        hideEdit();
        $("#btnExample").removeClass("invisible");
        $("#btnRevised").removeClass("invisible");
        //AddItem button
        hideAdd();

        hideSetting();

        $("#btn-book").removeAttr("disabled");
        $("#btn-quotation").removeAttr("disabled");
        $("#btn-cancel").removeAttr("disabled");
      }

      // Status cancel
      if (QuotationStatus === 5) {
        $("#btn-text").text("Edit");
        //Eidt button
        hideEdit();
        $("#btnExample").removeClass("invisible");
        $("#btnRevised").removeClass("invisible");
        //AddItem button
        hideAdd();

        hideSetting();

        $("#btn-book").removeAttr("disabled");
        $("#btn-quotation").removeAttr("disabled");
        $("#btn-loss").removeAttr("disabled");
      }

      // Revised
      $("#btnRevised").unbind();
      $("#btnRevised").on("click", function () {
        $("#modalRevisedConfirm").modal("show");

        $(".modal-title").text("Confirm Revised");
        $("#btnREYes").unbind();
        $("#btnREYes").click(function () {
          $.ajax({
            url: "/quotation_set/revise/" + QuotationId,
            method: "get",
            cache: false,
            success: function () {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Created",
                text: "Successfully revise quotation",
                showConfirmButton: false,
                timer: 1500,
              });
              tableQuo.ajax.reload(null, false);
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
          $("#modalRevisedConfirm").modal("hide");
        });
        $(".close,.no").click(function () {
          $("#modalRevisedConfirm").modal("hide");
        });
      });

      // Preview PDF
      $("#btnExample").unbind();
      $("#btnExample").on("click", function () {
        $.ajax({
          url: "/quotation_report/" + QuotationId,
          method: "get",
          contentType: "application/json",
          beforeSend: function () {
            $("#loading-preview i").addClass("fa-hourglass");
            $(".loading-title").text("Loading Quotation PDF");
            $LoadingPreview.show();
          },
          complete: function () {
            $("#loading-preview i").removeClass("fa-hourglass");
            $("#loading-preview i").addClass("fa-check-circle");
            $(".loading-title").text("Loading Complete!!");
          },
          success: function (success) {
            document.getElementById("PreviewPDF").src = "";
            QuotationApproval == 2
              ? $("#btnReqApprove").hide()
              : $("#btnReqApprove").show();
            $("#modalPreview").modal("show");
            $(".modal-title").text("Preview PDF");
            fileName = success.message;
            document.getElementById("PreviewPDF").src = fileName + "#toolbar=0";
            $("#loading-preview i").removeClass("fa-check-circle");
            //
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

        $(".close,.no").click(function () {
          $(".modal-loading-title").text("");
          $(".modal-loading-icon").removeClass("fa-check-circle");
          $(".modal-loading-icon").removeClass("fa-times-circle");
          $("#modalPreview").modal("hide");
        });
      });

      // Download PDF
      $("#btnDownload").unbind();
      $("#btnDownload").on("click", function () {
        $.ajax({
          url: "/quotation_report/download/" + QuotationId,
          method: "get",
          contentType: "application/json",
          success: function () {
            window.open("/quotation_report/download/" + QuotationId);
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

      // Request Approval
      $("#btnReqApprove").unbind();
      $("#btnReqApprove").on("click", function () {
        let EmployeeApproveId = $.trim($("#PJ_Approve").val());
        $.ajax({
          url: "/quotation_approval/request",
          method: "post",
          contentType: "application/json",
          data: JSON.stringify({
            QuotationId: QuotationId,
            EmployeeApproveId: EmployeeApproveId,
          }),
          beforeSend: function () {
            $(".modal-loading-title").text("Sending Request...");
            $(".modal-loading-icon").addClass("fa-hourglass");
            $LoadingPreview.show();
          },
          complete: function () {
            $(".modal-loading-icon").removeClass("fa-hourglass");
          },
          success: function (msg) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Sended",
              text: msg.message,
              showConfirmButton: false,
              timer: 1500,
            });
            $(".modal-loading-icon").addClass("fa-check-circle");
            $(".modal-loading-title").text("Request Sented");
            ShowPro(QuotationId);
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
            $(".modal-loading-icon").addClass("fa-times-circle");
            $(".modal-loading-title").text("Send Request Failed");
          },
        });
      });

      // Approve
      $("#btn-approve").unbind();
      $("#btn-approve").on("click", function () {
        let EmployeeApproveId = $.trim($("#PJ_Approve").val());
        $.ajax({
          url: "/quotation_approval/approve",
          method: "put",
          contentType: "application/json",
          data: JSON.stringify({
            QuotationId: QuotationId,
            EmployeeApproveId: EmployeeApproveId,
          }),
          success: function (msg) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Approved",
              text: msg.message,
              showConfirmButton: false,
              timer: 1500,
            });
            ShowPro(QuotationId);
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

      //btn-quotation
      $("#btn-quotation").unbind();
      $("#btn-quotation").on("click", function () {
        $("#modalStatusConfirm").modal("show");

        $(".modal-title").text("Confirm Set Status Quotation");

        $("#btnSetYes").unbind();
        $("#btnSetYes").click(function () {
          $.ajax({
            url: "/quotation_set/quotation/" + QuotationId,
            method: "get",
            cache: false,
            success: function (response) {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Set Status",
                text: "Successfully set Quotation",
                showConfirmButton: false,
                timer: 1500,
              });
              tableQuo.ajax.reload(null, false);
              ShowPro(QuotationId);
              //Eidt button
              hideEdit();
              $("#btnExample").removeClass("invisible");
              $("#btnRevised").removeClass("invisible");
              //AddItem button
              hideAdd();

              hideSetting();

              $("#btn-quotation").attr("disabled", "");
              $("#btn-loss").removeAttr("disabled");
              $("#btn-book").removeAttr("disabled");
              $("#btn-cancel").removeAttr("disabled");
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
          $("#modalStatusConfirm").modal("hide");
        });
        $(".close,.no").click(function () {
          $("#modalStatusConfirm").modal("hide");
        });
      });

      //btn-cancel
      $("#btn-cancel").unbind();
      $("#btn-cancel").on("click", function () {
        $("#modalStatusConfirm").modal("show");

        $(".modal-title").text("Confirm Set Status Cancel");
        $("#btnSetYes").unbind();
        $("#btnSetYes").click(function () {
          $.ajax({
            url: "/quotation_set/cancel/" + QuotationId,
            method: "get",
            cache: false,
            success: function (response) {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Set Status",
                text: "Successfully set Quotation",
                showConfirmButton: false,
                timer: 1500,
              });
              tableQuo.ajax.reload(null, false);
              $("#btn-quotation").removeAttr("disabled");
              $("#btn-loss").removeAttr("disabled");
              $("#btn-book").removeAttr("disabled");
              $("#btn-cancel").attr("disabled", "");
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
          $("#modalStatusConfirm").modal("hide");
        });
        $(".close,.no").click(function () {
          $("#modalStatusConfirm").modal("hide");
        });
      });

      //btn-book
      $("#btn-book").unbind();
      $("#btn-book").on("click", function () {
        $("#modalStatusConfirm").modal("show");

        $(".modal-title").text("Confirm Set Status Book");
        $("#btnSetYes").unbind();
        $("#btnSetYes").click(function () {
          $.ajax({
            url: "/quotation_set/booking/" + QuotationId,
            method: "get",
            cache: false,
            success: function (response) {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Set Status",
                text: "Successfully set Quotation",
                showConfirmButton: false,
                timer: 1500,
              });
              tableQuo.ajax.reload(null, false);
              $("#btn-quotation").removeAttr("disabled");
              $("#btn-loss").removeAttr("disabled");
              $("#btn-book").attr("disabled", "");
              $("#btn-cancel").removeAttr("disabled");
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
          $("#modalStatusConfirm").modal("hide");
        });
        $(".close,.no").click(function () {
          $("#modalStatusConfirm").modal("hide");
        });
      });

      //btn-loss
      $("#btn-loss").unbind();
      $("#btn-loss").on("click", function () {
        $("#modalStatusConfirm").modal("show");

        $(".modal-title").text("Confirm Set Status Loss");
        $("#btnSetYes").unbind();
        $("#btnSetYes").click(function () {
          $.ajax({
            url: "/quotation_set/loss/" + QuotationId,
            method: "get",
            cache: false,
            success: function (response) {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Set Status",
                text: "Successfully set Quotation",
                showConfirmButton: false,
                timer: 1500,
              });
              tableQuo.ajax.reload(null, false);
              $("#btn-quotation").removeAttr("disabled");
              $("#btn-loss").attr("disabled", "");
              $("#btn-book").removeAttr("disabled");
              $("#btn-cancel").removeAttr("disabled");
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
          $("#modalStatusConfirm").modal("hide");
        });
        $(".close,.no").click(function () {
          $("#modalStatusConfirm").modal("hide");
        });
      });

      //======================== Item =============================//
      // Create Item
      $("#addItem").unbind();
      $("#addItem").on("click", function () {
        $("#modalAddItemMaster").modal("show");

        $("#formAddItem").trigger("reset");
        $(".modal-title").text("Add Item ");

        $("#modalAddItem").unbind();
        $("#modalAddItem").click(function () {
          let ItemName = $.trim($("#modalInpAddItemName").val());
          let ItemQty = $.trim($("#modalInpAddQty").val());
          let ItemPrice = $.trim($("#modalInpAddItemPrice").val());
          let ItemDescription = $.trim($("#modalInpAddDetails").val());
          if (ItemName !== null) {
            $.ajax({
              url: "/quotation/add_item/" + QuotationId,
              method: "post",
              contentType: "application/json",
              data: JSON.stringify({
                ItemName: ItemName,
                ItemPrice: ItemPrice,
                ItemQty: ItemQty,
                ItemDescription: ItemDescription,
              }),
              success: function () {
                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Created",
                  text: "Successfully add Item",
                  showConfirmButton: false,
                  timer: 1500,
                });
                tableItem.ajax.reload(null, false);
                ShowPro(QuotationId);
                $("#modalAddItemMaster").modal("hide");
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
          $("#modalAddItemMaster").modal("hide");
        });
      });
    }
  });

  //======================== Item =============================//
  //Edit Item
  $(document).on("click", "#btnEditItem", function () {
    $("#modalItemMaster").modal("show");

    $("#formEditItem").trigger("reset");
    $(".modal-title").text("Edit Item");

    rows = $(this).closest("tr");
    let ItemId = tableItem.rows(rows).data()[0].ItemId;
    let ItemName = tableItem.rows(rows).data()[0].ItemName;
    let ItemPrice = tableItem.rows(rows).data()[0].ItemPrice;
    let ItemQty = tableItem.rows(rows).data()[0].ItemQty;

    let QuotationId = tableItem.rows(rows).data()[0].QuotationId;

    $("#modalInpItemName").val(ItemName);
    $("#modalInpItemPrice").val(ItemPrice);
    $("#modalInpQty").val(ItemQty);

    $("#modalEditItem").unbind();
    $("#modalEditItem").click(function () {
      let ItemName = $.trim($("#modalInpItemName").val());
      let ItemPrice = $.trim($("#modalInpItemPrice").val());
      let ItemQty = $.trim($("#modalInpQty").val());
      if (ItemName !== null) {
        $.ajax({
          url: "/quotation/edit_item/" + ItemId,
          method: "put",
          contentType: "application/json",
          data: JSON.stringify({
            ItemName: ItemName,
            ItemPrice: ItemPrice,
            ItemQty: ItemQty,
          }),
          success: function () {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Edit",
              text: "Successfully Edit Item",
              showConfirmButton: false,
              timer: 1500,
            });
            tableItem.ajax.reload(null, false);
            ShowPro(QuotationId);
            $("#modalItemMaster").modal("hide");
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
    $(".close").click(function () {
      $("#modalItemMaster").modal("hide");
    });
  });

  //Delete Item
  $(document).on("click", "#btnDelItem", function () {
    $("#modalDeleteConfirm").modal("show");

    rows = $(this).closest("tr");
    let ItemId = tableItem.rows(rows).data()[0].ItemId;
    let QuotationId = tableItem.rows(rows).data()[0].QuotationId;
    $(".modal-title").text("Confirm Delete");
    $("#btnYes").unbind();
    $("#btnYes").click(function () {
      $.ajax({
        url: "/quotation/delete_item/" + ItemId,
        method: "delete",
        contentType: "application/json",
        success: function () {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Deleted",
            text: "Successfully delete Item",
            showConfirmButton: false,
            timer: 1500,
          });
          tableItem.ajax.reload(null, false);
          ShowPro(QuotationId);
        },
      });
      $("#modalDeleteConfirm").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalDeleteConfirm").modal("hide");
    });
  });

  //dropdown Product
  $("#modalInpProduct").unbind();
  $("#modalInpProduct").click(function () {
    let ProductId = $.trim($("#modalInpProduct").val());
    if (ProductId !== "null") {
      $.ajax({
        url: "/dropdown/product/" + ProductId,
        method: "get",
        cache: false,
        success: function (response) {
          var obj = JSON.parse(response);
          $("#modalInpSubName").val(obj.ProductName);
          $("#modalInpSubPrice").val(obj.ProductPrice);
          $("#modalInpSubType").val(obj.ProductType);
        },
      });
    }
  });

  //clickTableItem
  $("#tableItem tbody").on("click", "tr", function () {
    rows = $(this).closest("tr");
    let ItemId = tableItem.rows(rows).data()[0].ItemId;
    let ItemName = tableItem.rows(rows).data()[0].ItemName;
    let QuotationStatus = tableItem.rows(rows).data()[0].QuotationStatus;
    let QuotationId = tableItem.rows(rows).data()[0].QuotationId;

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      fill_resetSubTable();
    } else {
      $("#tableItem tr").removeClass("selected");
      $(this).toggleClass("selected");
      fill_subitem(ItemId, QuotationStatus);
    }

    //Add Sub-Item
    $(document).on("click", "#btnSubItem", function () {
      $("#modalAddSubMaster").modal("show");

      $("#formSub").trigger("reset");
      $(".modal-title").text("Add Description in " + ItemName);

      $("#modalSaveSub").unbind();
      $("#modalSaveSub").click(function () {
        let ProductId = $.trim($("#modalInpProduct").val());
        let SubItemName = $.trim($("#modalInpSubName").val());
        let SubItemPrice = $.trim($("#modalInpSubPrice").val());
        let ProductType = $.trim($("#modalInpSubType").val());
        let SubItemQty = $.trim($("#modalInpSubQty").val());
        let SubItemUnit = $.trim($("#modalInpSubUnit").val());

        $.ajax({
          url: "/quotation/add_subitem/" + ItemId,
          method: "post",
          contentType: "application/json",
          data: JSON.stringify({
            ProductId: ProductId,
            SubItemName: SubItemName,
            SubItemPrice: SubItemPrice,
            ProductType: ProductType,
            SubItemQty: SubItemQty,
            SubItemUnit: SubItemUnit,
          }),
          success: function () {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Created",
              text: "Successfully add Sub-item",
              showConfirmButton: false,
              timer: 1500,
            });
            tableSubItem.ajax.reload(null, false);
            tableItem.ajax.reload(null, false);
            ShowPro(QuotationId);
            $("#modalAddSubMaster").modal("hide");
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
      $(".close").click(function () {
        $("#modalAddSubMaster").modal("hide");
      });
    });
  });

  //Edit Sub-Item
  $(document).on("click", "#btnEditSubItem", function () {
    $("#modalSubMaster").modal("show");

    $("#formSub").trigger("reset");
    $(".modal-title").text("Edit Description");
    rows = $(this).closest("tr");
    let SubItemId = tableSubItem.rows(rows).data()[0].SubItemId;
    let ProductId = tableSubItem.rows(rows).data()[0].ProductId;
    let SubItemName = tableSubItem.rows(rows).data()[0].SubItemName;
    let SubItemPrice = tableSubItem.rows(rows).data()[0].SubItemPrice;
    let ProductType = tableSubItem.rows(rows).data()[0].ProductType;
    let SubItemQty = tableSubItem.rows(rows).data()[0].SubItemQty;
    let SubItemUnit = tableSubItem.rows(rows).data()[0].SubItemUnit;
    let QuotationId = tableSubItem.rows(rows).data()[0].QuotationId;

    $("#modalInpEdProduct").val(ProductId);
    $("#modalInpEdSubName").val(SubItemName);
    $("#modalInpEdSubPrice").val(SubItemPrice);
    $("#modalInpEdSubType").val(ProductType);
    $("#modalInpEdSubQty").val(SubItemQty);
    $("#modalInpEdSubUnit").val(SubItemUnit);

    $("#modalEdSaveSub").unbind();
    $("#modalEdSaveSub").click(function () {
      let SubItemName = $.trim($("#modalInpEdSubName").val());
      let SubItemPrice = $.trim($("#modalInpEdSubPrice").val());
      let SubItemQty = $.trim($("#modalInpEdSubQty").val());
      let SubItemUnit = $.trim($("#modalInpEdSubUnit").val());
      console.log(SubItemName);

      $.ajax({
        url: "/quotation/edit_subitem/" + SubItemId,
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({
          SubItemName: SubItemName,
          SubItemPrice: SubItemPrice,
          SubItemQty: SubItemQty,
          SubItemUnit: SubItemUnit,
        }),
        success: function () {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Edited",
            text: "Successfully Edit Sub-Item",
            showConfirmButton: false,
            timer: 1500,
          });
          tableSubItem.ajax.reload(null, false);
          tableItem.ajax.reload(null, false);
          ShowPro(QuotationId);
          $("#modalSubMaster").modal("hide");
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
    $(".close").click(function () {
      $("#modalSubMaster").modal("hide");
    });
  });

  //Delete Sub-Item
  $(document).on("click", "#btnDelSubItem", function () {
    $("#modalDeleteConfirm").modal("show");

    rows = $(this).closest("tr");
    let SubItemId = tableSubItem.rows(rows).data()[0].SubItemId;
    let QuotationId = tableSubItem.rows(rows).data()[0].QuotationId;
    $(".modal-title").text("Confirm Delete");
    $("#btnYes").unbind();
    $("#btnYes").click(function () {
      $.ajax({
        url: "/quotation/delete_subitem/" + SubItemId,
        method: "delete",
        contentType: "application/json",
        success: function () {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Deleted",
            text: "Successfully delete Sub-item",
            showConfirmButton: false,
            timer: 1500,
          });
          tableSubItem.ajax.reload(null, false);
          tableItem.ajax.reload(null, false);
          ShowPro(QuotationId);
        },
      });
      $("#modalDeleteConfirm").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalDeleteConfirm").modal("hide");
    });
  });
});
