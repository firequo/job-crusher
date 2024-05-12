const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 3000;
let jobs = [
    'software developer',
    'help desk',
    'technical support',
    'project management',
    'operations'
];
let avgSalaries = require('./average_salaries.json');
let apiKeyInfo = require('./keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile('public/Home_Page.html', {root: __dirname});
});
app.get('/salary/top', (req, res) => {
    res.send(avgSalaries);
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
let testfile = require('./ex_resp.json');
function getDataFile(){
    let retval = {};
    console.log(testfile);
    let meanSalary = calcMeanSalary(testfile.histogram);
    console.log(`mean salary: ${meanSalary}`);
    retval[jobs[0]] = meanSalary;
    return retval;
}
let averageSalaries = {};
let today = new Date();
// if(today.getHours()  == 1 && today.getMinutes() == 0){
//     //nodemon makes this an infinite loop, dont run this please ever
//     getDataHttp(0, averageSalaries, saveSalaries);
// }
function saveSalaries(json){
    var string = JSON.stringify(json);
    fs.writeFileSync('average_salaries.json', string, 'utf8', );
}
// this function makes a request for each job in the list up top, so prob gonna set up a syncer to db once a day or smth to not spam
// code above does the full call and saves it to a file when the server starts
// do NOT use with nodemon
// PLEASE DO NOT TEST USING THIS 
// it will fuck 
// cursed
// adzuna does not allow concurrent requests, so have to do it this way smh
function getDataHttp(i, retval, callback){
    const job = jobs[i];
    const url = `https://api.adzuna.com/v1/api/jobs/us/histogram?app_id=${api_id}&app_key=${api_key}&what=${job}&content-type=application/json`;

    https.get(url, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        let data = [];
        res.on('data', chunk => {
            data.push(chunk);
        });
        res.on('end', () => {
            const newdata = Buffer.concat(data).toString();

            if(res.statusCode == 200){
                const json = JSON.parse(newdata);
                console.log(json);
                let meanSalary = calcMeanSalary(json.histogram);
                console.log(`job: ${job} mean salary: ${meanSalary}`);
                retval[job] = meanSalary;
                if(i == jobs.length - 1){
                    console.log(retval);
                    callback(retval);
                } else {
                    getDataHttp(i + 1, retval, callback);
                }
            }
        });
    }).on('error', (e) => {
        console.error(e);
    });
}
function calcMeanSalary(histogram){
    let sum = 0;
    let counter = 0;
    // other ways of looping over this were straight up not working, no idea why
    // boomer loops win again ig
    let keys = Object.keys(histogram);
    for(let i = 0; i < keys.length; i++){
        let salary = keys[i];
        let amount = Number(histogram[salary]);
        let count = Number(amount);
        sum += Number(salary) * count;
        counter += count;
    }
    return sum / counter;
}
