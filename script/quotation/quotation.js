$(document).ready(function () {
    //MOSTRAR
    function fill_company() {
        tableCompany = $('#tableCompany').DataTable({
            // "bDestroy": true,
            "ajax": {
                "url": '/company_master/data',
                "dataSrc": ""
            },
            "columns": [
                {
                    "data": "index"
                },
                {
                    "data": "QuotationNoId"
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
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditCompany' data-toggle='modal'  data-target='#modalCompanyMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelCompany' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                
            ],"columnDefs":[
                {
                    "targets": [6],
                    "visible": false
                },
            ],
        });
    }
    fill_company();

});