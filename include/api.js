const r = require('./req.js');
const api_key = process.env.apiKey;
const api_id =  process.env.apiId;
const mainURL = 'https://api.adzuna.com/v1/api/jobs/us'

async function getSalary(job){
    const url = mainURL + `/histogram?app_id=${api_id}&app_key=${api_key}&what=${job}&content-type=application/json`;
    const obj = await r.get_async(url);
    if(obj === null){
        console.error('ERROR: API salary request');
        console.error('ERROR: fetch error');
        return null;
    }

    let salary = calcMeanSalary(obj.histogram);
    if(salary == 0) {
        console.error('ERROR: API salary parse');
        console.error('ERROR: bad job name');
        return null;
    }
    console.log('SUCCESS: API salary request');
    return salary;
}

async function getJobsFromCategoryTag(tag){
    const url = mainURL + `/search/1?app_id=${api_id}&app_key=${api_key}&results_per_page=5&category=${tag}`;
    const obj = await r.get_async(url)
    if(obj === null){
        console.error('ERROR: API jobs request');
        console.error('ERROR: fetch error');
        return null;
    }
    console.log('SUCCESS: API jobs request');
    return obj.results;
}

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

module.exports = {
    getSalary, getJobsFromCategoryTag,
}
