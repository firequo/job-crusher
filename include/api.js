const r = require('./req.js');
const apiKeyInfo = require('./keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;
const mainURL = 'https://api.adzuna.com/v1/api/jobs/us/'

async function getSalary(job){
    const url = mainURL + `histogram?app_id=${api_id}&app_key=${api_key}&what=${job}&content-type=application/json`;
    const obj = await r.get_async(url);
    if(obj === null){
        console.error('fetch error');
        return null;
    }

    let salary = calcMeanSalary(obj.histogram);
    if(salary == 0) {
        console.error('bad job name');
        return null;
    }
    return salary;
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
    getSalary,
}
