function show_fetch_programme_dialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('DialogFetchProgramme')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Fetch Programme');
}

function fetchProgrammeFromServer(sectionId, termId) {
  var url = `https://www.onlinescoutmanager.co.uk/ext/programme/?action=getProgrammeSummary&sectionid=${sectionId}&termid=${termId}&verbose=0`;
  var response = UrlFetchApp.fetch(url, {
    'headers': {
      'Cookie': 'YOUR_AUTH_COOKIE' // Use correct authentication
    }
  });
  
  var programmeData = JSON.parse(response.getContentText());
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Example of writing the headers
  sheet.appendRow(['Title', 'Notes for Parents', 'Leaders', 'Meeting Date']);
  
  programmeData.forEach(function(programme) {
    var detailsUrl = `https://www.onlinescoutmanager.co.uk/ext/programme/?action=getProgramme&eveningid=${programme.eveningid}&sectionid=${sectionId}&termid=${termId}`;
    var detailsResponse = UrlFetchApp.fetch(detailsUrl, {
      'headers': {
        'Cookie': 'YOUR_AUTH_COOKIE'
      }
    });
    var details = JSON.parse(detailsResponse.getContentText());
    
    // Write the relevant fields to the sheet
    sheet.appendRow([
      details.title,
      details.notesforparents,
      details.leaders,
      details.meetingdate
    ]);
  });
}
