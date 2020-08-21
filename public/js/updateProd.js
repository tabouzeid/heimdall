/* eslint-disable no-use-before-define */
$(document).ready(() => {
  const updateProduct = $('form.updateProduct');
  const productSku = $('#skuNum');
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

  // Populates the update form.
  function renderProdData(data) {
    $('#skuNum').text(`SKU: ${parseInt(data.sku, 10)}`).css('font-size', 25);
    $('#productName').attr('value', data.name);
    $('#quantity').attr('value', data.inventoryQuantity);
    $('#productDescription').attr('value', data.description);
    $('#cost').attr('value', data.currentPurchasePrice);
    $('#sellPrice').attr('value', data.currentSalePrice);
  }

  // When the form is submitted, The new values are passed into the update function which sends a put request.
  updateProduct.on('submit', (event) => {
    event.preventDefault();

    const updatedProdData = {
      sku: productSku.text().trim(),
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

    $.ajax({
      method: 'PUT',
      url: '/api/product',
      data: JSON.stringify(d),
      contentType: 'application/json',
      dataType: 'json',
    }).then(() => {
      window.location.replace('/inventory');
    }).catch((err) => {
      console.log(err); // sends a 200 and "OK", but does not UPDATE, or redirects.
    });
  }
});
