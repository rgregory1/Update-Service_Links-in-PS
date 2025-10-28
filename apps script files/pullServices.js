
/*****************************************************
 *   
 *    FUNCTION: getCurrentPSSectionEnrollments()
 *    
 *    
 *    
 * 
 ******************************************************/

function getCurrentServicesData(token){

  if(!token){
    console.log('no token')
    token = secretManagerLibrary.ensureFreshToken(
                    '1020400423324',
                    'gc_sync_clientID',
                    'gc_sync_clientsecret',
                    'gc_sync_token'
                    )

    console.log(token)
  }


  const pageSize = 200;
  const url = 'https://missisquoi.powerschool.com/ws/schema/query/org.mvsdschools.servicessync.students'


  // Clear the data currently on the sheet to prepare for the new incoming data
  
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const dataSheet = ss.getSheetByName('servicesData')
  dataSheet.clear()


  const options = {
    "method":"post",
    "headers":{
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    // "muteHttpExceptions": true
    
  }

  // Since PowerQueries are paginated, we need to begin by getting the number of total
  //   results so we can calculate the number of pages in our result.

  let responseCount = UrlFetchApp.fetch(url+"/count",options);
  responseCount = JSON.parse(responseCount).count;
  let pageCount = Math.ceil(responseCount/pageSize);

 
  let cellData = [];


  // Work through each page, querying the data, iterating over each row, and adding it to the cellData
  //   array by constructing a 1-D array, tempRow, and then pushing that onto our cellData array.
  for (let page=1; page<=pageCount; page++)
  {
    
    let result = UrlFetchApp.fetch(`${url}?pagesize=${pageSize}&page=${page}`, options);
    result = JSON.parse(result).record;

    // filter out for school
    result = result.filter(x => x.school_id == '295')
 
    result.forEach(d => {
      // Construct an array representing one row of the spreadsheet
      let tempRow = [
                      d.student_number,
                      d.dcid,
                      d.first_name,
                      d.last_name,
                      d.iep,
                      d.ss504,
                      d.est,
                      d.iep_case_manager,
                      d.link_iep,
                      d.link_504,
                      d.link_est,
                    ]

      // Add this row to our array of rows that we're constructing
      cellData.push(tempRow);
    });
  }

  if (cellData.length > 0)
  {

    const headers = 
      ['studentId','stu_dcid','stu_first','stu_last','iep','ss504','est','case_manager','iep_link','ss504_link','est_link',]
    
    cellData.unshift(headers)

    dataSheet.getRange(1,1,cellData.length,cellData[0].length).setValues(cellData);

    dataSheet.sort(11)
    dataSheet.sort(10)
    dataSheet.sort(9)

    dataSheet.sort(7)
    dataSheet.sort(6)
    dataSheet.sort(5)
  }
}
