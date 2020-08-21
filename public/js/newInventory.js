/* eslint-disable no-use-before-define */
$(document).ready(() => {
  $.ajax({
    method: 'GET',
    url: '/api/product',

  }).then((res) => {
    res.forEach((value) => {
      addInventoryRow(value);
    });
    // dynamically create rows here
    // can use server side (handlebars) or browser side with jquery
  });

  // When clicked on goCurrent, takes user to current inventory page
  $('#goCurrent').click(() => {
    window.location.replace('/inventory');
  });

  // This event handler is activated when inside Inventory.handlebar
  // user click on newinventory button
  // this then it will take user to newInventory Page.
  $('#newInventory').click(() => {
    // Clear the local storage object (suppInvData)
    const suppInvData = {
      sku: '',
      name: '',
      productDesc: '',
      sellPrice: '',
    };

    localStorage.setItem('newSupplierItem', JSON.stringify(suppInvData));

    window.location.replace('/add/inventory');
  });

  //----------------------------------------------------------
  // Below is for the button within the newInventory.handlebar
  // Getting references to our form and inputs
  const newInvForm = $('form.newInventory');
  const skuInput = $('input#sku');
  const productNameInput = $('input#productName');
  const productDescInput = $('input#productDescription');
  const costInput = $('input#cost');
  const sellPriceInput = $('input#sellPrice');
  const quantityInput = $('input#quantity');

  // When the form is submitted, we validate there's an email and password entered

  newInvForm.on('submit', (event) => {
    event.preventDefault();

    const newInvData = {
      sku: skuInput.val().trim(),
      productName: productNameInput.val().trim(),
      productDesc: productDescInput.val().trim(),
      cost: costInput.val().trim(),
      sellPrice: sellPriceInput.val().trim(),
      quantity: quantityInput.val().trim(),
    };

    console.log('Submit clicked, new inv data is', newInvData);

    // Call addInventory function to add new inventory, and clear the form
    addInventory(newInvData);
    skuInput.val('');
    productNameInput.val('');
    productDescInput.val('');
    costInput.val('');
    sellPriceInput.val('');
    quantityInput.val('');
  });

  // newInventory does a post to our "api/login" route and if successful,
  // redirects us the the members page
  function addInventory(newInvData) {
    console.log('Inside addInventory function, passing object is:', newInvData);
    $.post('/api/product', {
      sku: newInvData.sku,
      name: newInvData.productName,
      description: newInvData.productDesc,
      currentPurchasePrice: newInvData.cost,
      currentSalePrice: newInvData.sellPrice,
      inventoryQuantity: newInvData.quantity,
      minRequirement: 0,
    })
      .then(() => {
        // For now back to add inventory page but we can update later to another page.
        window.location.replace('/inventory');
        // If there's an error, log the error
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

function addInventoryRow(inventoryItem) {
  const table = $('tbody');
  // Link to updateProd page.
  const hrefStr = `/update/inventory/${inventoryItem.sku}`;
  const rowNum = table.children().length + 1;
  const row = `
  <tr>
    <th scope="row">${rowNum}</th>
    <td><a href=${hrefStr}>${inventoryItem.sku}</a></td> 
    <td>${inventoryItem.name}</td>
    <td>${inventoryItem.description}</td>
    <td>${inventoryItem.currentPurchasePrice}</td>
    <td>${inventoryItem.currentSalePrice}</td>
    <td>${inventoryItem.inventoryQuantity}</td>
  </tr>
  `;
  table.append(row);
}
