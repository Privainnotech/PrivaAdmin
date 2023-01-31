const createEditor = () => {
    let toolbarOption = [
        // [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
    ]
    let options = {
        // debug: 'info',
        modules: {
            toolbar: toolbarOption
        },
        placeholder: 'ตัวอย่างการพิมพ์\n1 รายละเอียด; จำนวน หน่วย; ราคา',
        theme: 'snow',
        readOnly: false
    }
    let quill = new Quill('#editor', options)
    $('.ql-editor').on('keyup', () => {
        console.log($('.ql-editor').children().length)
    })
}

$(document).ready(function () {
    createEditor();

    var max_fields = 10; //maximum input boxes allowed
    var wrapper = $(".input_fields_wrap"); //Fields wrapper
    var add_button = $(".add_field_button"); //Add button ID

    var x = 1; //initlal text box count
    $(add_button).click(function (e) { //on add input button click
        e.preventDefault();
        if (x < max_fields) { //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div class="input-group mb-3"><input placeholder="Enter Price" type="text" name="mytext[]" class="form-control"><div class="input-group-append"><button class="btn btn-outline-danger remove_field" type="button">Remove</button></div></div>'); //add input box
        }
    });

    $(wrapper).on("click", ".remove_field", function (e) { //user click on remove text
        e.preventDefault(); $(this).parent('div').parent('div').remove(); x--;
    })
});


