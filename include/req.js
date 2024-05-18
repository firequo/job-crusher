const https = require('https');
async function get_async(url){
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('error', reject);
            res.on('end', () => {
                if(res.statusCode != 200){
                    console.error('statusCode:', res.statusCode);
                    console.error('headers:', res.headers);
                    console.error(data);
                    resolve(null);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        }).on('error', reject);
    });
}
module.exports = {
    get_async,
}
