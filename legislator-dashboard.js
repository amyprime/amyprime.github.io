// TODO: Add parameters for table IDs etc.
google.charts.load(
  'current',
  {
    'packages': ['table'],
    'callback': function () {
      var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1-nfLcspdj2h8rk07I7LQzUKG3oEV3r6tpjmL8p1hLrs/gviz/tq?' +
        'range=A2:A254&headers=0');
      query.send(populateDropdownSub);
    }
  });

function populateDropdownSub(response) {
  var dropdown = document.getElementById('legislator');
  var datatable = response.getDataTable();
  for (var i = 0; i < datatable.getNumberOfRows(); i++) {
    var option = document.createElement("option");
    option.textContent = datatable.getValue(i, 0);
    option.value = datatable.getValue(i, 0).replace(/.*\(/, "").replace(/\)/, "");
    dropdown.appendChild(option);		
  }
		
  limitSelections();
}

function limitSelections() {
  var key = document.getElementById('legislator').value.split(" ");
  drawLegislator(key[0], key[1]);
  drawContacts(key[0], key[1]);
  return false;
}
	  
// TODO: draw this explicitly rather than as a table
function drawLegislator(chamber, district) {
  var tableId;
  switch (chamber) {
    case 'Senate':
      tableId = '1_QM0a4pAFRAO_5_TfO1-Rhs3n1Qm5mLGfsDhW-RC';
      break;
    case 'House':
      tableId = '1EvdE9QCu0cJsOKKqI0nsQja5_GzKuxoQ8l8u7q71';
      break;
    default:
      throw new "Chamber must be 'Senate' or 'House', not '" + chamber + "'.";
  }
  var query = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata?tq=');
  query.setQuery(
    "SELECT 'Full Name', 'Party', 'Votes'" +
    " FROM " + tableId +
    " WHERE 'District'=" + district);
  query.send(drawLegislatorSub);
}

function drawLegislatorSub(response) {
  var data = response.getDataTable();
  var formatter = new google.visualization.NumberFormat({pattern: '##%'});
  formatter.format(data, 2);

  var table = new google.visualization.Table(document.getElementById('legislator_div'));	
  table.draw(data);
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
    document.getElementById('contacts_message').innerHTML = "This legislator hasn't been contacted yet!";
    document.getElementById('contacts_table').innerHTML = "";
  } else {
    if (nRows == 1) {
      document.getElementById('contacts_message').innerHTML = "This legislator has been contacted once:";
    } else {
      document.getElementById('contacts_message').innerHTML = "This legislator has been contacted " + nRows + " times:";
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
