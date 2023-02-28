const $fieldProject = $(
  "#PJ_Name, #PJ_Discount, #PJ_End_Customer, #PJ_Validity, #PJ_Delivery, #PJ_Remark, #PJ_Approve, #CusName"
);
const $SettingTable = $(
  "#IP-Set-TableShow, #IP-Set-TablePrice, #IP-Set-TableQty, #IP-Set-TableTotal"
);
const $StatusButton = $("#btn-cancel, #btn-quotation, #btn-book, #btn-loss");
const $EditGroup = $("#modalEditProject, #btnExample,#btnRevised");
// let loadDetail = null;
let $LoadingPreview = $("#loading-preview").hide();
$("#loading-close").on("click", function () {
  $LoadingPreview.hide();
});

//Hide Setting
function hideSetting() {
  $("#modalSaveSetting").hide();
  $SettingTable.attr("disabled", "disabled");
}

//Show Setting
function ShowSetting() {
  $("#modalSaveSetting").show();
  $SettingTable.removeAttr("disabled");
}

//Show Project
function ShowPro(QuotationId) {
  $.ajax({
    url: "/quotation/" + QuotationId,
    method: "get",
    cache: false,
    success: function (response) {
      let obj = JSON.parse(response);
      // console.log(obj);
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
        QuotationStatus,
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
      //dropdown customer
      $.ajax({
        url: `/dropdown/customer`,
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (res) {
          if (res.length == 0) {
            $("#CusName option").remove();
            $("#CusName").append("<option value=''>No data</option>");
            $("#CusName").attr("disabled", "");
          } else {
            $("#CusName option").remove();
            $("#CusName optgroup").remove();
            // $("#CusName").append("<option value=''></option> ");
            res.forEach((obj) => {
              if (obj.CustomerId == CustomerId) {
                $("#CusName").append(
                  `<option value='${obj.CustomerId}' selected>${obj.CustomerName}</option>`
                );
              } else {
                $("#CusName").append(
                  `<option value='${obj.CustomerId}'>${obj.CustomerName}</option>`
                );
              }
            });
          }
        },
        error: function (err) {
          $("#CusName option").remove();
          $("#CusName").append("<option value='No data'>");
          $("#CusNameIp").attr("disabled", "");
        },
      });
      $("#CusName").val(CustomerId);
      $("#QDate").val(QuotationDate || "-");
      $("#CusEmail").val(CustomerEmail);
      $("#ComName").val(CompanyName);
      $("#Adress").val(CompanyAddress);

      $("#PJ_Name").val(QuotationSubject);
      $("#PJ_Discount").val(QuotationDiscount);
      $("#PJ_Validity").val(QuotationValidityDate);
      let PayTermLength, PayTermDetail, PayTermPercent, PayTermForecast;
      !Array.isArray(QuotationPayTerm)
        ? (PayTermLength = Object.keys(QuotationPayTerm).length)
        : (PayTermLength = QuotationPayTerm.length);
      $(".box-payment .row").remove();
      if (PayTermLength != 0) {
        // console.log("QuotationPayTerm:", QuotationPayTerm);
        for (let i = 1; i <= PayTermLength; i++) {
          // console.log(QuotationPayTerm)
          if (!Array.isArray(QuotationPayTerm)) {
            PayTermDetail = QuotationPayTerm[`QuotationPayTerm${i}`];
            PayTermPercent = "0";
            PayTermForecast = "";
          } else {
            PayTermDetail = QuotationPayTerm[i - 1].PayTerm;
            PayTermPercent = QuotationPayTerm[i - 1].PayPercent;
            PayTermForecast = QuotationPayTerm[i - 1].PayForecast || "";
          }
          $(".box-payment").append(`
            <div class="row mb-3">
              <div class="col">
                <div class="input-group input-group-sm mb-1">
                  <input type="text" class="form-control mb-0 me-3 payment" value="${PayTermDetail}" disabled>
                  <input type="number" class=" mb-0 me-1 payment" value="${PayTermPercent}" disabled>
                  <span class="input-group-text bg-white border-0">%</span>
                </div>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white border-0 fw-bold">Payment Forecast: </span>
                  <input type="date" class="form-control  mb-0 payment" value="${PayTermForecast}" disabled>
                  <button class="btn btn-primary payment btn-edit-date-payment" ><i class="fas fa-edit"></i></button>
                </div>
              </div>
              <div class="col-auto px-1">
                <button class="btn btn-sm btn-danger payment btn-del-payment" disabled style="display: none;"><i class="fa fa-remove"></i></button>
              </div>
            </div>
        `);
        }
      }

      $("#PJ_Delivery").val(QuotationDelivery);
      $("#PJ_Remark").val(QuotationRemark);
      $("#PJ_End_Customer").val(EndCustomer);
      $("#PJ_Approve").val(EmployeeApproveId);

      $("#TotalPrice").val(QuotationTotalPrice.toLocaleString());
      $("#PriceAfter").val(QuotationNet.toLocaleString());
      $("#Vat").val(QuotationVat.toLocaleString());
      $("#NetTotal").val(QuotationNetVat.toLocaleString());

      // setting show status
      $("#IP-Set-TableShow").val(TableShow);
      $("#IP-Set-TablePrice").val(TablePrice);
      $("#IP-Set-TableQty").val(TableQty);
      $("#IP-Set-TableTotal").val(TableTotal);
      $("#IP-Set-DetailShow").val(DetailShow);
      $("#IP-Set-DetailQty").val(DetailQty);
      $("#IP-Set-DetailTotal").val(DetailTotal);

      // getDetail(New)
      QuotationStatus == 1 ? createEditor() : createEditor(true);
      $(".ql-editor").empty();
      $(".ql-editor").append(QuotationDetail);

      //  Edit Detail
      const saveButton = document.getElementById("save-button");
      saveButton.addEventListener("click", () => {
        $("#modalEditConfirm").modal("show");
        $(".modal-title").text("Confirm Edit Detail");
        let data = { QuotationDetail: $(".ql-editor").html() };

        $("#btnEditYes").unbind();
        $("#btnEditYes").click(async function () {
          try {
            let res = await AjaxDataJson(
              `/quotation/edit_detail/${QuotationId}`,
              `put`,
              data
            );
            SwalEditSuccess(res);
          } catch (error) {
            SwalError(error);
          }
          $("#modalEditConfirm").modal("hide");
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
  // Button
  $("#btn-approve").hide();
  $("#addItem").hide();
  $("#modalSaveSetting").hide();
  $("#save-button").hide();
  $("#btn_AddPayment").hide();
  $EditGroup.addClass("invisible");

  // Fill Data
  $("#ProNo").html("Project NO.");
  $(".box-payment .row").remove();
  $fieldProject.val("-");
  $("#QDate,#CusEmail,#ComName,#Adress").val("-");
  $("#TotalPrice,#PriceAfter,#Vat,#NetTotal").val("-");
  $SettingTable.val("0").attr("disabled", "");
  $StatusButton.attr("disabled", "");

  // reset table
  fill_resetTable();
  fill_resetSubTable();
  createEditor(true);
}

//Reset Quo Table
function fill_resetQuoTable() {
  var trHTML = "";
  trHTML += "<tr>";
  trHTML += '<td colspan="6">please select a project...</td>';
  trHTML += "</tr>";
  $("#showQuoTable").html(trHTML);
}
//Reset Item Table
function fill_resetTable() {
  var trHTML = "";
  trHTML += "<tr>";
  trHTML += '<td colspan="5">please select a quatation...</td>';
  trHTML += "</tr>";
  document.getElementById("showTable").innerHTML = trHTML;
}
//Reset Sub-Item Table
function fill_resetSubTable() {
  var trHTML = "";
  trHTML += "<tr>";
  trHTML += '<td colspan="5">please select a item...</td>';
  trHTML += "</tr>";
  document.getElementById("showSubTable").innerHTML = trHTML;
}
// getDetail New
const createEditor = (readStatus = false) => {
  let toolbarOption = [["bold", "underline"]];
  let options = {
    modules: {
      toolbar: toolbarOption,
    },
    placeholder: !readStatus
      ? "ตัวอย่างการพิมพ์: 1 รายละเอียด; จำนวน หน่วย; ราคา"
      : "",
    theme: "snow",
    // readOnly: readStatus,
  };
  if ($(".ql-toolbar.ql-snow")) $(".ql-toolbar.ql-snow").remove();
  $(".ql-editor").empty();
  let quill = new Quill("#editorjs", options);
  if (readStatus) $(".ql-toolbar.ql-snow").remove();
  quill.enable(!readStatus);
};

$(document).ready(function () {
  RePro();
  fill_quotationHead();
  searchTableQuoHead();
  fill_quotation();
  fill_resetQuoTable();

  //======================== Quotation =============================//
  $("#CusName").change(async (e) => {
    let CusId = $("#CusName").val();
    let data = await AjaxGetData(`/dropdown/customer/${CusId}`);
    let { CompanyAddress, CompanyName, CustomerEmail } = data;
    $("#CusEmail").val(CustomerEmail);
    $("#Adress").val(CompanyAddress);
    $("#ComName").val(CompanyName);
  });
  //Create Project
  $("#addProject").unbind();
  $("#addProject").on("click", function () {
    $("#modalQuotationMaster").modal("show");
    $("#formQuotation").trigger("reset");
    $(".modal-title").text("Add Project");

    $("#modalSaveProject").unbind();
    $("#modalSaveProject").click(async function () {
      let data = {
        QuotationSubject: $("#modalInpProjectName").val(),
        CustomerId: $("#modalInpCustomerId").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/quotation/add_pre_quotation`,
          `post`,
          data
        );
        SwalAddSuccess(res);
        tableQuoHead.ajax.reload(null, false);
        tableQuo.ajax.reload(null, false);
        RePro();
        fill_resetQuoTable();
        $("#modalQuotationMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close,.no").click(function () {
      $("#modalQuotationMaster").modal("hide");
    });
  });
  //clickTableQuotationHead
  $("#tableQuoHead tbody").unbind();
  $("#tableQuoHead tbody").on("click", "tr", function () {
    fill_resetTable();
    fill_resetQuoTable();
    RePro();
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
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
  $("#tableQuo").on("click", "#btnDelProject", async function () {
    let rows = $(this).closest("tr");
    let { QuotationId } = tableQuo.row(rows).data();
    try {
      let res = await AjaxDelete(`/quotation/delete_quotation/${QuotationId}`);
      SwalDeleteSuccess(res);
      tableQuoHead.ajax.reload(null, false);
      tableQuo.ajax.reload(null, false);
      fill_resetQuoTable();
      RePro();
    } catch (error) {
      SwalError(error);
    }
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
    $(".btn-save-date-payment").hide();

    let rows = $(this).closest("tr");
    let { QuotationId, QuotationApproval, QuotationStatus } = tableQuo
      .row(rows)
      .data();

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      RePro();
    } else {
      $("#tableQuo tr").removeClass("selected");
      $(this).addClass("selected");

      // $("#save-button").hide();
      $("#modalEditProject").removeClass("save");
      $("#btnExample").removeClass("invisible");
      createEditor(true);
      ShowPro(QuotationId);
      fill_item(QuotationId, QuotationStatus);

      $(document).on("click", ".btn-edit-date-payment", function (e) {
        $(this).hide();
        $($(this).siblings()[0]).removeAttr("disabled");
        $(".btn-save-date-payment").show();
      });
      $(".btn-save-date-payment").unbind();
      $(".btn-save-date-payment").on("click", async function (e) {

        let QuotationPayTerm = [];
        let rowTerm = $(".box-payment").children();
        if (rowTerm != 0) {
          for (let i = 0; i < rowTerm.length; i++) {
            let row = $(rowTerm[i]).children();
            let col = $(row[0]).children();
            let group2 = col[1];
            let pay_forecast = $(group2).children()[1].value;
            QuotationPayTerm.push({ PayForecast: pay_forecast, });
          }
        }
        let Data = { QuotationPayTerm: QuotationPayTerm };
        console.log(Data)
        try {
          let res = await AjaxDataJson(`/quotation/edit_payforecast/${QuotationId}`, `put`, Data);
          SwalEditSuccess(res);
          $(this).hide();
          $(".btn-edit-date-payment").show();
          $(`input[type='date'].payment`).attr('disabled', '')
          // $('.btn-edit-date-payment').attr('disabled','')
        } catch (error) {
          SwalError(error)
        }
      });
      if (QuotationStatus === 1) {
        //Show Edit Button
        $EditGroup.removeClass("invisible");
        $("#btnRevised").addClass("invisible");
        //Show AddItem Button
        $("#addItem").show();
        //Show Quotation Button
        $StatusButton.attr("disabled", "");
        $("#btn-quotation").removeAttr("disabled");
        //Show Detail Custom Button
        $("#save-button").show();
        //Show Setting
        ShowSetting();

        // Edit Ouotation
        $("#modalEditProject").unbind();
        $("#modalEditProject").click(function () {
          if ($("#modalEditProject").hasClass("save")) {
            $("#modalEditConfirm").modal("show");
            $(".modal-title").text("Confirm Save Edit Project");

            $("#btnEditYes").unbind();
            $("#btnEditYes").click(async function () {
              let QuotationPayTerm = [];
              let rowTerm = $(".box-payment").children();
              console.log("Term : ", rowTerm);
              if (rowTerm != 0) {
                for (let i = 0; i < rowTerm.length; i++) {
                  let row = $(rowTerm[i]).children();
                  let col = $(row[0]).children();
                  let group1 = col[0];
                  let group2 = col[1];
                  let pay_detail = $(group1).children()[0].value;
                  let pay_percent = $(group1).children()[1].value;
                  let pay_forecast = $(group2).children()[1].value;

                  if (pay_detail) {
                    QuotationPayTerm.push({
                      PayTerm: pay_detail,
                      Percent: parseInt(pay_percent) || 0,
                      PayForecast: pay_forecast,
                    });
                  }
                }
              } else {
                QuotationPayTerm.push({
                  PayTerm: "",
                  Percent: 0,
                  PayForecast: "",
                });
              }
              console.log(QuotationPayTerm);
              let data = {
                CustomerId: $("#CusName").val(),
                QuotationSubject: $("#PJ_Name").val(),
                QuotationDiscount: $("#PJ_Discount").val(),
                QuotationValidityDate: $("#PJ_Validity").val(),
                QuotationPayTerm: QuotationPayTerm,
                QuotationDelivery: $("#PJ_Delivery").val(),
                QuotationRemark: $("#PJ_Remark").val(),
                EndCustomer: $("#PJ_End_Customer").val(),
                EmployeeApproveId: $("#PJ_Approve").val(),
              };

              try {
                let res = await AjaxDataJson(
                  `/quotation/edit_quotation/${QuotationId}`,
                  `put`,
                  data
                );
                SwalEditSuccess(res);
                tableQuo.ajax.reload(null, false);
                tableQuoHead.ajax.reload(null, false);
                ShowPro(QuotationId);
                $("#modalEditProject").removeClass("save");
                $("#btn-text").text("Edit");
                $fieldProject.attr("disabled", "");
                $("#btn_AddPayment").hide();
                $(".payment").attr("disabled", "");
              } catch (error) {
                SwalError(error);
              }
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
            $(".btn-del-payment").show();
            $(".btn-edit-date-payment,.btn-save-date-payment").hide();

            $("#btn_AddPayment").show();
            $("#btn_AddPayment").unbind();
            $("#btn_AddPayment").click(function () {
              $(".box-payment").append(`
              <div class="row mb-3">
                <div class="col">
                  <div class="input-group input-group-sm mb-1">
                    <input type="text" class="form-control mb-0 me-3 payment" value="">
                    <input type="number" class=" mb-0 me-1 payment" value="">
                    <span class="input-group-text bg-white border-0">%</span>
                  </div>
                  <div class="input-group input-group-sm">
                    <input type="date" class="form-control  mb-0 payment" value="">
                    <button class="btn btn-primary payment btn-edit-date-payment" style="display: none;"><i class="fas fa-edit"></i></button>
                  </div>
                </div>
                <div class="col-auto px-1">
                  <button class="btn btn-sm btn-danger payment btn-del-payment" ><i class="fa fa-remove"></i></button>
                </div>
              </div>
                
                
              `);
              $(".btn-del-payment").unbind();
              $(".btn-del-payment").click(function (e) {
                $(this).parent().parent().remove();
              });
            });

            $(".btn-del-payment").unbind();
            $(".btn-del-payment").click(function (e) {
              $(this).parent().parent().remove();
            });
          }
        });
        // Save Setting
        $("#modalSaveSetting").unbind();
        $("#modalSaveSetting").on("click", function () {
          $("#modalSettingConfirm").modal("show");

          $(".modal-title").text("Confirm Setting");
          $("#btnSettingYes").unbind();
          $("#btnSettingYes").click(async function () {
            let data = {
              TableShow: $("#IP-Set-TableShow").val(),
              TablePrice: $("#IP-Set-TablePrice").val(),
              TableQty: $("#IP-Set-TableQty").val(),
              TableTotal: $("#IP-Set-TableTotal").val(),
            };
            try {
              let res = await AjaxDataJson(
                `/quotation/edit_setting/${QuotationId}`,
                `put`,
                data
              );
              SwalEditSuccess(res);
              $("#modalSettingConfirm").modal("hide");
            } catch (error) {
              SwalError(error);
            }
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
        $EditGroup.removeClass("invisible");
        $("#modalEditProject").addClass("invisible");
        //AddItem button
        $("#addItem").hide();

        hideSetting();

        $StatusButton.removeAttr("disabled");
        $("#btn-quotation").attr("disabled", "");
      }

      // Status booking
      if (QuotationStatus === 3) {
        $("#btn-text").text("Edit");
        //Eidt button
        $EditGroup.removeClass("invisible");
        $("#modalEditProject").addClass("invisible");
        //AddItem button
        $("#addItem").hide();

        hideSetting();
        $StatusButton.removeAttr("disabled");
        $("#btn-book").attr("disabled", "");
      }

      // Status loss
      if (QuotationStatus === 4) {
        $("#btn-text").text("Edit");
        //Eidt button
        $EditGroup.removeClass("invisible");
        $("#modalEditProject").addClass("invisible");
        //AddItem button
        $("#addItem").hide();

        hideSetting();

        $StatusButton.removeAttr("disabled");
        $("#btn-loss").attr("disabled", "");
      }

      // Status cancel
      if (QuotationStatus === 5) {
        $("#btn-text").text("Edit");
        //Eidt button
        $EditGroup.removeClass("invisible");
        $("#modalEditProject").addClass("invisible");
        //AddItem button
        $("#addItem").hide();

        hideSetting();

        $StatusButton.removeAttr("disabled");
        $("#btn-cancel").attr("disabled", "");
      }

      // Revised
      $("#btnRevised").unbind();
      $("#btnRevised").on("click", function () {
        $("#modalRevisedConfirm").modal("show");

        $(".modal-title").text("Confirm Revised");
        $("#btnREYes").unbind();
        $("#btnREYes").click(async function () {
          try {
            let res = await AjaxDataJson(
              `/quotation_set/revise/${QuotationId}`,
              `get`
            );
            SwalSuccess(res);
            tableQuo.ajax.reload(null, false);
            RePro();
          } catch (error) {
            SwalError(error);
          }
          $("#modalRevisedConfirm").modal("hide");
        });
        $(".close,.no").click(function () {
          $("#modalRevisedConfirm").modal("hide");
        });
      });

      // Preview PDF
      $("#btnExample").unbind();
      $("#btnExample").on("click", async function () {
        await $.ajax({
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
            // document.getElementById("PreviewPDF").src = "";
            // $('#PreviewPDF').attr('src',``);
            QuotationApproval == 2
              ? $("#btnReqApprove").hide()
              : $("#btnReqApprove").show();
            $("#modalPreview").modal("show");
            $(".modal-title").text("Preview PDF");
            fileName = success.message;
            // document.getElementById("PreviewPDF").src = fileName + "#toolbar=0";
            // $("#PreviewPDF").attr("src", `${fileName}#toolbar=0`);
            $("#PreviewPDF").replaceWith(`
            <iframe id="PreviewPDF" src="${fileName}#toolbar=0" width="100%" height="500px"></iframe>
            `)
            $("#loading-preview i").removeClass("fa-check-circle");
            //
          },
          error: function (err) {
            SwalError(err);
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
      $("#btnDownload").on("click", async function () {
        try {
          let res = await AjaxDataJson(
            `/quotation_report/download/${QuotationId}`
          );
          window.open("/quotation_report/download/" + QuotationId);
        } catch (error) {
          SwalError(error);
        }
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
      $("#btn-approve").on("click", async function () {
        let data = {
          QuotationId: QuotationId,
          EmployeeApproveId: $("#PJ_Approve").val(),
        };
        try {
          let res = await AjaxDataJson(
            `/quotation_approval/approve`,
            `put`,
            data
          );
          SwalSuccess(res);
          ShowPro(QuotationId);
        } catch (error) {
          SwalError(error);
        }
      });

      //btn-quotation
      $("#btn-quotation").unbind();
      $("#btn-quotation").on("click", function () {
        $("#modalStatusConfirm").modal("show");

        $(".modal-title").text("Confirm Set Status Quotation");

        $("#btnSetYes").unbind();
        $("#btnSetYes").click(async function () {
          try {
            let res = await AjaxDataJson(
              `/quotation_set/quotation/${QuotationId}`,
              `get`
            );
            SwalSuccess(res);
            tableQuo.ajax.reload(null, false);
            tableQuoHead.ajax.reload(null, false);
            ShowPro(QuotationId);
            $EditGroup.removeClass("invisible");
            $("#modalEditProject").addClass("invisible");
            //AddItem button
            $("#addItem").hide();
            hideSetting();
            $StatusButton.removeAttr("disabled");
            $("#btn-quotation").attr("disabled", "");
          } catch (error) {
            SwalError(error);
          }
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
        $("#btnSetYes").click(async function () {
          try {
            let res = await AjaxDataJson(
              `/quotation_set/cancel/${QuotationId}`,
              `get`
            );
            SwalSuccess(res);
            tableQuo.ajax.reload(null, false);
            tableQuoHead.ajax.reload(null, false);
            $("#btn-quotation,#btn-loss,#btn-book").removeAttr("disabled");
            $("#btn-cancel").attr("disabled", "");
          } catch (error) {
            SwalError(error);
          }
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
        $("#btnSetYes").click(async function () {
          try {
            let res = await AjaxDataJson(
              `/quotation_set/booking/${QuotationId}`,
              `get`
            );
            SwalSuccess(res);
            tableQuo.ajax.reload(null, false);
            tableQuoHead.ajax.reload(null, false);
            $("#btn-quotation,#btn-loss,#btn-cancel").removeAttr("disabled");
            $("#btn-book").attr("disabled", "");
          } catch (error) {
            SwalError(error);
          }
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
        $("#btnSetYes").click(async function () {
          try {
            let res = await AjaxDataJson(
              `/quotation_set/loss/${QuotationId}`,
              `get`
            );
            SwalSuccess(res);
            tableQuo.ajax.reload(null, false);
            tableQuoHead.ajax.reload(null, false);
            $("#btn-quotation,#btn-book,#btn-cancel").removeAttr("disabled");
            $("#btn-loss").attr("disabled", "");
          } catch (error) {
            SwalError(error);
          }
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
        $("#modalAddItem").click(async function () {
          let data = {
            ItemName: $("#modalInpAddItemName").val(),
            ItemPrice: $("#modalInpAddItemPrice").val(),
            ItemQty: $("#modalInpAddQty").val(),
            ItemDescription: $("#modalInpAddDetails").val(),
          };
          try {
            let res = await AjaxDataJson(
              `/quotation/add_item/${QuotationId}`,
              `post`,
              data
            );
            SwalAddSuccess(res);
            tableItem.ajax.reload(null, false);
            ShowPro(QuotationId);
            $("#modalAddItemMaster").modal("hide");
          } catch (error) {
            SwalError(error);
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
  $("#tableItem").unbind();
  $("#tableItem").on("click", "#btnEditItem", function () {
    $("#modalItemMaster").modal("show");
    $("#formEditItem").trigger("reset");
    $(".modal-title").text("Edit Item");

    let rows = $(this).closest("tr");
    let { ItemId, ItemName, ItemPrice, ItemQty, QuotationId } = tableItem
      .row(rows)
      .data();

    $("#modalInpItemName").val(ItemName);
    $("#modalInpItemPrice").val(ItemPrice);
    $("#modalInpQty").val(ItemQty);

    $("#modalEditItem").unbind();
    $("#modalEditItem").click(async function () {
      let data = {
        ItemName: $("#modalInpItemName").val(),
        ItemPrice: $("#modalInpItemPrice").val(),
        ItemQty: $("#modalInpQty").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/quotation/edit_item/${ItemId}`,
          `put`,
          data
        );
        SwalEditSuccess(res);
        tableItem.ajax.reload(null, false);
        ShowPro(QuotationId);
        $("#modalItemMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close").click(function () {
      $("#modalItemMaster").modal("hide");
    });
  });

  //Delete Item
  $("#tableItem").on("click", "#btnDelItem", async function () {
    let rows = $(this).closest("tr");
    let { ItemId, QuotationId } = tableItem.row(rows).data();

    try {
      let res = await AjaxDelete(`/quotation/delete_item/${ItemId}`);
      SwalDeleteSuccess(res);
      tableItem.ajax.reload(null, false);
      fill_resetSubTable();
      ShowPro(QuotationId);
    } catch (error) {
      SwalError(error);
    }
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
  $("#tableItem tbody").unbind();
  $("#tableItem tbody").on("click", "tr", function () {
    let rows = $(this).closest("tr");
    let { ItemId, ItemName, QuotationStatus, QuotationId } = tableItem
      .row(rows)
      .data();

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      fill_resetSubTable();
    } else {
      $("#tableItem tr").removeClass("selected");
      $(this).toggleClass("selected");
      fill_subitem(ItemId, QuotationStatus);
    }

    //Add Sub-Item
    $("#tableItem").on("click", "#btnSubItem", function () {
      $("#modalAddSubMaster").modal("show");
      $("#formSub").trigger("reset");
      $(".modal-title").text("Add Description in " + ItemName);
      $("#modalSaveSub").unbind();
      $("#modalSaveSub").click(async function () {
        let data = {
          ProductId: $("#modalInpProduct").val(),
          SubItemName: $("#modalInpSubName").val(),
          SubItemPrice: $("#modalInpSubPrice").val(),
          ProductType: $("#modalInpSubType").val(),
          SubItemQty: $("#modalInpSubQty").val(),
          SubItemUnit: $("#modalInpSubUnit").val(),
        };
        try {
          let res = await AjaxDataJson(
            `/quotation/add_subitem/${ItemId}`,
            `post`,
            data
          );
          SwalAddSuccess(res);
          tableSubItem.ajax.reload(null, false);
          tableItem.ajax.reload(null, false);
          ShowPro(QuotationId);
          $("#modalAddSubMaster").modal("hide");
        } catch (error) {
          SwalError(error);
        }
      });
      $(".close").click(function () {
        $("#modalAddSubMaster").modal("hide");
      });
    });
  });

  //Edit Sub-Item
  $("#showSubTable").unbind();
  $("#showSubTable").on("click", "#btnEditSubItem", function () {
    $("#modalSubMaster").modal("show");

    $("#formSub").trigger("reset");
    $(".modal-title").text("Edit Description");
    let rows = $(this).closest("tr");
    let {
      SubItemId,
      ProductId,
      SubItemName,
      SubItemPrice,
      ProductType,
      SubItemQty,
      SubItemUnit,
      QuotationId,
    } = tableSubItem.row(rows).data();

    $("#modalInpEdProduct").val(ProductId);
    $("#modalInpEdSubName").val(SubItemName);
    $("#modalInpEdSubPrice").val(SubItemPrice);
    $("#modalInpEdSubType").val(ProductType);
    $("#modalInpEdSubQty").val(SubItemQty);
    $("#modalInpEdSubUnit").val(SubItemUnit);

    $("#modalEdSaveSub").unbind();
    $("#modalEdSaveSub").click(async function () {
      let data = {
        SubItemName: $("#modalInpEdSubName").val(),
        SubItemPrice: $("#modalInpEdSubPrice").val(),
        SubItemQty: $("#modalInpEdSubQty").val(),
        SubItemUnit: $("#modalInpEdSubUnit").val(),
      };
      try {
        let res = await AjaxDataJson(
          `/quotation/edit_subitem/${SubItemId}`,
          `put`,
          data
        );
        SwalEditSuccess(res);
        tableSubItem.ajax.reload(null, false);
        tableItem.ajax.reload(null, false);
        ShowPro(QuotationId);
        $("#modalSubMaster").modal("hide");
      } catch (error) {
        SwalError(error);
      }
    });
    $(".close").click(function () {
      $("#modalSubMaster").modal("hide");
    });
  });

  //Delete Sub-Item
  $("#showSubTable").on("click", "#btnDelSubItem", async function () {
    let rows = $(this).closest("tr");
    let { SubItemId, QuotationId } = tableSubItem.row(rows).data();
    try {
      let res = await AjaxDelete(`/quotation/delete_subitem/${SubItemId}`);
      SwalDeleteSuccess(res);
      tableSubItem.ajax.reload(null, false);
      tableItem.ajax.reload(null, false);
      ShowPro(QuotationId);
    } catch (error) {
      SwalError(error);
    }
  });
});
