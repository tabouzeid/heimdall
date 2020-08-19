const tableID = $('#table');
const BTN = $('#export-btn');
const EXPORT = $('#export');
const buySell = $('#buy-sell');
const submitOrder = $('#submit-order');
const clientName = $('#client-name');
const sku = $('#sku');
const quantity = $('#quantity');

const newTr = `
<tr class="hide">
<td class="pt-3-half" contenteditable="true">
<select id="buy-sell">
  <option value="" disabled selected hidden>Select</option>
</select>
</td>
<td class="pt-3-half" contenteditable="true"></td>
<td class="pt-3-half" contenteditable="true"></td>
<td class="pt-3-half" contenteditable="true"></td>
<td>
<span class="table-remove"><button type="button"  
    class="btn btn-danger btn-rounded btn-sm my-0">Remove</button></span>
</td>
</tr>`;

// This will create the NewOrder Modal when clicked.
$('#newOrder').click(() => {
  window.location.replace('/newOrder');
});

$('#addNewOrder').click(function () {
  alert("adding new order");
});

// this is for handling the table in the NewOrder screen
// ----- Code from Bootstrap ------

$('.table-add').on('click', 'i', () => {
  const $clone = tableID.find('tbody tr').last().clone(true).removeClass('hide table-line');

  if (tableID.find('tbody tr').length === 0) {
    $('tbody').append(newTr);
  }

  tableID.find('table').append($clone);
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

// This is to handle dropdown for buy / sell
const buySellArr = ['Buy', 'Sell'];

for (let i = 0; i < buySellArr.length; i += 1) {
  $('<option>').appendTo(buySell).attr('value', buySellArr[i]).text(buySellArr[i]);
}

// newInventory does a post to our "api/login" route and if successful,
// redirects us the the members page
function addOrder(newOrder) {
  console.log('Inside addInventory function, passing object is:', newOrder);
  $.post('/api/order', newOrder)
    .then(() => {
      // For now back to add inventory page but we can update later to another page.
      // window.location.replace('/inventory');
      console.log('Inside addInventory function, passing object is:', newOrder);
      // If there's an error, log the error
    })
    .catch((err) => {
      console.log(err);
    });
}

// this is to handle submit button

submitOrder.on('click', (event) => {
  event.preventDefault();

  // when you submit the form you have to send in each row of data

  const newOrderData = {
    buy_sell: buySell.val().trim(),
    client_name: clientName.text().trim(),
    sku: sku.text().trim(),
    quantity: quantity.text().trim(),
  };

  console.log('Submit clicked, new inv data is', newOrderData);

  // Call addOrder function to add new inventory, and clear the form
  addOrder(newOrderData);
});
