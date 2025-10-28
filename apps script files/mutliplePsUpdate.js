
/**
 * Takes an array of objects with update info for PowerSchool and returns a new array of objects 
 * for the payload of the API hit
 * @param {array} dataList - list containing the student DCID, field to update, and Google Drive ID of each student who needs to be updated
 * @param {string} type - type of list, if it is set to 'links' then the id's will be wrapped in url text
 * @returns {array} listOfObjs - an array of propery formatted payloads
 */
function loadStudentUdateData(dataList,type){


  // dataList = [
  //   ['4276','LINK_504', '234'],
  //   ['4275','LINK_504', '345'],
  //   ['4282','LINK_504', '1'],
  //   ['4273','LINK_504', ''],
  // ]

  if(type == 'links'){

    dataList.forEach(line => {
      line[2] = 'https://drive.google.com/file/d/' + line[2] + '/view'
    })
  }

 
  let listOfObjs = []

  dataList.forEach(data => {
    let thisPayload = {
                        "client_uid": data[0],
                        "action": "UPDATE",
                        "id": data[0],
                        "_extension_data": {
                          "_table_extension": [{
                            "name": "U_STUDENTS_LINKS",
                            "_field": [{
                              "name": data[1],
                              "value": data[2] 
                            }]
                          }]
                        }
                      }
    listOfObjs.push(thisPayload)
  })

  return listOfObjs
}

/**
 * Function to update multiple students at one time in the PowerSchool API
 * @param {array} studentPayload - an array of objects formated for upload as the payload of a PS API call
 */
function updateMultipleStudentLinks(data, type, token) {

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

  let studentPayload = loadStudentUdateData(data, type)

  let url = 'https://missisquoi.powerschool.com/ws/v1/student'

  let options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "payload": JSON.stringify({
      "students": {
        "student": [studentPayload]
      }
    }),
    "muteHttpExceptions": true
  }


  let response = UrlFetchApp.fetch(url, options)

  console.log(response.toString())



}

