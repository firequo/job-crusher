const https = require('https');
const supabaseClient = require('@supabase/supabase-js');
const apiKeyInfo = require('..include/keys.json');
const api_key = apiKeyInfo.apiKey;
const api_id = apiKeyInfo.apiId;
const supabase_url = 'https://tivhtpnwbqgcpxwifuej.supabase.co';
const supabase_key = apiKeyInfo.supabaseKey; 
const supabase = supabaseClient.createClient(supabase_url, supabase_key);


(async function() {
    const url = `https://api.adzuna.com/v1/api/jobs/us/categories?app_id=${api_id}&app_key=${api_key}`;
    let obj = await get_async(url);
    let tosend = [];
    for(let i = 0; i < obj.results.length; i++){
        tosend.push({category: obj.results[i].label, tag: obj.results[i].tag});
    }
    const insert_resp = await supabase
        .from('categories')
        .insert(tosend);

    if(insert_resp.error){
        console.error(insert_resp.error);
    }

})()

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
