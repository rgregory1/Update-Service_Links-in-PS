function onOpen(e) {

      const ui = SpreadsheetApp.getUi();
      const menu = ui.createMenu('Custom Functions');

      menu.addItem('Sync Services', 'syncServices');
      menu.addItem('Sync Report', 'errorReport');

      menu.addToUi();
}

const isOn = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings').getRange('B1').getValue()
const emailList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('settings').getRange('B6:B15').getValues().flat().filter(x => x !== '').join(",")

function syncServices() {

  if (isOn == 'Off'){
    return
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const servicesData = ss.getSheetByName('servicesData')

  const token = secretManagerLibraryV2.getNewToken(
                    '1020400423324',
                    'gc_sync_clientID',
                    'gc_sync_clientsecret',
                    )

  console.log(token)

  getCurrentServicesData(token)

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
  removeServiceLinks(iepLinesGoogleFile, data, 'iep', 'LINK_IEP', token)

  // remove 504 links in PS with no files in Google
  removeServiceLinks(ss504LinesGoogleFile, data, 'ss504', 'LINK_504', token)

  // remove EST links in PS with no files in Google
  removeServiceLinks(estLinesGoogleFile, data, 'est', 'LINK_EST', token)
  

  
  // update IEP links
  updateServiceLinks('iep', iepLinesGoogleFile, data, 'LINK_IEP', token)

  // update 504 links
  updateServiceLinks('ss504', ss504LinesGoogleFile, data, 'LINK_504', token)

  // update EST links
  updateServiceLinks('est', estLinesGoogleFile, data, 'LINK_EST', token)


  console.log('fin')

}



function updateServiceLinks(service, serviceLinesGoogleFile, psData, linkField, token){

  // combine data from Google folders with services data pulled from PS
  serviceLinesGoogleFile.forEach(line =>{
    let thisServiceLine = psData.find(x => x.studentId == line.studentId)
    
    if (thisServiceLine){
      line.isService = thisServiceLine[service]
      line.service_link = thisServiceLine[service + '_link']
      line.stu_dcid = thisServiceLine.stu_dcid
      line.case_manager = thisServiceLine.case_manager
    } 
    
  })

  // find all students that have IEP pdfs but no data in link_iep field
  let linkUpdateObjects = serviceLinesGoogleFile.filter(x => x.service_link !== `https://drive.google.com/file/d/${x.fileId}/view`)

  let linkUpdate = []
  
  linkUpdateObjects.forEach(line => {
    linkUpdate.push([line.stu_dcid,linkField,line.fileId])
  })

  // update IEP links in PS
  if (linkUpdate.length > 0){
    updateMultipleStudentLinks(linkUpdate, 'links', token)
  } else {
    console.log('no ' + service + ' links to update')
  }

  // update case manager for IEPs
  if (service = 'iep'){
    let caseManagerUpdates = []

    let caseManagerUpdateObjects = serviceLinesGoogleFile.filter(x => x.folderName !== x.case_manager)

    if (caseManagerUpdateObjects.length > 0){
      
      caseManagerUpdateObjects.forEach(line => {
        
        caseManagerUpdates.push([line.stu_dcid, 'IEP_CASE_MANAGER', line.folderName])
      })

      updateMultipleStudentLinks(caseManagerUpdates, 'case_managers', token)
    }

  }
}


function removeServiceLinks(googleData, servicesData, serviceType, linkField, token){

  // Create a Set of studentIds from googleData for quick lookup
  const googleStudentIds = new Set(googleData.map(item => item.studentId));

  // Filter servicesData to find entries with non-empty iep_link and studentId not in googleStudentIds
  const noServicePdfInGoogle = servicesData.filter(service => service[serviceType + '_link'] && !googleStudentIds.has(service.studentId))

  let linksToRemove = []

  noServicePdfInGoogle.forEach(line => {
    linksToRemove.push([line.stu_dcid,linkField,''])
  })

  if (linksToRemove.length > 0){
    updateMultipleStudentLinks(linksToRemove,'remove', token)
  } else {
    console.log('no ' + serviceType + ' links to remove')
  }

  if (serviceType === 'iep'){


    const noCaseManagerNeeded = servicesData.filter(service => !googleStudentIds.has(service.studentId) && service.case_manager !== '')

    // console.log(noCaseManagerNeeded)

    if(noCaseManagerNeeded.length > 0){

      let caseManagersToRemove = []
      noCaseManagerNeeded.forEach(link => {
        caseManagersToRemove.push([link.stu_dcid, 'IEP_CASE_MANAGER',''])
      })

      updateMultipleStudentLinks(caseManagersToRemove,'remove', token)
    }
  }

}





