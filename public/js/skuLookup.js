/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
$(document).ready(() => {
  $('#sku-search-btn').on('click', () => {
    // save the category they typed into the category-search input
    const searchCategory = $('#category-search').val().trim();
    console.log('user type serach cateogry', searchCategory);
    searchProduct(searchCategory);
  });
});

function searchProduct(category) {
  const homeAudioCategoryID = 'pcmcat241600050001';
  const categoryIs = {
    'Home Audio': 'pcmcat241600050001',
  };
  console.log('Inside search product, category', category);

  // const categoryURL = 'https://api.bestbuy.com/v1/products((categoryPath.id=pcmcat241600050001))?apiKey=vDloch7HfMAIbPtlLB2FE6Sp&sort=image.asc&show=categoryPath.name,image,name,salePrice,shortDescription,sku,thumbnailImage&format=json&pageSize=100';
  const categoryURL = `https://api.bestbuy.com/v1/products((categoryPath.id=${homeAudioCategoryID}))?apiKey=vDloch7HfMAIbPtlLB2FE6Sp&sort=image.asc&show=categoryPath.name,image,name,salePrice,shortDescription,sku,thumbnailImage&format=json&pageSize=100`;

  $.ajax({
    url: categoryURL,
    method: 'GET',
  }).then(productResult);
}

function productResult(productObj) {
  console.log('Retrieved product resutls is', productObj);
  console.log('Size of the array:', productObj.products.length);

  // for each products that API replied back
  for (let i = 0; i < productObj.to; i++) {
    // create a parent div for the oncoming elements
    const productSection = $('<div>');
    // add a class to this div: 'well'
    productSection.addClass('well');
    // add an id to the well to mark which well it is
    productSection.attr('id', `product-well-${i}`);
    // append the well to the well section
    $('#product-section').append(productSection);
    console.log('In the end of FOR loop:', i, 'product section is:', productSection);

    // Now add all of product data to the well we just placed on the page
    console.log('Before append, the product is: ', productObj.products[i]);

    $(`#product-well-${i}`).append(`<h2>SKU: ${productObj.products[i].sku}</h2>`);
    $(`#product-well-${i}`).append(`<h2>Name: ${productObj.products[i].name}</h2>`);
    $(`#product-well-${i}`).append(`<h2>Description: ${productObj.products[i].shortDescription}</h2>`);
    $(`#product-well-${i}`).append(`<h2>SalePrice: ${productObj.products[i].salePrice}</h2>`);
  }
}
