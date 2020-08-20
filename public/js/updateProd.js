/* eslint-disable no-use-before-define */
$(document).ready(() => {
  // eslint-disable-next-line max-len
  // const existingProdSku = $('#sku'); // Ask team how to inject this into the hbs {{sku}} in updateProd.
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
      // dynamically create rows here
      // can use server side (handlebars) or browser side with jquery
    });
  }
});
