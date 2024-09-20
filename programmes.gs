function show_fetch_programme_dialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('DialogFetchProgramme')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Fetch Programme');
}

function getSections() {
  // Fetch sections using the appropriate OSM API endpoint
  var url = 'https://www.onlinescoutmanager.co.uk/users.php?action=getUserRoles';
  var response = UrlFetchApp.fetch(url, {
    'headers': {
      'Cookie': getOSMCookie()
    }
  });
  
  var sections = JSON.parse(response.getContentText()).sections;
  
  // Return the list of sections to populate the dialog
  return sections.map(function(section) {
    return {
      id: section.sectionid,
      name: section.sectionname
    };
  });
}

function getTerms(sectionId) {
  // Fetch terms based on the selected section
  var url = `https://www.onlinescoutmanager.co.uk/ext/programme/?action=getTerms&sectionid=${sectionId}`;
  var response = UrlFetchApp.fetch(url, {
    'headers': {
      'Cookie': getOSMCookie()
    }
  });
  
  var terms = JSON.parse(response.getContentText()).terms;
  
  // Return the list of terms to populate the dialog
  return terms.map(function(term) {
    return {
      id: term.termid,
      name: term.termname
    };
  });
}

function fetchProgrammeFromServer(sectionId, termId) {
  // Define the URL for fetching the programme summary
  var url = `https://www.onlinescoutmanager.co.uk/ext/programme/?action=getProgrammeSummary&sectionid=${sectionId}&termid=${termId}&verbose=0`;
  var response = UrlFetchApp.fetch(url, {
    'headers': {
      'Cookie': getOSMCookie() // Assuming a similar authentication process to events.gs
    }
  });
  
  var programmeData = JSON.parse(response.getContentText());
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Clear previous data if needed
  sheet.clear();
  
  // Write headers matching the requested fields
  sheet.appendRow([
    'Title', 'Notes for Parents', 'Notes for Helping Parents', 'Parents Required', 
    'Games', 'Pre-Notes', 'Post-Notes', 'Leaders', 'Meeting Date', 
    'Start Time', 'End Time', 'Help', 'Unavailable Leaders'
  ]);
  
  // Iterate through each programme in the summary
  programmeData.forEach(function(programme) {
    var detailsUrl = `https://www.onlinescoutmanager.co.uk/ext/programme/?action=getProgramme&eveningid=${programme.eveningid}&sectionid=${sectionId}&termid=${termId}`;
    var detailsResponse = UrlFetchApp.fetch(detailsUrl, {
      'headers': {
        'Cookie': getOSMCookie()
      }
    });
    var details = JSON.parse(detailsResponse.getContentText());
    
    // Write each field to the spreadsheet
    sheet.appendRow([
      details.title,
      details.notesforparents || '',
      details.notesforhelpingparents || '',
      details.parentsrequired || '',
      details.games || '',
      details.prenotes || '',
      details.postnotes || '',
      details.leaders || '',
      details.meetingdate || '',
      details.starttime || '',
      details.endtime || '',
      details.help || '',
      details.unavailableleaders || ''
    ]);
  });
}
