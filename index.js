const express = require('express');
const db = require('./include/database.js');
const api = require ('./include/api.js');

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile('public/Home_Page.html', {root: __dirname});
});
app.get('/jobs', (req, res) => {
    res.sendFile('public/Jobs.html', {root: __dirname});
});
app.get('/about', (req, res) => {
    res.sendFile('public/About.html', {root: __dirname});
});
app.get('/contact', (req, res) => {
    res.sendFile('public/Contact.html', {root: __dirname});
});
app.get('/salary/top', async (req, res) => {
    let salaries = await db.getInitialSalaries();
    if(salaries === null) {
        console.error('initial salaries error');
        res.sendStatus(500);
        return;
    }
    res.send(salaries);
});

app.get('/salary/:job', async (req, res) => {
    let job = req.params.job;

    let salary  = await db.getSalary(job);
    if(salary) {
        res.send({[job]: salary});
        return;
    }

    salary = await api.getSalary(job);
    if(salary === null) {
        res.sendStatus(500);
        return;
    }

    res.send({[job]: salary});

    await db.insertJobSalary(job, salary);
});

app.get('/categories', async (req, res) => {
    let categories = await db.getCategories();
    if(categories === null) {
        res.sendStatus(500);
        return;
    }
    res.send(categories);
});
    
app.get('/jobs/:categoryTag', async (req, res) => {
    let tag = req.params.categoryTag;

    let {jobs, date_updated} = await db.getJobsFromCategoryTag(tag);
    // check if updated within the last day
    let today = new Date();
    let update = false;
    if(date_updated){
        let delta_date = today.getTime() - Date.parse(date_updated);
        // change the 24 to desired hours between updates
        let day_timestamp = 1000 * 60 * 60 * 24;
        if(delta_date > day_timestamp) update = true;
    } 
    if(!date_updated || update) {
        jobs = await api.getJobsFromCategoryTag(tag);

        if(jobs === null) {
            res.sendStatus(500);
            return;
        }

        await db.insertJobByCategoryTag(tag, jobs, today.toISOString());
    }
    if(jobs) {
        res.send(jobs);
    }
});

