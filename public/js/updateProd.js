/* eslint-disable no-use-before-define */
const db = require('../../models');

$(document).ready(() => {
  const updateProduct = $('form.updateProduct');
  const updatedProdName = $('input#productName');
  const updatedQuantity = $('input#quantity');
  const updatedProdDesc = $('input#productDescription');
  const updatedCost = $('input#cost');
  const updatedPrice = $('input#sellPrice');

  updateProduct.on('submit', (event) => {
    event.preventDefault();

    const updatedProdData = {
      productName: updatedProdName.val().trim(),
      quantity: updatedQuantity.val().trim(),
      productDesc: updatedProdDesc.val().trim(),
      cost: updatedCost.val().trim(),
      sellPrice: updatedPrice.val().trim(),
    };

    console.log('Submit clicked, updated product data is', updatedProdData);

    updateProductData(updatedProdData);
    updatedProdName.val('');
    updatedQuantity.val('');
    updatedProdDesc.val('');
    updatedCost.val('');
    updatedPrice.val('');
  });

  function updateProductData(updatedProdData) {
    $.put('/api/product', {
      name: updatedProdData.productName,
      inventoryQuantity: updatedProdData.quantity,
      description: updatedProdData.productDesc,
      currentPurchasePrice: updatedProdData.cost,
      currentSalePrice: updatedProdData.sellPrice,
      minRequirement: 0,
    });
  }
});
