/* eslint-disable no-use-before-define */
$(document).ready(() => {
  const updateProduct = $('form.updateProduct');
  const updatedProdName = $('input#productName');
  const updatedQuantity = $('input#quantity');
  const updatedProdDesc = $('input#productDescription');
  const updatedCost = $('input#cost');
  const updatedPrice = $('input#sellPrice');

  // Parses sku number from the URL
  const url = window.location.href.split('/');

  $.ajax({
    method: 'GET',
    url: `/api/product/${url[5]}`,
  }).then((res) => {
    renderProdData(res);
  });

  let z = 0;
  // Populates the update form.
  function renderProdData(data) {
    $('#skuNum').text(`SKU: ${data.sku}`).css('font-size', 25);
    $('#productName').attr('value', data.name);
    $('#quantity').attr('value', data.inventoryQuantity);
    $('#productDescription').attr('value', data.description);
    $('#cost').attr('value', data.currentPurchasePrice);
    $('#sellPrice').attr('value', data.currentSalePrice);
    z = data.sku;
    console.log(`this is the data.sku: ${z}`);
  }

  // When the form is submitted,
  // The new values are passed into the update function which sends a put request.
  updateProduct.on('submit', (event) => {
    event.preventDefault();

    const updatedProdData = {
      sku: z,
      productName: updatedProdName.val().trim(),
      quantity: updatedQuantity.val().trim(),
      productDesc: updatedProdDesc.val().trim(),
      cost: updatedCost.val().trim(),
      sellPrice: updatedPrice.val().trim(),
    };

    updateProductData(updatedProdData);
  });

  function updateProductData(updatedProdData) {
    const d = {
      sku: updatedProdData.sku,
      name: updatedProdData.productName,
      inventoryQuantity: updatedProdData.quantity,
      description: updatedProdData.productDesc,
      currentPurchasePrice: updatedProdData.cost,
      currentSalePrice: updatedProdData.sellPrice,
      minRequirement: 0,
    };

    // Update the record.
    $.ajax({
      method: 'PUT',
      url: '/api/product',
      data: JSON.stringify(d),
      contentType: 'application/json',
      dataType: 'json',
    });

    // Go to main inventory page. GET is called in newInventory.js.
    window.location.replace('/inventory');
  }
});
