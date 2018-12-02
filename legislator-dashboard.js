// TODO: Add parameters for table IDs etc.
google.charts.load(
  'current',
  {
    'packages': ['table'],
    'callback': function () {
      var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1-nfLcspdj2h8rk07I7LQzUKG3oEV3r6tpjmL8p1hLrs/gviz/tq?' +
        'range=A2:A254&headers=0');
      query.send(initialize);
    }
  });

var legislators = [];

function initialize(response) {
  var dataTable = response.getDataTable();
  for (var i = 0; i < dataTable.getNumberOfRows(); i++) {
    var option = document.createElement("option");
    option.textContent = dataTable.getValue(i, 0);
    option.value = dataTable.getValue(i, 0).replace(/.*\(/, "").replace(/\)/, "");
	legislators.push(option);
  }
  populateDropdown("");
}

function populateDropdown(filterText) {
  if (/^\d+$/.test(filterText)) {
    filterText = " " + filterText + ")";
  } else {
    filterText = filterText.toLowerCase();
  }

  var dropdown = document.getElementById('legislator');
  while (dropdown.lastChild) {
    dropdown.removeChild(dropdown.lastChild);
  }
  for (var i = 0; i < legislators.length; i++) {
    if (legislators[i].textContent.toLowerCase().includes(filterText)) {
      dropdown.appendChild(legislators[i]);
	}
  }
  displayInfo();
}

function displayInfo() {
  var key = document.getElementById('legislator').value.split(" ");
  drawLegislator(key[0], key[1]);
  drawContacts(key[0], key[1]);
  return false;
}
	  
// TODO: draw this explicitly rather than as a table
function drawLegislator(chamber, district) {
  var tableId;
  var title;
  switch (chamber) {
    case 'Senate':
      tableId = '1_QM0a4pAFRAO_5_TfO1-Rhs3n1Qm5mLGfsDhW-RC';
	  title = "Senator";
      break;
    case 'House':
      tableId = '1EvdE9QCu0cJsOKKqI0nsQja5_GzKuxoQ8l8u7q71';
	  title = "Representative";
      break;
    default:
      throw new "Chamber must be 'Senate' or 'House', not '" + chamber + "'.";
  }
  var query = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata?tq=');
  query.setQuery(
    "SELECT 'Last Name', 'Party', 'Freshman', 'District Phone', 'Capitol Phone', 'Email', 'Facebook', 'Twitter', 'Capitol Address', 'District Address 1'" +
    " FROM " + tableId +
    " WHERE 'District'=" + district);
  query.send(function (response) { drawLegislatorSub(response, title) });
}

function drawLegislatorSub(response, title) {
  var dataTable = response.getDataTable();
  var content;
  if (dataTable.getNumberOfRows() != 1)
  {
	content = "Could not find contact info";
  } else {
    var lastName = dataTable.getValue(0, 0);
    var party = dataTable.getValue(0, 1);
    var freshman = dataTable.getValue(0, 2) == "Yes";
    var districtPhone = dataTable.getValue(0, 3);
    var capitolPhone = dataTable.getValue(0, 4);
    var email = dataTable.getValue(0, 5);
    var facebook = dataTable.getValue(0, 6);
    var twitter = dataTable.getValue(0, 7);
    var capitolAddress = dataTable.getValue(0, 8);
    var districtAddress1 = dataTable.getValue(0, 9);

    var content = "<strong>" + title + " " + lastName + " (" + party + ")</strong><br>";
    if (freshman) { content = content + "<i>Newly elected; will take office Jan. 1st, 2019</i><br>"; }
    content = content + "<br>";
    if (districtPhone) { content = content + "District Phone: <a href='tel:1" + districtPhone.replace(/[^\d]/g,"") + "'>" + districtPhone + "</a><br>"; }
    if (districtAddress1) { content = content + "District Address: " + districtAddress1 + "<br><br>"; }
    if (capitolPhone) { content = content + "Capitol Phone: <a href='tel:1" + capitolPhone.replace(/[^\d]/g,"") + "'>" + capitolPhone + "</a><br>"; }
    if (capitolAddress) { content = content + "Capitol Address: " + capitolAddress + "<br><br>"; }
    if (email) { content = content + "Email: <a href='mailto:" + email + "'>" + email + "</a><br>"; }
    if (facebook) { content = content + "Facebook: <a href='https://www.facebook.com/" + facebook.substring(1) + "'>" + facebook + "</a><br>"; }
    if (twitter) { content = content + "Twitter: <a href='https://www.twitter.com/" + twitter.substring(1) + "'>" + twitter + "</a><br>"; }
  }
  document.getElementById('legislator_div').innerHTML = content;
}
	  
function drawContacts(chamber, district) {
  var query = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata?tq=');
  query.setQuery(
    "SELECT 'Date', 'Type', 'Position'" +
    " FROM 1Y1HHWA-g4m9wOKkK5aJcLeRIG-ECCgc2cj2EG5SU" +
    " WHERE 'Chamber'='" + chamber + "' AND 'District'=" + district +
    " ORDER BY 'Date' DESC");
  query.send(drawContactsSub);
}

function drawContactsSub(response) {
  var data = response.getDataTable();
  var nRows = data.getNumberOfRows();
  if (nRows == 0) {
    document.getElementById('contacts_message').innerHTML = "<strong>This legislator hasn't been contacted yet.</strong>";
    document.getElementById('contacts_table').innerHTML = "";
  } else {
    if (nRows == 1) {
      document.getElementById('contacts_message').innerHTML = "<strong>This legislator has been contacted once:</strong>";
    } else {
      document.getElementById('contacts_message').innerHTML = "<strong>This legislator has been contacted " + nRows + " times:</strong>";
    }
    var table = new google.visualization.Table(document.getElementById('contacts_table'));	
    table.draw(data);
  }
}
	  
function openPrefilledForm() {
  var elt = document.getElementById('legislator');
  var text = elt.options[elt.selectedIndex].text.replace(/ /g, "+");
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcSPNmIBfEDph61K1-6IJpvN8ULEHb8uKLuQ5x0Y-EWLkseA/viewform?usp=pp_url&entry.221054303='+text);
  return false;
}
