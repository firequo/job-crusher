const apiKeyInfo = require('./keys.json');
const supabaseClient = require('@supabase/supabase-js');
const supabase_url = 'https://tivhtpnwbqgcpxwifuej.supabase.co';
const supabase_key = apiKeyInfo.supabaseKey; 
const supabase = supabaseClient.createClient(supabase_url, supabase_key);

async function getInitialSalaries() {
    const select = await supabase
        .from('salaries')
        .select()
        .lt('id', 10)

    if(select.error){
        console.error(select.error);
        return null;
    } 
    return select.data;
}

async function getSalary(job) {
    const {data, error} = await supabase
        .from('salaries')
        .select('salary')
        .eq('job', job);

    if(error){
        console.error(error);
        return null;
    }
    if(data.length == 0){
        console.log('data not in database');
        return null;
    }
    return data[0];
}

async function insertJob(job, salary){
    const {error} = await supabase
        .from('salaries')
        .insert({job: job, salary: salary, search_count: 1});

    if(error){
        console.error(error);
        return false;
    }
    return true;
}

async function getCategories() {
    const cat = await supabase
        .from('categories')
        .select('category, avg_salary, vacancies')
    if(cat.error) {
        console.error(cat.error);
        return null;
    }
    return cat.data;
}

module.exports = {
    getInitialSalaries, getSalary, insertJob, getCategories,
}
