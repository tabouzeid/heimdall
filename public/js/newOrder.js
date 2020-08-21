const tableID = $('#table');
const BTN = $('#export-btn');
const EXPORT = $('#export');
const submitOrder = $('#submit-order');

const newTr = `
<tr>
<td class="pt-3-half">
<select id="buy-sell_0">
  <option value="" disabled selected hidden>Select</option>
</select>
</td>
<td class="pt-3-half"><input id="client-name_0"></td>
<td class="pt-3-half"><select id="sku_0"><option value="" disabled selected hidden>Select</option></select></td>
<td class="pt-3-half"><select id="quantity_0"><option value="" disabled selected hidden>Select</option></select></td>
<td class="pt-3-half" id="price-per-unit_0"></td>
<td><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0">Remove</button></span></td>
</tr>`;

// This will create the NewOrder Modal when clicked.
$('#newOrder').click(() => {
  window.location.replace('/newOrder');
});

function init() {
  $.ajax({
    method: 'GET',
    url: '/api/product',

  }).then((res) => {
    console.log(res);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < res.length; i++) {
      if (res[i].inventoryQuantity > 0) {
        $('<option>').appendTo($('#sku_0')).attr('value', res[i].sku).text(res[i].sku);
      }
    }
  });

  // This is to handle dropdown for buy / sell
  const buySellArr = ['Buy', 'Sell'];
  for (let i = 0; i < buySellArr.length; i += 1) {
    $('<option>').appendTo($('#buy-sell_0')).attr('value', buySellArr[i]).text(buySellArr[i]);
  }
}

init();

// display buy price or selt price
function getBuyOrSellPrice(e) {
  e.preventDefault();
  $('#price-per-unit_0').text('');
  const sku = e.target.value;
  console.log(sku);

  $.ajax({
    method: 'GET',
    url: `/api/product/${sku}`,
  }).then((res) => {
    console.log(res);

    // setting buy or sell price
    if ($('#buy-sell_0').val() === 'Buy') {
      $('<span>').appendTo($('#price-per-unit_0')).text(res.currentPurchasePrice);
    } else {
      $('<span>').appendTo($('#price-per-unit_0')).text(res.currentSalePrice);
    }

    // show product 'not available' when quantity = 0
    if (res.inventoryQuantity <= 0) {
      $('<span>').appendTo($('#quantity_0')).attr('value', 'Not Available').text('Not Available');
    }
    $('#quantity_0').attr('max', res.inventoryQuantity);
  });
}

// selecting sku event
$('#sku_0').on('change', getBuyOrSellPrice);

// this is for handling the table in the NewOrder screen
// ----- Code from Bootstrap ------

$('.table-add').on('click', 'i', () => {
  if (tableID.find('tbody tr').length === 0) {
    $('tbody').append(newTr);
    init();
  } else {
    const cloneRow = tableID.find('tbody tr').last().clone(true).removeClass('hide table-line');
    cloneRow.find('input').val('').end();
    tableID.find('table').append(cloneRow);
  }
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
  console.log('Inside addInventory function, passing object is:', newOrder);
  $.ajax({
    url: '/api/order',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(newOrder),
  }).catch((err) => {
    console.log(err);
  });
}

// this is to handle submit button

submitOrder.on('click', (event) => {
  event.preventDefault();

  const newOrderData = [];
  // when you submit the form you have to send in each row of data
  tableID.find('tbody tr').each((i, row) => {
    newOrderData.push({
      buyOrSell: $('#buy-sell_0', row).val(),
      clientName: $('#client-name_0', row).val(),
      sku: $('#sku_0', row).val(),
      quantity: $('#quantity_0', row).val(),
      pricePerUnit: $('#price-per-unit_0', row).text(),
    });
  });

  console.log('Submit clicked, new inv data is', newOrderData);

  // Call addOrder function to add new inventory, and clear the form
  addOrder(newOrderData);
  window.location.replace('/inventory');
});

$('#close-screen').on('click', (e) => {
  e.preventDefault();
  window.location.replace('/inventory');
});

$('#goCurrent').click(() => {
  window.location.replace('/inventory');
});