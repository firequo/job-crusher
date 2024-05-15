const express = require('express');
const https = require('https');
const supabaseClient = require('@supabase/supabase-js');
const apiKeyInfo = require('./keys.json');

const app = express();
const port = 3000;
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
        console.error(select.error);
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
    const obj = await get_async(url);

    let meanSalary = calcMeanSalary(obj.histogram);
    if(meanSalary == 0) {
        ores.send({});
        console.error('bad job name');
        return;
    }
    tosend[job] = meanSalary;
    ores.send(tosend);

    const insert_resp = await supabase
        .from('salaries')
        .insert({job: job, salary: meanSalary, search_count: 1});

    if(insert_resp.error){
        console.error(insert_resp.error);
    }
});

app.get('/categories', async (req, res) => {
    const cat = await supabase
        .from('categories')
        .select('category, avg_salary, vacancies')
    if(cat.error) {
        console.error(cat.error);
        return;
    }
    res.send(cat.data);
});
    
async function get_async(url){
    console.log(url);
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('error', reject);
            res.on('end', () => {
                if(res.statusCode != 200){
                    console.log(data);
                    resolve(null);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        }).on('error', reject);
    });
}


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
    if(counter == 0) return 0;
    return sum / counter;
}


