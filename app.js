const express = require('express');
const https = require('https');

const app = express();
const port = 3000;
let jobs = [
    'software developer',
    'help desk',
    'technical support',
    'project management',
    'operations',
];
let apiKeyInfo = require('./keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile('public/Home_Page.html', {root: __dirname});
});
app.get('/salary/top', (req, res) => {
    let retval = getDataFile();
    console.log(retval);
    res.send(retval);
});

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});

// use this as template for requests
function sample_http_request(){
    let url = 'https://whatever.com';
        https.get(url, (res) => {
            let data = [];
            res.on('data', chunk => {
                data.push(chunk);
            });
            res.on('end', () => {
                const json = JSON.parse(Buffer.concat(data).toString());
                // change here

            });
        }).on('error', (e) => {
            console.error(e);
        });
}

// mock request
// not a fan of json
let testfile = require('./ex_resp.json');
function getDataFile(){
    let retval = {};
    console.log(testfile);
    let meanSalary = calcMeanSalary(testfile.histogram);
    console.log(`mean salary: ${meanSalary}`);
    retval[jobs[0]] = meanSalary;
    return retval;
}
// this function makes a request for each job in the list up top, so prob gonna set up a syncer to db once a day or smth to not spam
// PLEASE DO NOT TEST USING THIS 
// it will fuck 
function getDataHttp(){
    let retval = {};
    for(let i = 0; i < jobs.length; i++){
        const job = jobs[i];
        const url = `https://api.adzuna.com/v1/api/jobs/us/histogram?app_id=${api_id}&app_key=${api_key}&what=${job}&content-type=application/json`;

        https.get(url, (res) => {
            let data = [];
            res.on('data', chunk => {
                data.push(chunk);
            });
            res.on('end', () => {
                const json = JSON.parse(Buffer.concat(data).toString());
                console.log(json);
                let meanSalary = calcMeanSalary(json.histogram);
                console.log(`job: ${job} mean salary: ${meanSalary}`);
                retval[job] = meanSalary;
            });
        }).on('error', (e) => {
            console.error(e);
        });
    }
    return retval;
}
function calcMeanSalary(histogram){
    console.log(histogram);
    let sum = 0;
    let counter = 0;
    // other ways of looping over this were straight up not working, no idea why
    // boomer loops win again ig
    let keys = Object.keys(histogram);
    console.log(keys);
    for(let i = 0; i < keys.length; i++){
        let salary = keys[i];
        let amount = Number(histogram[salary]);
        let count = Number(amount);
        sum += Number(salary) * count;
        counter += count;
    }
    console.log(counter);
    console.log(sum);
    return sum / counter;
}
