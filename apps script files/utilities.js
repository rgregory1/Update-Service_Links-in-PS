/**
 *  Creates an arry of objects to process data faster, by mapping
 *  Enables column headers to be reference by name e.g. item.salary || item.bonus
 *  
 *  @param {string} sheetName - name of sheet to return array for
 *  @return {array} items - returns an array of ojects with all the data from the cells of the sheet 
 */
function dataRangeToArray(sheetName) {

  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)  
  const range = sheet.getDataRange()

  // Load values into an array
  const values = range.getDisplayValues();
  // console.log(values)

  // Get the header row as data
  const headers = values.shift();
  // console.log(`Headers: ${headers}`)

  // Map values into object using headers for names
  const items = values.map(function (row) {
    return headers.reduce(function (result, header, i) {
      result[header] = row[i];
      return result;
    }, {});
  });

  // console.log(items)
  return items;
}

function findMultipleY(arr) {
  return arr.filter(student => {
    // Count how many of the specified keys have 'Y' values
    const countY = ['iep', 'ss504', 'est'].reduce((count, key) => {
      return student[key] === 'Y' ? count + 1 : count;
    }, 0);

    // Return students with more than one 'Y'
    return countY > 1;
  });
}


function getDateAsString() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}-${day}-${year}`;
}


