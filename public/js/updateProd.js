/* eslint-disable no-use-before-define */
$(document).ready(() => {
  const updateProduct = $('form.updateProduct');
  // const productSku = $('#skuNum');
  const updatedProdName = $('input#productName');
  const updatedQuantity = $('input#quantity');
  const updatedProdDesc = $('input#productDescription');
  const updatedCost = $('input#cost');
  const updatedPrice = $('input#sellPrice');

  // When clicked on goCurrent, takes user to current inventory page
  $('#goCurrent').click(() => {
    window.location.replace('/inventory');
  });

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

  // When the form is submitted,
  // The new values are passed into the update function which sends a put request.
  updateProduct.on('submit', (event) => {
    event.preventDefault();

    const updatedProdData = {
      sku: url[5],
      name: updatedProdName.val().trim(),
      inventoryQuantity: updatedQuantity.val().trim(),
      description: updatedProdDesc.val().trim(),
      currentPurchasePrice: updatedCost.val().trim(),
      currentSalePrice: updatedPrice.val().trim(),
      minRequirement: 0,
    };

    updateProductData(updatedProdData);
  });

  function updateProductData(updatedProdData) {
    $.ajax({
      method: 'PUT',
      url: '/api/product',
      data: JSON.stringify(updatedProdData),
      contentType: 'application/json',
      dataType: 'json',
    });
    window.location.replace('/inventory');
  }
});

$('#goCurrent').click(() => {
  window.location.replace('/inventory');
});
