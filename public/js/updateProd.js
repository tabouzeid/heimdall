/* eslint-disable no-use-before-define */
$(document).ready(() => {
  const updateProduct = $('form.updateProduct');
  const updatedProdName = $('input#productName');
  const updatedQuantity = $('input#quantity');
  const updatedProdDesc = $('input#productDescription');
  const updatedCost = $('input#cost');
  const updatedPrice = $('input#sellPrice');

  const url = window.location.href.split('/');

  $.ajax({
    method: 'GET',
    url: `/api/product/${url[5]}`,
  }).then((res) => {
    console.log(res);
    renderProdData(res);
  });

  function renderProdData(data) {
    console.log(data);
    $('#skuNum').val(`SKU: ${data.sku}`);
    $('#productName').attr('value', data.name);
    $('#quantity').attr('value', data.inventoryQuantity);
    $('#productDescription').attr('value', data.description);
    $('#cost').attr('value', data.currentPurchasePrice);
    $('#sellPrice').attr('value', data.currentSalePrice);
  }

  updateProduct.on('submit', (event) => {
    event.preventDefault();

    const updatedProdData = {
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
    });
  }
});
