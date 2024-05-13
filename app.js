const express = require('express');
const https = require('https');
const fs = require('fs');
const supabaseClient = require('@supabase/supabase-js');

const app = express();
const port = 3000;
let apiKeyInfo = require('./keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;
const supabase_url = 'https://tivhtpnwbqgcpxwifuej.supabase.co';
const supabase_key = apiKeyInfo.supabaseKey; 
const supabase = supabaseClient.createClient(supabase_url, supabase_key);

app.use(express.static(__dirname + '/public'));

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
    // currently these have to be in the db or will _probably_ do a poopoo 
    let jobs = [
        'software developer',
        'help desk',
        'technical support',
        'project management',
        'operations'
    ];
    const select = await supabase
        .from('salaries')
        .select()
        .in('job', jobs);

    if(select.error){
        console.error(insert_resp.error);
    } else {
        res.send(select.data);
    }
});

app.get('/salary/:job', async (req, ores) => {
    let job = req.params.job;
    let tosend = {};

    const select_resp = await supabase
        .from('salaries')
        .select()
        .eq('job', job);

    // if in database, send
    // otherwise fetch from api, store in db, and send
    if(select_resp.error == null && select_resp.data.length != 0) {
        tosend[job] = select_resp.data[0].salary;
        ores.send(tosend);
        return;
    } 
    const url = `https://api.adzuna.com/v1/api/jobs/us/histogram?app_id=${api_id}&app_key=${api_key}&what=${job}&content-type=application/json`;

    https.get(url, async (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        let data = '';
        res.on('data', chunk => {
            data += chunk;
        });
        res.on('end', async () => {
            if(res.statusCode != 200){
                console.log(data);
                return;
            }
            const json = JSON.parse(data);
            console.log(json);
            let meanSalary = calcMeanSalary(json.histogram);
            tosend[job] = meanSalary;

            ores.send(tosend);

            const insert_resp = await supabase
                .from('salaries')
                .insert({job: job, salary: meanSalary, search_count: 1});

            if(insert_resp.error){
                console.error(insert_resp.error);
            }
        });
    }).on('error', (e) => {
        console.error(e);
    });
});

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});

function calcMeanSalary(histogram){
    let sum = 0;
    let counter = 0;
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

// use this as template for requests
function sample_http_request(){
    let url = 'https://whatever.com';
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => {
            data += chunk;
        });
        res.on('end', () => {
            const json = JSON.parse(data);
            // change here

        });
    }).on('error', (e) => {
        console.error(e);
    });
}

// function to update average salaries to run daily
// TODO (low prio)

