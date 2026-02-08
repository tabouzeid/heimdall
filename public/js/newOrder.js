const tableID = $('#table');
const BTN = $('#export-btn');
const EXPORT = $('#export');
const submitOrder = $('#submit-order');

let rowCounter = 0;

function createNewRow() {
  const rowId = rowCounter;
  rowCounter += 1;
  
  const newTr = `
  <tr data-row-id="${rowId}">
  <td class="px-6 py-4 whitespace-nowrap">
  <select id="buy-sell_${rowId}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 buy-sell-select">
    <option value="" disabled selected hidden>Select</option>
  </select>
  </td>
  <td class="px-6 py-4 whitespace-nowrap"><input id="client-name_${rowId}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></td>
  <td class="px-6 py-4 whitespace-nowrap">
  <select id="sku_${rowId}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sku-select">
    <option value="" disabled selected hidden>Select</option>
  </select>
  </td>
  <td class="px-6 py-4 whitespace-nowrap">
  <input type="number" step="1" id="quantity_${rowId}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
  </td>
  <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-700" id="price-per-unit_${rowId}">
    <span class="text-gray-400 italic">Select SKU</span>
  </td>
  <td class="px-6 py-4 whitespace-nowrap">
  <span class="table-remove">
    <button type="button" class="btn-secondary text-sm">Remove</button>
  </span>
  </td>
  </tr>`;
  
  return newTr;
}

// This will create the NewOrder Modal when clicked.
$('#newOrder').click(() => {
  window.location.replace('/newOrder');
});

function populateDropdowns(rowId) {
  $.ajax({
    method: 'GET',
    url: '/api/product',
  }).then((res) => {
    console.log(res);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < res.length; i++) {
      if (res[i].inventoryQuantity > 0) {
        $('<option>').appendTo($(`#sku_${rowId}`)).attr('value', res[i].sku).text(res[i].sku);
      }
    }
  });

  // This is to handle dropdown for buy / sell
  const buySellArr = ['Buy', 'Sell'];
  for (let i = 0; i < buySellArr.length; i += 1) {
    $('<option>').appendTo($(`#buy-sell_${rowId}`)).attr('value', buySellArr[i]).text(buySellArr[i]);
  }
}

populateDropdowns(0);

// display buy price or sell price
function getBuyOrSellPrice(selectElement) {
  const row = $(selectElement).closest('tr');
  const rowId = row.data('row-id');
  const priceCell = $(`#price-per-unit_${rowId}`);
  
  priceCell.text('');
  const sku = $(selectElement).val();
  
  if (!sku) {
    return;
  }
  
  console.log('Getting price for SKU:', sku);

  $.ajax({
    method: 'GET',
    url: `/api/product/${sku}`,
  }).then((res) => {
    console.log(res);

    // setting buy or sell price (already safe - using .text())
    const buySellSelect = $(`#buy-sell_${rowId}`);
    if (buySellSelect.val() === 'Buy') {
      $('<span>').text(res.currentPurchasePrice).appendTo(priceCell);
    } else {
      $('<span>').text(res.currentSalePrice).appendTo(priceCell);
    }

    // Set max quantity
    const quantityInput = $(`#quantity_${rowId}`);
    if (res.inventoryQuantity <= 0) {
      quantityInput.attr('disabled', true).val('');
      quantityInput.attr('placeholder', 'Not Available');
    } else {
      quantityInput.attr('disabled', false);
      quantityInput.attr('max', res.inventoryQuantity);
      quantityInput.attr('placeholder', `Max: ${res.inventoryQuantity}`);
    }
  }).catch((err) => {
    console.error('Error fetching product:', err);
  });
}

// Use event delegation for dynamically added rows
tableID.on('change', '.sku-select', function() {
  getBuyOrSellPrice(this);
});

tableID.on('change', '.buy-sell-select', function() {
  const row = $(this).closest('tr');
  const skuSelect = row.find('.sku-select');
  if (skuSelect.val()) {
    getBuyOrSellPrice(skuSelect[0]);
  }
});

// this is for handling the table in the NewOrder screen
$('.table-add').on('click', 'i', () => {
  const newRow = createNewRow();
  tableID.find('tbody').append(newRow);
  populateDropdowns(rowCounter - 1);
});

tableID.on('click', '.table-remove', function () {
  $(this).parents('tr').detach();
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

BTN.on('click', () => {
  const $rows = tableID.find('tr:not(:hidden)');
  const headers = [];
  const data = [];

  // Get the headers (add special header logic here)
  $($rows.shift()).find('th:not(:empty)').each(function () {
    headers.push($(this).text().toLowerCase());
  });

  // Turn all existing rows into a loopable array
  $rows.each(function () {
    const $td = $(this).find('td');
    const h = {};

    // Use the headers from earlier to name our hash keys
    headers.forEach((header, i) => {
      h[header] = $td.eq(i).text();
    });

    data.push(h);
  });

  // Output the result
  EXPORT.text(JSON.stringify(data));
});

// newInventory does a post to our "api/login" route and if successful,
// redirects us the the members page
function addOrder(newOrder) {
  console.log('Inside addOrder function, passing object is:', newOrder);
  $.ajax({
    url: '/api/order',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(newOrder),
  }).then(() => {
    window.location.replace('/inventory');
  }).catch((err) => {
    console.log('Error creating order:', err);
    alert('Error creating order. Please check the console for details.');
  });
}

// this is to handle submit button
submitOrder.on('click', (event) => {
  event.preventDefault();

  const newOrderData = [];
  // when you submit the form you have to send in each row of data
  tableID.find('tbody tr').each((i, row) => {
    const rowId = $(row).data('row-id');
    const buyOrSell = $(`#buy-sell_${rowId}`, row).val();
    const clientName = $(`#client-name_${rowId}`, row).val();
    const sku = $(`#sku_${rowId}`, row).val();
    const quantity = $(`#quantity_${rowId}`, row).val();
    const pricePerUnit = $(`#price-per-unit_${rowId}`, row).text();
    
    // Only add if all fields are filled
    if (buyOrSell && clientName && sku && quantity && pricePerUnit) {
      newOrderData.push({
        buyOrSell,
        clientName,
        sku,
        quantity: parseInt(quantity, 10),
        pricePerUnit: parseFloat(pricePerUnit),
      });
    }
  });

  console.log('Submit clicked, new order data is', newOrderData);

  if (newOrderData.length === 0) {
    alert('Please fill in at least one complete order row');
    return;
  }

  // Call addOrder function to add new order
  addOrder(newOrderData);
});

$('#close-screen').on('click', (e) => {
  e.preventDefault();
  window.location.replace('/inventory');
});

$('#goCurrent').click(() => {
  window.location.replace('/inventory');
});
