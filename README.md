# Update-Service_Links-in-PS
Apps Script code to update specific service links in PowerSchool based on a comparison between what is currently in the fields and what is in specific Google folders.

This project is a Google Apps Script program that
1. Collects all the custom service fields and IEP/504/IEP state fields from PowerSchool with the PS API
2. Compares that data to documents currently in the relevant Google Drive Files
3. Then removes or adds links in the custom service fields for each student
4. Those documents are then added to custom alerts in PowerSchool for each student

The idea is, you add the IEP/504/EST into the appropriate folder, make sure the student's PS student_number is the first part of the PDF name, and the script maintains the links in PowerSchool fields.  These custom fields are then added to custom alerts so those staff with access to the student can see alerts for IEP/504/EST and ONLY those staff with needed access should be able to see the actual document (this is handled by the project https://github.com/rgregory1/sharing-IEP-with-Apps-Script/)
