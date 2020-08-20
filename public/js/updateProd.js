/* eslint-disable no-use-before-define */
$(document).ready(() => {
  // Update page loads when a product is clicked in inventory page.
  $('#PLACEHOLDERBUTTON').click(() => {
    window.location.replace('/update/Product');
  });

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
    console.log('Inside updateProductData function, passing object is:', updatedProdData);
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

// Need logic to select row and get the product's current data for the sku
