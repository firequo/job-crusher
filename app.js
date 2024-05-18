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

    let salary = await db.getSalary(job);
    if(salary) {
        let tosend = {};
        tosend[job] = salary;
        res.send(tosend);
        return;
    }

    salary = await api.getSalary(job);
    if(salary === null) {
        console.error('salary api error');
        res.sendStatus(500);
    }

    let tosend = {};
    tosend[job] = salary;
    res.send(tosend);

    let success = await db.insertJob(job, salary);
    if(!success) {
        console.error('insert error');
    }
});

app.get('/categories', async (req, res) => {
    let categories = await db.getCategories();
    if(categories === null) {
        res.sendStatus(500);
    }
    res.send(categories);
});
    


