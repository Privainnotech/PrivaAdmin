$(document).ready(function () {
    let url = '/company/data';
    let option = null;
    let CompanyId, CompanyName, CompanyAddress, CompanyEmail, CompanyTel, data;
    //MOSTRAR
    function fill_company() {
        tableCompany = $('#tableCompany').DataTable({
            "bDestroy": true,
            "ajax": {
                "url": url,
                "dataSrc": ""
            },
            "columns": [
                {
                    "data": "index"
                },
                {
                    "data": "CompanyName"
                },
                {
                    "data": "CompanyAddress"
                },
                {
                    "data": "CompanyEmail"
                },
                {
                    "data": "CompanyTel"
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditAx' data-toggle='modal'  data-target='#modalCompany'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelCom' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "CompanyId"
                }

            ],"columnDefs":[
                {
                    "targets": [6],
                    "visible": false
                },
            ],
        });
    }
    fill_company()
    
    //CREATE
    $("#addCompany").click(function () {
        option = 'create';
        id = null;
        $("#formCompany").trigger("reset");
        $(".modal-title").text("Add Company");
    });
    //EDITER
    
});