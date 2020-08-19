/* eslint-disable no-use-before-define */
$(document).ready(() => {
  $.ajax({
    method: 'GET',
    url: '/api/product',

  }).then((res) => {
    console.log(res);

    // <tr>

    //   <th scope="row">1</th>
    //   <td>000000000</td>
    //   <td>Product 1</td>
    //   <td>test</td>
    //   <td>test</td>
    //   <td>test</td>
    //   <td>test</td>

    // </tr>
    for (var i = 0; i < res.length; i++) {

      var trow = $("<tr>");
      var thNUmber = $("<th>");
      thNUmber.attr("scope", "col");
      thNUmber.text(i + 1)
      var sku = $("<td>");
      sku.text(res[i].sku);

      var productName = $("<td>");
      productName.text(res[i].name);
      var productDescr = $("<td>");
      productDescr.text(res[i].description);
      var wholesale = $("<td>");
      wholesale.text(res[i].currentPurchasePrice);
      var msrp = $("<td>");
      msrp.text(res[i].currentSalePrice);
      var productQuantity = $("<td>");
      productQuantity.text(res[i].inventoryQuantity);

      //.currentInv
      trow.append(thNUmber);
      trow.append(sku);
      trow.append(productName);
      trow.append(productDescr);
      trow.append(wholesale);
      trow.append(msrp);
      trow.append(productQuantity);
      $(".currentInv").append(trow);
    }

    // dynamically create rows here
    // can use server side (handlebars) or browser side with jquery
  });

  // This event handler is activated when inside Inventory.handlebar
  // user click on newinventory button
  // this then it will take user to newInventory Page.
  $('#newInventory').click(() => {
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
