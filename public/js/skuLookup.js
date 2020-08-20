/* eslint-disable no-use-before-define */

$(document).ready(() => {
  const newSupplierItem = JSON.parse(localStorage.getItem('newSupplierItem'));
  $('input#sku').val(newSupplierItem.sku || 'test');
  $('input#productName').val(newSupplierItem.name || 'test');
  $('input#productDescription').val(newSupplierItem.productDesc || 'test');
  $('input#cost').val(newSupplierItem.sellPrice || 'test');

  $('#sku-search-btn').on('click', (event) => {
    event.preventDefault();
    const searchCategory = $('#category-search').val().trim();
    searchProduct(searchCategory);
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

    const suppInvData = {
      sku: $(`#sku-${myVal}`).text(),
      name: $(`#name-${myVal}`).text(),
      productDesc: $(`#desc-${myVal}`).text(),
      sellPrice: $(`#saleprice-${myVal}`).text(),
    };
    console.log("This Local Storage item is saved", suppInvData);
    localStorage.setItem('newSupplierItem', JSON.stringify(suppInvData));
    window.location.replace('/add/inventory');
    addSupplierInventory(suppInvData);
  });
});

function addSupplierInventory(newInventory) {
  // event.preventDefault();
  //console.log('Triggered add supplier inventory with SKU', newInventory.sku);
  const newSupplierItem = JSON.parse(localStorage.getItem('newSupplierItem'));
  console.log('From local storage, new item is: ', newSupplierItem);
  // $('input#sku').text(newInventory.sku);
  // $('input#sku').value = newInventory.sku;
  // $('input#sku').html(newSupplierItem.sku);
  $('input#sku').val(newSupplierItem.sku);
}

function searchProduct(category) {
  const homeAudioCategoryID = 'pcmcat241600050001';
  // const categoryIs = {
  //   'Home Audio': 'pcmcat241600050001',
  // };
  console.log('User select to filter by this cateogry: ', category);
  // const categoryURL = 'https://api.bestbuy.com/v1/products((categoryPath.id=pcmcat241600050001))?apiKey=vDloch7HfMAIbPtlLB2FE6Sp&sort=image.asc&show=categoryPath.name,image,name,salePrice,shortDescription,sku,thumbnailImage&format=json&pageSize=100';
  const categoryURL = `https://api.bestbuy.com/v1/products((categoryPath.id=${homeAudioCategoryID}))?apiKey=vDloch7HfMAIbPtlLB2FE6Sp&sort=image.asc&show=categoryPath.name,image,name,salePrice,shortDescription,sku,thumbnailImage&format=json&pageSize=100`;

  $.ajax({
    url: categoryURL,
    method: 'GET',
  }).then(productResult);
}

function productResult(productObj) {
  // console.log('Retrieved product resutls is', productObj);
  // console.log('Size of the array:', productObj.products.length);

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
    // Below, use jQUERY way, to find, for those ID equal to this product-well-i, then
    // Append the content to it. this is the same as
    // <div id = product-well-xxx>
    // -> add the sku, name, description..etc, via the append method
    $(`#product-well-${i}`).append(`<h2 id=sku-${i}>${productObj.products[i].sku}</h2>`);
    $(`#product-well-${i}`).append(`<h2 id=name-${i}>${productObj.products[i].name}</h2>`);
    $(`#product-well-${i}`).append(`<h2 id=desc-${i}>${productObj.products[i].shortDescription}</h2>`);
    $(`#product-well-${i}`).append(`<h2 id=saleprice-${i}>${productObj.products[i].salePrice}</h2>`);
    $(`#product-well-${i}`).append(`<button class="btn btn-primary add-inv-btn" data-inventory="${i}">Add This Inventory</button>`);
  }
}
