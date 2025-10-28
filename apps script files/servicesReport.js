function errorReport() {

   if (isOn == 'Off'){
    return
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const servicesData = ss.getSheetByName('servicesData')

  getCurrentServicesData()

  SpreadsheetApp.flush()

  // format data on the report
  servicesData.sort(7)
  servicesData.sort(6)
  servicesData.sort(5)

  let data = dataRangeToArray('servicesData')

  const iepMarkedButNoIEPLink = data.filter(line => line['iep'] == 'Y' && line['iep_link'] == '')
  const ss504MarkedButNo504Link = data.filter(line => line['ss504'] == 'Y' && line['ss504_link'] == '')
  const estMarkedButNoESTLink = data.filter(line => line['est'] == 'Y' && line['est_link'] == '')
  const iepLinkButNotMarked = data.filter(line => line['iep'] == '' && line['iep_link'] !== '')
  const ss504LinkButNotMarked = data.filter(line => line['ss504'] == '' && line['ss504_link'] !== '')
  const estLinkButNotMarked = data.filter(line => line['est'] == '' && line['est_link'] !== '')

  console.log(iepMarkedButNoIEPLink)

  const allErrors = [
    iepMarkedButNoIEPLink.length,
    ss504MarkedButNo504Link.length,
    estMarkedButNoESTLink.length,
    iepLinkButNotMarked.length,
    ss504LinkButNotMarked.length,
    estLinkButNotMarked.length
  ]

  let isErrors = false

  allErrors.forEach(item =>{
    if (item !== 0){
      isErrors = true
    }
  })
  


  if (isErrors){
    sendErrorEmail(allErrors)
  } else {
    console.log('no errors today')
  }
  console.log('fin')

}

function sendErrorEmail(allErrors){

  const dailyLog = copyServicesdataToNewSpreadsheet()

  const body = `<h3>Errors in Services Sync At the Moment</h3>
  
  <p>IEP marked but no IEP link: ${allErrors[0]}</p>
  <p>IEP linked but IEP not selected: ${allErrors[3]}</p>
  <p>504 marked but no 504 link: ${allErrors[1]}</p>
  <p>504 linked but 504 not selected: ${allErrors[4]}</p>
  <p>EST marked but no EST link: ${allErrors[2]}</p>
  <p>EST linked but EST not selected: ${allErrors[5]}</p>

  Please see the daily log to help with correction:
  <a href="${dailyLog}">Daily Sync Log</a>
  `

  MailApp.sendEmail({
    to: emailList,
    subject: 'SWA Services Sync Error Report',
    htmlBody: body,

  })

  

}

function copyServicesdataToNewSpreadsheet() {
  // Get the active sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('servicesData')

  // Create a new spreadsheet
  const newSpreadsheet = SpreadsheetApp.create("New Spreadsheet");

  // Copy the current sheet to the new spreadsheet
  const copiedSheet = sheet.copyTo(newSpreadsheet);

  // Rename the copied sheet
  copiedSheet.setName("newSheet");

  // Optionally, delete the blank default sheet that comes with a new spreadsheet
  newSpreadsheet.deleteSheet(newSpreadsheet.getSheets()[0]);

  const today = getDateAsString()
  newSpreadsheet.rename(`services report ${today}`)

  // Log the URL of the new spreadsheet
  Logger.log("New spreadsheet URL: " + newSpreadsheet.getUrl());

  // Move the new spreadsheet to a specific folder
  const folderId = "1KQkvMUyeTKJvfNKwCoV-J6nSpM3nhk2k"; // Replace with your actual folder ID
  const folder = DriveApp.getFolderById(folderId);
  const file = DriveApp.getFileById(newSpreadsheet.getId());
  file.moveTo(folder);
  
  return newSpreadsheet.getUrl()
}
