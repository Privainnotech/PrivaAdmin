const appendCategory = (CategoryId, Category) => {
  $('#categoryList').append(`
      <li class="list-group-item p-1 d-flex justify-content-between align-items-center">
        <input class="form-control" value="${Category}" data-id="${CategoryId}" disabled />
        <button type="button" class="btnEditCategory ml-1 p-1 btn btn-sm btn-outline-warning">
          <i class="fa fa-pencil-square-o"></i>
        </button>
        <button type="button" class="btnDelCategory ml-1 p-1 btn btn-sm btn-outline-danger">
          <i class="fa fa-remove"></i>
        </button>
      </li>`);
};
const appendCategoryDropdown = (CategoryId, Category) => {
  $('#inpPricingCategory').append(
    `<option value="${CategoryId}">${Category}</option>`
  );
};

function handleCategoryChange() {
  if ($('#inpPricingCategory').val()) return $('#categoryGroup').hide();
  $('#inpPricingCategoryName').val('');
  $('#categoryGroup').show();
}

async function bindCategory() {
  //Add Category
  $('#addCategory').unbind();
  $('#addCategory').click(async function (e) {
    e.stopPropagation();
    let data = {
      Category: $('#inpCategory').val(),
    };

    try {
      let res = await AjaxDataJson(`/pricing_category`, 'post', data);
      SwalAddSuccess(res);
      getCategory();
      $('#inpCategory').val('');
    } catch (err) {
      SwalError(err);
    }
  });

  // Edit Category
  $('.btnEditCategory').unbind();
  $('.btnEditCategory').click(function (e) {
    e.stopPropagation();
    if ($(this).hasClass('btn-outline-warning')) {
      $(this).siblings('input').prop('disabled', false).focus();
      $(this).toggleClass('btn-outline-warning btn-primary btnEditCategory');
      $(this).children('i').toggleClass('fa-pencil-square-o fa-save');
    }
    $(this).click(async function () {
      let data = {
        Category: $(this).siblings('input').val(),
      };

      let CategoryId = $(this).siblings('input').attr('data-id');

      try {
        let res = await AjaxDataJson(
          `/pricing_category/${CategoryId}`,
          'put',
          data
        );
        SwalEditSuccess(res);
        $(this).siblings('input').prop('disabled', true);
        $(this).toggleClass('btn-outline-warning btn-primary btnEditCategory');
        $(this).children('i').toggleClass('fa-pencil-square-o fa-save');
        getCategory();
      } catch (err) {
        SwalError(err);
      }
    });
  });

  //Delete Category
  $('.btnDelCategory').unbind();
  $('.btnDelCategory').click(async function (e) {
    e.stopPropagation();
    let CategoryId = $(this).siblings('input').attr('data-id');
    console.log(CategoryId);
    try {
      let res = await AjaxDelete(`/pricing_category/${CategoryId}`);
      SwalDeleteSuccess(res);
      getCategory();
    } catch (error) {
      SwalError(error);
    }
  });
}

async function getCategory() {
  const res = await AjaxGetData(`/pricing_category`);
  $('#categoryList').empty();
  $('#inpPricingCategory').html(
    '<option value="" selected>New Category</option>'
  );
  res.forEach((category) => {
    const { CategoryId, Category } = category;
    appendCategory(CategoryId, Category);
    appendCategoryDropdown(CategoryId, Category);
  });
  // $('#categoryDropdown button').on('click', function (e) {
  //   e.stopPropagation();
  // });
  bindCategory();
}

$(document).ready(function () {
  getCategory();
});
