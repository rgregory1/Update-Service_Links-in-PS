const isOn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings').getRange('B1').getValue()

function syncServices() {

  if (isOn == 'Off'){
    return
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const servicesData = ss.getSheetByName('servicesData')

  getCurrentServicesData()

  // format data on the report
  servicesData.sort(7)
  servicesData.sort(6)
  servicesData.sort(5)

  let data = dataRangeToArray('servicesData')

  // console.log(data)

  let fileData = dataRangeToArray('files')

  // get seperate groups of services from the files sheet
  let ss504LinesGoogleFile = fileData.filter(x => x.folderName == '504')
  let estLinesGoogleFile = fileData.filter(x => x.folderName == 'EST')
  let iepLinesGoogleFile = fileData.filter(x => x.folderName !== '504' && x.folderName !== 'EST')

  // remove IEP links in PS with no files in Google
  removeServiceLinks(iepLinesGoogleFile, data, 'iep', 'LINK_IEP')

  // remove 504 links in PS with no files in Google
  removeServiceLinks(ss504LinesGoogleFile, data, 'ss504', 'LINK_504')

  // remove EST links in PS with no files in Google
  removeServiceLinks(estLinesGoogleFile, data, 'est', 'LINK_EST')
  

  
  // update IEP links
  updateServiceLinks('iep', iepLinesGoogleFile, data, 'LINK_IEP')

  // update 504 links
  updateServiceLinks('ss504', ss504LinesGoogleFile, data, 'LINK_504')

  // update EST links
  updateServiceLinks('est', estLinesGoogleFile, data, 'LINK_EST')


  console.log('fin')

}

// https://drive.google.com/file/d/1m_I7HvZl8t5RUH3Ykzzv0k6j9lFrnsm4/view


function updateServiceLinks(service, serviceLinesGoogleFile, psData, linkField){

  // combine data from Google folders with services data pulled from PS
  serviceLinesGoogleFile.forEach(line =>{
    let thisServiceLine = psData.find(x => x.studentId == line.studentId)
    
    if (thisServiceLine){
      line.isService = thisServiceLine[service]
      line.service_link = thisServiceLine[service + '_link']
      line.stu_dcid = thisServiceLine.stu_dcid
    } 
    
  })

  // find all students that have IEP pdfs but no data in link_iep field
  let linkNeededObjects = serviceLinesGoogleFile.filter(x => x.service_link == '')

  let linkNeeded = []
  
  linkNeededObjects.forEach(line => {
    linkNeeded.push([line.stu_dcid,linkField,line.fileId])
  })

  // update IEP links in PS
  if (linkNeeded.length > 0){
    updateMultipleStudentLinks(linkNeeded, 'links')
  } else {
    console.log('no ' + service + ' links to update')
  }
}


function removeServiceLinks(googleData, servicesData, serviceType, linkField){

  // Create a Set of studentIds from googleData for quick lookup
  const googleStudentIds = new Set(googleData.map(item => item.studentId));

  // Filter servicesData to find entries with non-empty iep_link and studentId not in googleStudentIds
  const noServicePdfInGoogle = servicesData.filter(service => service[serviceType + '_link'] && !googleStudentIds.has(service.studentId))

  let linksToRemove = []

  noServicePdfInGoogle.forEach(line => {
    linksToRemove.push([line.stu_dcid,linkField,''])
  })

  if (linksToRemove.length > 0){
    updateMultipleStudentLinks(linksToRemove)
  } else {
    console.log('no ' + serviceType + ' links to remove')
  }

}





