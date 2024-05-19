# Job crusher

Table of contents:
- [Project Information](#pinfo)
- [Developer Manual](#manual)
    - [Quickstart](#quickstart)
    - [Full Guide](#full-guide)
        - [Local Keys](#local-keys)
        - [Setting up a Copy of the Database (Very Unlikely)](#db-setup)
- [Endpoint Documentation](#endpoints)
- [Known Issues and Future Development](#issues-future)
 
<a id="pinfo"></a>

## Description: 

This website provide a quick overview of the jobs and the salary of each job. User can do some quick research about their future career through this website. On this website, user can browse to many jobs, they can also browse by categories.  

## Target browsers: 

All modern desktop browsers. 

<a id="manual"></a>

# DEVELOPER MANUAL:

<a id="quickstart"></a>

## Quickstart (for development):

    git clone https://github.com/firequo/job-crusher.git

    git switch dev 

    npm install

Load keys into keys_example.json and rename to keys.json.  click [here](#loading-keys) for more info

    npm start

Access the server at localhost:3000

<a id="full-guide"></a>

## Full guide: 

### For development work:

Clone the repository and switch to the dev branch:

    git clone https://github.com/firequo/job-crusher.git

    git switch dev 

Then do 

    npm install

This will install the dependencies for the project. These dependencies are:

> expressjs: this provides the server functionality for our backend
>
> nodemon: this provides reloads of the server during development
>
> @supabase/supabase-js: This provides a javascript client for the database service we are using.

<a id="local-keys"></a>

### Local Keys

For development purposes, keys for adzuna and for supabase must be in a file called keys.json to run the local server.
In production, these variables are in environment variables in Vercel.

**To get local keys:**
> Register for an Adzuna account at https://developer.adzuna.com/overview
>
> Enter the api key and the app id for adzuna into keys_example.json and change the name to keys.json 
>
> Get the supabase key from one of the maintainers and add it to keys.json
>
> If you want to create a new database, it is more involved. Please click [here](#db-setup) for instructions.

### Start a local server

To start a live-reloading local server:

    npm start

Access the server at localhost:3000

<a id="db-setup"></a>

## Setting up another database

# ONLY DO THIS IF YOU ARE CERTAIN YOU NEED IT

1. Create a supabase account
2. Create a salaries table (turning off RLS)
3. Create a categories table (turning off RLS)
4. Add your supabase key to include/keys.json
5. Change the supabase url in include/databases.js
6. Change the supabase url in scripts/categories.js
7. Change the supabase url in scripts/areas.js
8. Change the supabase url in scripts/salaries.js
9. Run scripts/categories.js to save the category information from the API to the database
    node scripts/categories.js
10. Run scripts/salaries.js to get salary information for each category
    node scripts/salaries.js
11. Run scripts/areas.js to get vacancy information for each category
    node scripts/areas.js

<a id="endpoints"></a>

## Endpoint documentation

### Static files

GET / : sends the home page html file
GET /jobs : sends the jobs html file
GET /about : sends the about html file
GET /contact : sends the contact html file

### Fetching data

GET /salary/top :  gets an array of several jobs (with the lowest ids) with their average salary from the database
GET /salary/:job : gets the average salary information for a given job string. This queries the database, if it is not found in the database this information is loaded from the Adzuna API and saved in the database for future lookups 
GET /categories : gets job category information from the database
GET /jobs/:categoryTag : this gets information on five jobs matching a category tag. It queries the database. If it is not found in the database or the entry was last updated over a day ago, it queries the API and updates the database.

**Database queries are stored in include/database.js**

**API queries are stored in include/api.js**

<a id="issues-future"></a>

## Known issues and future development

**Issues:**
- The charts despawn after a period of inactivity when the window is in the background. They reappear when moused over. No idea why, maybe due to garbage collection or something.
- Site formatting works poorly on mobile
- Scripts for initial population of databases are not robust and were made to be used once and thrown away (should work fine but YMMV)

**Future Development:**
- Make a mobile version of the site
- Refactor jobs.html
- Add more pages and more functionality
- Update average salaries and vacancies automatically
