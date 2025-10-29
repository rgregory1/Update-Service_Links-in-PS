# Update-Service_Links-in-PS
Apps Script code to update specific service links in PowerSchool based on a comparison between what is currently in the fields and what is in specific Google folders.

This project is a Google Apps Script program that
1. Collects all the custom service fields and IEP/504/IEP state fields from PowerSchool with the PS API
2. Compares that data to documents currently in the relevant Google Drive Files
3. Then removes or adds links in the custom service fields for each student
4. Those documents are then added to custom alerts in PowerSchool for each student

The idea is, you add the IEP/504/EST into the appropriate folder, make sure the student's PS student_number is the first part of the PDF name, and the script maintains the links in PowerSchool fields.  These custom fields are then added to custom alerts so those staff with access to the student can see alerts for IEP/504/EST and ONLY those staff with needed access should be able to see the actual document (this is handled by the project https://github.com/rgregory1/sharing-IEP-with-Apps-Script/)

<img width="372" height="270" alt="Screenshot 2025-10-29 at 10 04 36 AM" src="https://github.com/user-attachments/assets/1e7c08d1-d70c-4f48-8ee3-54be6e1b2644" />

## Google Requirements
An example Google Sheets spreadsheet can be found here: [https://docs.google.com/spreadsheets/d/1TU4FJlAj0AovTc6UOs3uZoFelIBnKCgRCnuvrPdjIKg/edit?usp=sharing](https://docs.google.com/spreadsheets/d/10oCEQfmozzIxoZZK_xUG-23iO-0Pw7vm0hBpvI55EDE/edit?gid=0#gid=0) This spreadsheet offers a visual of the process as it happens.
