# RUN PARK (Race Time) - by up2199496
## Key features
This is Run Park, an application designed for Parkruns. This section outlines the key features of the application, which was developed to record runners' times and positions as they cross the finish line. Additionally, the application includes several features that enhance the experience for both event organisers, volunteers and participants.

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
The runner's data are stored in a **CSV** so that the application can still get runner's details whilst offline or unable to reach the server

The volunteers and admins can still use the application as normal (e.g record times, submit runners data and creating results). However, when they attempt to submit data to the server they will encounter an error popup that explain they are *offline* and their current data is **stored locally** and will be automatically sync to the server once their connection has restored.



Once the volunteer and admin have reconnected, they will be see that their previous data have been synced to the server. Volunteers data will be sent to the admin's using the server. Admins will be able to use the refresh button to see the new data once it has been synced and get the new data. 
If admins created results whilst offline, the results will automatically be published when admins back online, the runners can reload the application and see the results immediately upon reload and this allow  timely results for the runners.

### Record Running Times (Stopwatch)
To record running times (stopwatch), switch to the **Volunteer** view using the dropdown menu on the top right of the screen. Then the volunteer navigation bar will appear, which allows the volunteers to alternate between recording times and recording runners position and id. Click on the **"Time"** in the navigation bar and it should show the stopwatch. Press on the **"Start"** to activate the stopwatch. The button should then turn into **"Record"** allowing the volunteers to record the times. There are also additional buttons - **Stop**, **Reset** and **Submit**.  The **Submit** button will only send data to server when there is at least one recorded time.

This feature is a core part of the application. Its designed to allow volunteers to log the runners finish time when they cross the finish line at the end. In a typical Parkrun event, there are usually at least two volunteers stationed at the finish line recording each runner that pass them incase there's any anomalies, and ensures accurate results. The stopwatch, was specifically designed for volunteers, which includes people that may have limited experience with technology. Therefore, I have made the interface simple and easy to use: 

- Buttons will only appear when they are relevant (e.g **"Start"** changes to **"Record"**). This prevents confusion on how to use the stopwatch.

- The **"Start"**/ **"Record"**/ **"Resume"** button are made larger to make them easily clickable. Other functions like **"Stop"** and **"Submit"** are intentionally less prominent and out of the way to prevent accidental presses.

- The **"Submit"** button will only send data to the server if there is at least one recorded time, preventing empty database records and incomplete data. 

- Once the records have been submitted, the user is redirected to a new page that displays a list of all the submitted entries, along with a **"Clear Time"** button. This design ensures that volunteers **cannot use the stopwatch to record new times** until the current data has been cleared from the local storage on their device. This prevents the risk of duplicating data by unintentionally submitting the same records multiple times.

### Recording runners position and id (Submission Form)
To record runners position and runners id (Submission), switch to the **Volunteer** view using the dropdown menu on the top right of the screen. Then the volunteer navigation bar will appear, which allows the volunteers to alternate between recording times and recording runners position and runners id. Click on the **"Submission"** in the navigation bar and it should show the submission page. There will be two input boxes for runner's position and runner's id, a **Add Runner** button which add the runners to the submission to a local array and a **Done** button which sends the array to the server.

This feature is a core part of the application. Its designed to allow volunteers to log the runners position and id after they cross the finish line at the end. In a typical Parkrun event, there would get a position token and their runner id which would already be registered in the system. To simulate runners' data already stored, I used a **CSV file containing 40** runner IDs with first and last names. The application add validation, ensuring a volunteer can not submit an id number that is not recognised from the csv file. This feature is designed with the volunteer in mind which includes people that may have limited experience with technology. Therefore, I have made the interface simple and easy to use: 

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

This functionality is for admins to make corrections in the event of inaccuracies, errors, or anomalies in the data sent by volunteers and resolve conflicts by removing duplicated or inconsistent data. In a typical Parkrun, there are multiple submissions and the admin can compare and combine times from different sources to generate a more accurate final result. Other features I have included was:

- **Popup interface** for only when needed to prevent confusion and makes the process focused.
- **Timestamped** each submission to help the o help the admin determine which data was received first, and to identify potentially unusual or out-of-sync entries.

### Create and Merge Results
To create results using the data sent by volunteers, switch to the **Admin** view using the dropdown menu on the top right of the screen. Then the **Race Data Overview** table. which shows data submitted by volunteers. If no data has been received from volunteers, the table will be empty. In this case, continue refreshing the page until submissions arrive. 

Once data is available, the **"Create"** button will appear. When clicked, the table will append a new column with checkboxes will appear next to each row of submission and the admin can manually select multiple records that they want to merge together to create one single set of results allowing them to have total control over the merging process. This was designed for admins to easily create results with a simple process that is not too complicated.

This design simulates a Parkrun events where more than one volunteer submits times, and slight differences between submissions are expected.

While multiple submissions can be merged, the system **does not currently detect duplicate records**. This means that if the same runner’s time appears more than once across different submissions, it may be included multiple times in the final result. This could lead to inaccurate outcomes for the runners. This was something I would like to improve when I have more time in the future.

### View and Export Results in a CSV File
To view and export results, switch to the **Runners** view using the dropdown menu on the top right of the screen. This screen should show the **"Overall Results"** table, which shows the single set of results submitted by the admin. If no results has been received, the table will be empty. In this case, continue refreshing the page until results arrive. 

Once there are a set of results (at least one record inside), the **"Download Results"** button should appear. Once clicked, the browser should download a csv file called **"race_results.csv"** containing all the data you see on the results table in a csv format. 

This page was made to be as simple and accessible as possible, as this is for runners - ranging from children to adults varying levels of technical experiences.

## AI
Replace this with DETAIL about your use of AI, listing of the prompts you used, and whether the results formed or inspired part of your final submission and where we can see this (and if not, why not?). You may wish to group prompts into headings/sections - use markdown in any way that it helps you communicate your use of AI.  Tell us about what went right,  what went horribly wrong and what you learned from it.

Here is a breakdown of how AI was used, what kinds of prompts used and a reflection on what work well adn what did not.

### Understand HTTP Status Code
**Prompt Used:**
>What does each status code mean?

At the start, I use AI to clarify what each status code meant and when to use each status code in which scenario. This helped me write the server responses which helped me debug and ensure that my application handled errors and success cases correctly. You can see I have used the status codes in the server for the responses. In that server I had mainly use **status (500)** as most are server error and **status (200)** because they have successfully done the task. There are some **status (400)** which means there are client errors or a page not found, it little but I had added that in to help with debugging and error handling.

### SQlite3 Commands and Their Differences
**Prompt Used:**
>sqlite3 command
>sqlite3 command all node.js
>Difference between .get and .all
>Why does .get break when there are no matching data

When I started to write the database, I had needed to understand the SQLite3 commands. It returned all the **database basics**, **table operations**, **data manipulation**, **querying data**, **constraints** and **programmatic use**. I had use a lot of it as seen in the `source_sqlite.js` and in the `001-initial.sql`. 

The querying data allowed me to do the get and post request as most of it was **Inserts** and **SELECT**. The data manipulation allowed me to add constrains and unique onto the database for error handling and only allowing one set of race results at a time to prevent and errors.

However, when I continued developing, I have found I have encounter an error with `getAllData` but not `getRaceResults`, so I ask  "the difference between .get and .all" and it said `.all` fetches all the matching rows but`.get` fetches the first matching row. I understood if `.get` does not have a match, it returns *undefinded* but if `.all` does not have a match, it returns *[]*. So ultimately I made all data to return an empty array [] if there are no matches to prevent ant errors.

### How to Process a CSV in JS
**Prompt Used**
>How to use a csv file in js.

When I began writing JavaScript, I needed to create a function that could read a CSV file and return the data it contained to access the runners' information. However, I wasn't sure how to properly format the file and convert its contents into an array, so I asked AI "how to use a csv file in js" and ended up modifying a response so that it would return an array instead of objects. This function is located in `client/functions/common.js`. It works very well, allowing me to retrieve data even when the application is offline, and also helps simulate a real Parkrun scenario where runners' information is already pre-registered.


### Client ID
**Prompt Used**
>how to use js and make a random bunch of numbers and letters like asda12312asdfa
>is there another way?

I wanted to generate a client ID to retrieve specific data stored in the database, but I wasn’t sure how to create a string made up of random letters and numbers. I asked ai "how to use js and make a random bunch of numbers and letters like asda12312asdfa" and the method it responded wasn’t ideal, so I asked for an alternative approach. The next response game me a simple to understand and easy code to implement and I used the one-liner that generates a random string and adapted it to fit into my function. This function, which generates the `client ID`, is located in `client/functions/common.js`.


### Import/Export
**Prompt Used**
>what does type:module do?
>`..[code].. guide me step by step to make this work with ES module

When I added my database and separated my functions into individual JS files, I needed to include `"type": "module"` in my `package.json` to use **ES modules**. However, this caused an error with my server. I asked AI "what does "type": "module" do", and it explained that it tells **Node.js** to treat `.js` files as **ES modules** instead of using the default **CommonJS** format. That’s when I realised I needed to update the file paths in my server code for the file path. Since I wasn’t sure how to do that, I provided AI with the beginning of my old server code and asked it to guide me step by step in converting it. I followed the guidance, and the updated code can now be found from lines 1 to 23 in `srvr.js`.

### How to Create Buttons
**Prompt Used**
>if i had an array, how to make it for every item in the array, create two buttons next to it?

For the admin (modify) page, I wanted to add two buttons next to each row of data, but I wasn’t sure how to create and format them next to th display properly. I asked AI how to add two buttons to every item in an array, and it provided a helpful example. I used the syntax as a starting point and adapted it to my own code, which can be seen from lines 107 to 134 in `/client/functions/admin.js`. It worked really well, and I customised the implementation to handle both modifying times and runner submissions. This experience also helped me later when developing the checkboxes for the "create result" pages, as I applied the same concept—just formatted differently since one used a list and the other a table.

### Check By Format
**Prompt Used**
>how to check if the text input is in a 00:00:00:000 format in js and explain
>what does test() do?

When an admin modify's the time data, I wanted to ensure that the input is following the **"HH:MM:SS:MMM"** format bI wasn’t sure how to implement this validation, so I asked AI for help and taught me how the solution but there was a `test()` in the code that was not clear and i then asked *"what does test() do?"* and it responded that it was a  function was and how it check if a string matches a pattern. I used the code provided and adapted the code to be usable for my function. This can be found in`/client/functions/admin.js` from lines 154 to 158.

### Adding Header Cell
**Prompt Used**
>how to add a header cell js to a table

When the admin click create button, the function creates a checkbox for each row but there would be no header cell for the checkbox column which affect the **CSS**, and understanding of the app as there would be random checkboxes. To fix this, I used AI to teach me "how to add a header cell" With its guidance, I was able to implement the solution, which can be found in /client/functions/admin.js from lines 364 to 380. It was very useful as it had also helped me understand how to remove the header cell later if needed, using both what I already knew and what I learned from AI.

### Add checkbox
**Prompt Used**
>I have an array of item  to add a check box for every row and how to use the checkbox and its value? in js
>and in my array, each item carry more data inside, how do i use it?

When the admin clicks the create button, the function generates a checkbox for each row, allowing them to select entries. I already knew how to create checkboxes for each row from my own research and earlier AI guidance with adding buttons. However, the challenge was figuring out how to retrieve data from the selected checkboxes. In one of the responses, AI suggested using a `custom data-` attribute, which I used to store the relevant data arrays and data type. This implementation can be found on lines 393 and 403 in `/client/functions/admin.js.` This approach worked very well, and it helped me better understand how checkboxes function. It also made it much easier to collect all the selected data and merge it later to create a result.


### Explain code
**Prompt Used**
>..[code].. explain

To load a CSV file of runner results, I found a simple and easy-to-understand example on a website. However, I wanted to make sure I fully understood how it worked, so I asked AI to explain it in more detail. After gaining a better understanding, I wrote my own code following a similar structure to the example I found. This implementation can be seen in `client/functions/results.js` from lines 22 to 52. It works very well, as the clear structure made the logic easy to follow, and when errors occurred, they were simple to fix since I knew exactly how the code operated.

### Offline/ Ping Server
I wanted to make a feature so that when the users are offline, the local storage data will be kept locally UNTIL they get back online. Once they are online I wanted to be able to automatically sync the data to the server. Since I knew how to code how to send stuff to the server, the automatically syncing would not be the hard part but rather check if the internet connection was on and if the server was reachable.

I asked AI "how to check if there is internet connection with js?" and it told me to use `navigator.onLine` but this detects network connection and not actual internet access. So then I asked "how to check if the server is reachable adn online with js?" and it gave me back an `await fetch` that gets the status code by using `HEAD`. I did not fully understand so I asked "so how does that differ from navigator.online?" It tells me if the browser is online but does not check if the server is reachable, where as the `fetch` does. 

Then I asked AI to explain the `fetch` so I could get complete understand, but there were some thing I couldn't wrap my head around, so I asked a lecture to explain more detail. After I got complete understand of the code I then asked AI "if !navigator.online  returns true does that mean the browser/wifi AND server is offline?" then it said that it does not guarantee it. So using all of this information I started coding the `isApplicationOnline` function and created the automatically sync function which works completely. 

However, I did encounter a problem with my localStorageData as it will automatically send the data from local storage which I do not want to be sent or removed, so I fixed that by adding another local storage variable

**Prompt Used**
>how to check if there is internet connection with js?
>how to check if the server is reachable and online with js?
>so how does that differ from navigator.online?
>explain each step?
>if !navigator.online  returns true does that mean the browser/wifi AND server is offline?

### Window Reload
**Prompt Used**
>how to make the window reload js?

I wanted to include a feature where the window would automatically reload every couple minutes, so I asked AI "how to make the window reload js?" since I know I could add `setInterval` and make it automatic. When I started implementing it, I encountered and issues where the window will reset to the information page. So then I added pages to be assigned to session storage, so that when on reload it will not disappear, but due to the way the app had been coded to hide and show elements, when the window reset on a "page" like **"Timer"** or **"Submission"** the elements will all disappear. So I decided to not use that idea and instead make a reload button on specific pages like **"Runners"** and **"Admins"** so they can refresh to get the data.

### All Prompts Used
```What does each status code mean?```
```sqlite3 command```
```sqlite3 command all node.js```
```Difference between .get and .all```
```Why does .get break when there are no matching data```
```How to use a csv file in js.```
```how to use js and make a random bunch of numbers and letters like asda12312asdfa```
```is there another way?```
```Is local storage and session storage syntax the same?```
```what does type:module do?```
```..[code].. guide me step by step to make this work with ES module```
```if i had an array, how to make it for every item in the array, create two buttons next to it?```
```how to check if the text input is in a 00:00:00:000 format in js and explain```
```how to add a header cell js to a table```
```..[code].. explain``
```how to check if the server is reachable adn online with js?```
```how to check if there is internet connection with js?```
```how to check if the server is reachable and online with js?```
```so how does that differ from navigator.online?```
```explain each step?```
```if !navigator.online  returns true does that mean the browser/wifi AND server is offline?```
```how to make the window reload js?```