# RUN PARK (Race Time) - by up2199496
## Key features
This is Run Park, an application designed for park runs. This section outlines the key features of the application, which was developed to record runners' times and positions as they cross the finish line. Additionally, the application includes several features that enhance the experience for both event organisers, volunteers and participants.

### Multi-user Friendly
Once the application has loaded, you will be greeted with the information page as well as the dropdown bar on the top right. Use the dropdown to switch between different user views - **runner**, **volunteer** or **admin**. If you have one device, you can open multiple browser tabs to simulate multiple clients as the application currently uses **session storage** to store `client id`. Multiple volunteers can then send data to the server which will then be displayed on the admins' UI allowing for modification or use to create results (other key features).

The use of session storage for `client id` was for testing purposes, allowing me to simulate multiple users on a single device and ensure the application could handle many users simultaneously, which would happen in a the real scenario. 

I transitioned from using in-memory arrays stored on the server to using sqlite3. This change will allow multiple user's data to be stored for the application at one time. However, I did encounter an error in my application, where if there are multiple admins, editing and creating results may cause data to be overwritten due to the data being stored in a shared database. 

### Offline/ Airplane Mode and Automatically sync the Data to Server:
The application is can still be used even if there is no internet connection or server is unavailable. 

To see this you either:
1. Terminate the server in the terminal 
2 Open **DevTools** in your browser, click **>> → Application**, then navigate to the **Service Worker** tab and check the **"Offline"** box and refresh the page a few times to ensure offline mode is activated.

In offline mode: 
The volunteers and admins can still use the application as normal (e.g record times, submit runners data and creating results). However, when they attempt to submit data to the server they will encounter an error popup that explain they are *offline* and their current data is **stored locally** and will be automatically sync to the server once their connection has restored.

Once the volunteer and admin have reconnected, they will be see that their previous data have been synced to the server. Volunteers data will be sent to the admin's using the server. Admins will be able to use the refresh button to see the new data once it has been synced and get the new data. 
If admins created results whilst offline, the results will automatically be published when admins back online, the runners can reload the application and see the results immediately upon reload and this allow  timely results for the runners.

### Record Running Times (Stopwatch)
To record running times (stopwatch), switch to the **Volunteer** view using the dropdown menu on the top right of the screen. Then the volunteer navigation bar will appear, which allows the volunteers to alternate between recording times and recording runners position and id. Click on the **"Time"** in the navigation bar and it should show the stopwatch. Press on the **"Start"** to activate the stopwatch. The button should then turn into **"Record"** allowing the volunteers to record the times. There are also additional buttons - **Stop**, **Reset** and **Submit**.  The **Submit** button will only send data to server when there is at least one recorded time.

This feature is a core part of the application. Its designed to allow volunteers to log the runners finish time when they cross the finish line at the end. In a typical park run event, there are usually at least two volunteers stationed at the finish line recording each runner that pass them incase there's any anomalies, and ensures accurate results. The stopwatch, was specifically designed for volunteers, which includes people that may have limited experience with technology. Therefore, I have made the interface simple and easy to use: 

- Buttons will only appear when they are relevant (e.g **"Start"** changes to **"Record"**). This prevents confusion on how to use the stopwatch.

- The **"Start"**/ **"Record"**/ **"Resume"** button are made larger to make them easily clickable. Other functions like **"Stop"** and **"Submit"** are intentionally less prominent and out of the way to prevent accidental presses.

- The **"Submit"** button will only send data to the server if there is at least one recorded time, preventing empty database records and incomplete data. 

- Once the records have been submitted, the user is redirected to a new page that displays a list of all the submitted entries, along with a **"Clear Time"** button. This design ensures that volunteers **cannot use the stopwatch to record new times** until the current data has been cleared from the local storage on their device. This prevents the risk of duplicating data by unintentionally submitting the same records multiple times.

### Recording runners position and id (Submission Form)
To record runners position and runners id (Submission), switch to the **Volunteer** view using the dropdown menu on the top right of the screen. Then the volunteer navigation bar will appear, which allows the volunteers to alternate between recording times and recording runners position and runners id. Click on the **"Submission"** in the navigation bar and it should show the submission page. There will be two input boxes for runner's position and runner's id, a **Add Runner** button which add the runners to the submission to a local array and a **Done** button which sends the array to the server.

This feature is a core part of the application. Its designed to allow volunteers to log the runners position and id after they cross the finish line at the end. In a typical park run event, there would get a position token and their runner id which would already be registered in the system. To simulate runners' data already stored, I used a **CSV file containing 40** runner IDs with first and last names. The application add validation, ensuring a volunteer can not submit an id number that is not recognised from the csv file. This feature is designed with the volunteer in mind which includes people that may have limited experience with technology. Therefore, I have made the interface simple and easy to use: 

- The **"Position"** and **"ID Number"** input boxes are initially empty to prevent confusion with what needs to be send if there was a placeholder. Additionally, users are prevented from sending negative numbers or anything that is not a number.

- The **"Add Runner"** button are made larger to make them easily clickable. Other functions like **"Done"** are intentionally less prominent and out of the way to prevent accidental pressing.
 
- To enhance speed and usability, the input process is streamlined:
    - Pressing **Enter** while focused on the **Position input** automatically moves the cursor to the **ID Number** field.
    - Pressing **Enter** from the **ID Number** field automatically triggers the **Add Runner** action. So the user does not need to manually click the button each time.

- The **Done** will only send data to the server if there is at least one recorded runner, preventing empty database records and incomplete data.

- Once the records have been submitted, the user is redirected to a new page that displays a list of all the submitted entries, along with a **"Clear Runners"** button. This design ensures that volunteers **cannot use the submissions to record new runners** until the current data has been cleared from the local storage on their device. This prevents the risk of duplicating data by unintentionally submitting the same records multiple times.

### Modification of Data Stored
To modify data sent by volunteers, switch to the **Admin** view using the dropdown menu on the top right of the screen. Then the **Race Data Overview** table, which shows data submitted by volunteers. If no data has been received from volunteers, the table will be empty. In this case, continue refreshing the page until submissions arrive. Once data is available, each row in the table represents a submission from a volunteer. Clicking on a row will display the full list of recorded times from that submission, along with an **"Edit"** button that navigates to the **modification page**.

This page allows admins to:
- **Edit** or **Delete** the data on each row.
- **Add** new data/ rows manually.
- **Save** changes that have been made and update the results in the database and display

This functionality is for admins to make corrections in the event of inaccuracies, errors, or anomalies in the data sent by volunteers and resolve conflicts by removing duplicated or inconsistent data. In a typical park run, there are multiple submissions and the admin can compare and combine times from different sources to generate a more accurate final result. Other features I have included was:

- **Popup interface** for only when needed to prevent confusion and makes the process focused.
- **Timestamped** each submission to help the o help the admin determine which data was received first, and to identify potentially unusual or out-of-sync entries.

### Create and Merge Results
To create results using the data sent by volunteers, switch to the **Admin** view using the dropdown menu on the top right of the screen. Then the **Race Data Overview** table. which shows data submitted by volunteers. If no data has been received from volunteers, the table will be empty. In this case, continue refreshing the page until submissions arrive. 

Once data is available, the **"Create"** button will appear. When clicked, the table will append a new column with checkboxes will appear next to each row of submission and the admin can manually select multiple records that they want to merge together to create one single set of results allowing them to have total control over the merging process. This was designed for admins to easily create results with a simple process that is not too complicated.

This design simulates a park run events where more than one volunteer submits times, and slight differences between submissions are expected.

While multiple submissions can be merged, the system **does not currently detect duplicate records**. This means that if the same runner’s time appears more than once across different submissions, it may be included multiple times in the final result. This could lead to inaccurate outcomes for the runners. This was something I would like to improve when I have more time in the future.

### View and Export Results in a CSV File
To view and export results, switch to the **Runners** view using the dropdown menu on the top right of the screen. This screen should show the **"Overall Results"** table, which shows the single set of results submitted by the admin. If no results has been received, the table will be empty. In this case, continue refreshing the page until results arrive. 

Once there are a set of results (at least one record inside), the **"Download Results"** button should appear. Once clicked, the browser should download a csv file called **"race_results.csv"** containing all the data you see on the results table in a csv format. 

This page was made to be as simple and accessible as possible, as this is for runners - ranging from children to adults varying levels of technical experiences.

## AI
Replace this with DETAIL about your use of AI, listing of the prompts you used, and whether the results formed or inspired part of your final submission and where we can see this (and if not, why not?). You may wish to group prompts into headings/sections - use markdown in any way that it helps you communicate your use of AI.  Tell us about what went right,  what went horribly wrong and what you learned from it.

### Prompts to develop XYZ (example)
A sequence of prompts helped me develop this feature:
