const https = require('https');
const supabaseClient = require('@supabase/supabase-js');
const apiKeyInfo = require('../keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;
const supabase_url = 'https://tivhtpnwbqgcpxwifuej.supabase.co';
const supabase_key = apiKeyInfo.supabaseKey; 
const supabase = supabaseClient.createClient(supabase_url, supabase_key);


(async function() {
    const tagInfo = await supabase
        .from('categories')
        .select('tag')
        .is('avg_salary', null)
    if(tagInfo.error) {
        console.error(tagInfo.error);
        return;
    }

    for(let i = 0; i < tagInfo.data.length; i++){
        let tag = tagInfo.data[i].tag;
        let data = await get_salaries(tag);
        let mean_salary = calcMeanSalary(data.histogram);
        if(mean_salary === 0){
            continue;
        }
        const {error} = await supabase
            .from('categories')
            .update({avg_salary: mean_salary})
            .eq('tag', tag);
        if(error){
            console.error(error);
        }
    }
})()

async function get_salaries(tag){
    const url = `https://api.adzuna.com/v1/api/jobs/us/histogram?app_id=${api_id}&app_key=${api_key}&category=${tag}`;
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
                    console.log(url);
                    resolve(null);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        }).on('error', reject);
    });
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
