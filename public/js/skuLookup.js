/* eslint-disable no-use-before-define */

$(document).ready(() => {
  // Take the value from local storage, and attach these values on newInventory screen
  // newInventory.handlebars must define with skuLookup.js to see these local storage variable.
  const newSupplierItem = JSON.parse(localStorage.getItem('newSupplierItem'));
  $('input#sku').val(newSupplierItem.sku || '');
  $('input#productName').val(newSupplierItem.name || '');
  $('input#productDescription').val(newSupplierItem.productDesc || '');
  $('input#cost').val(newSupplierItem.sellPrice || '');

  // When clicked on goCurrent, takes user to current inventory page
  $('#goCurrent').click(() => {
    window.location.replace('/inventory');
  });

  $('#sku-search-btn').on('click', (event) => {
    event.preventDefault();
    // Value from user input search bar - May not even need this
    // const searchCategory = $('#category-search').val().trim();
    // Value from drop down category
    const listedCategory = $('#selectCategory').val().trim();
    // Clear the product details content
    $('#product-section').empty();
    searchProduct(listedCategory);
  });

  // Listener when click on Add Inventory
  // save the category they typed into the category-search input
  // Retrieve the value of that event, save in the object
  // console.log('user clicked on add this item', event);
  // window.location.replace('/add/inventory');

  $(document).on('click', '.add-inv-btn', function (event) {
    event.preventDefault();
    // Extract the data-inventory value associated with that Button
    // This data-inventory ID value is the same, as other sku-id, name-id value.
    // use jQuery to search for that sku-id element;if found, extract that text.
    const myVal = $(this).data('inventory');

    // Saved the selected product in object supplier Inventory Data (suppInvData)
    const suppInvData = {
      sku: $(`#sku-${myVal}`).text(),
      name: $(`#name-${myVal}`).text(),
      productDesc: $(`#desc-${myVal}`).text(),
      sellPrice: $(`#saleprice-${myVal}`).text(),
    };
    localStorage.setItem('newSupplierItem', JSON.stringify(suppInvData));
    window.location.replace('/add/inventory');
  });
});

function searchProduct(category) {
  // Use server-side proxy endpoint instead of direct API call
  const proxyURL = `/api/bestbuy/search/${encodeURIComponent(category)}`;

  $.ajax({
    url: proxyURL,
    method: 'GET',
  }).then(productResult);
}

function productResult(productObj) {
  // for each products that API replied back
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < productObj.to; i++) {
    // create a parent div for the oncoming elements
    const productSection = $('<div>');
    // add a class to this div: 'well'
    productSection.addClass('well');
    // add an id to the well to mark which well it is
    productSection.attr('id', `product-well-${i}`);
    // append the well to the well section
    $('#product-section').append(productSection);

    // Now add all of product data to the well we just placed on the page
    // Use safe jQuery DOM methods instead of template literals to prevent XSS
    const productWell = $(`#product-well-${i}`);

    $('<h3>').attr('id', `sku-${i}`).text(productObj.products[i].sku).appendTo(productWell);
    $('<h1>').attr('id', `name-${i}`).text(productObj.products[i].name).appendTo(productWell);
    $('<h2>').attr('id', `desc-${i}`).text(productObj.products[i].shortDescription).appendTo(productWell);
    $('<h2>').attr('id', `saleprice-${i}`).text(productObj.products[i].salePrice).appendTo(productWell);
    $('<button>')
      .addClass('btn btn-primary add-inv-btn mx-auto')
      .attr('data-inventory', i)
      .text('Add This Inventory')
      .appendTo(productWell);
  }
}
