const https = require('https');
const supabaseClient = require('@supabase/supabase-js');
const apiKeyInfo = require('../keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;
const supabase_url = 'https://tivhtpnwbqgcpxwifuej.supabase.co';
const supabase_key = apiKeyInfo.supabaseKey; 
const supabase = supabaseClient.createClient(supabase_url, supabase_key);
const areas = [
    'Texas',            'California',    'Virginia',
    'New York',         'Illinois',      'Maryland',
    'Pennsylvania',     'Florida',       'Georgia',
    'Washington',       'Ohio',          'North Carolina',
    'Massachusetts',    'New Jersey',    'Michigan',
    'Missouri',         'Colorado',      'Minnesota',
    'Wisconsin',        'Arizona',       'Indiana',
    'Tennessee',        'Alabama',       'Oregon',
    'Iowa',             'Utah',          'South Carolina',
    'Kentucky',         'Arkansas',      'Oklahoma',
    'Washington, D.C.', 'Louisiana',     'Kansas',
    'Connecticut',      'Mississippi',   'Nebraska',
    'New Mexico',       'Nevada',        'Delaware',
    'Idaho',            'West Virginia', 'Hawaii',
    'Montana',          'New Hampshire', 'South Dakota',
    'Maine',            'North Dakota',  'Rhode Island',
    'Vermont',          'Wyoming',       'Alaska',
    'Puerto Rico',      'Guam'
];
(async function() {
})()
async function get_with_areas(){
    const tagInfo = await supabase
        .from('categories')
        .select('tag')
        .is('vacancies', null)
    if(tagInfo.error) {
        console.error(tagInfo.error);
        return;
    }
    for(let i = 0; i < tagInfo.data.length; i++){
        let tag = tagInfo.data[i].tag;
        let total_jobs = 0;
        for(let j = 0; j < areas.length; j++){
            let data = await get_vacancies(tag, areas[j]);
            if(data === null) {
                continue;
            }
            let area_jobs = get_total_jobs(data.locations);
            total_jobs += area_jobs;
        }
        console.log(total_jobs);
        const {error} = await supabase
            .from('categories')
            .update({vacancies: total_jobs})
            .eq('tag', tag);
        if(error){
            console.error(error);
        }
    }
}

async function get_working(){
    for(let i = 0; i < tagInfo.data.length; i++){
        let tag = tagInfo.data[i].tag;
        let data = await get_vacancies(tag, null);
        if(data === null) {
            continue;
        }
        let total_jobs = get_total_jobs(data.locations);
        const {error} = await supabase
            .from('categories')
            .update({vacancies: total_jobs})
            .eq('tag', tag);
        if(error){
            console.error(error);
        }
    }
}
function get_total_jobs(locations){
    let total = 0;
    for(let i = 0; i < locations.length; i++){
        total += Number(locations[i].count);
    }
    return total;
}
async function get_vacancies(tag, location){
    let url;
    if(location){
        url = `https://api.adzuna.com/v1/api/jobs/us/geodata?app_id=${api_id}&app_key=${api_key}&location0=US&location1=${location}&category=${tag}`;
    }else {
        url = `https://api.adzuna.com/v1/api/jobs/us/geodata?app_id=${api_id}&app_key=${api_key}&category=${tag}`;
    }
    console.log(url);
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            console.log('statusCode:', res.statusCode);
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
