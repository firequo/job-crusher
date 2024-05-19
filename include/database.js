const supabaseClient = require('@supabase/supabase-js');
const supabase_url = 'https://tivhtpnwbqgcpxwifuej.supabase.co';
const supabase_key = process.env.supabaseKey; 
const supabase = supabaseClient.createClient(supabase_url, supabase_key);

async function getInitialSalaries() {
    const {data, error} = await supabase
        .from('salaries')
        .select()
        .lt('id', 10)

    if(error){
        console.error('ERROR: GET initial salaries');
        console.error(error);
        return null;
    } 
    if(data.length === 0){
        console.error('ERROR: GET initial salaries');
        console.error('ERROR: data not in database');
        return null;
    }
    console.log('SUCCESS: GET initial salaries');
    return data;
}

async function getSalary(job) {
    const {data, error} = await supabase
        .from('salaries')
        .select('salary')
        .eq('job', job);

    if(error){
        console.error('ERROR: GET salary data from salaries');
        console.error(error);
        return null;
    }
    if(data.length === 0){
        console.error('ERROR: GET salary data from salaries');
        console.error('ERROR: data not in database');
        return null;
    }
    console.log('SUCCESS: GET salary data from salaries');
    return data[0].salary;
}

async function insertJobSalary(job, salary){
    const {error} = await supabase
        .from('salaries')
        .insert({job: job, salary: salary, search_count: 1});

    if(error){
        console.error('ERROR: INSERT job, salary into salaries');
        console.error(error);
        return;
    }
    console.log('SUCCESS: INSERT job, salary into salaries');
}

async function getCategories() {
    const {data, error} = await supabase
        .from('categories')
        .select('category, avg_salary, vacancies, tag')
    if(error) {
        console.error('ERROR: GET category data from categories');
        console.error(error);
        return null;
    }
    console.log('SUCCESS: GET category data from categories');
    return data;
}

async function getJobsFromCategoryTag(tag) {
    const {data, error} = await supabase
        .from('categories')
        .select('jobs, jobs_updated')
        .eq('tag', tag);
    if(error) {
        console.error('ERROR: GET jobs by category from categories');
        console.error(error);
        return {jobs: null, date_updated: null};
    }
    if(data.length === 0){
        console.error('ERROR: GET jobs by category from categories');
        console.error('ERROR: data not in database');
        return {jobs: null, date_updated: null};
    }
    console.log('SUCCESS: GET jobs by category from categories');
    return {jobs: data[0].jobs, date_updated: data[0].jobs_updated};
}

async function insertJobByCategoryTag(tag, jobs, jobs_updated){
    const {error} = await supabase
        .from('categories')
        .update({jobs: jobs, jobs_updated: jobs_updated})
        .eq('tag', tag);

    if(error){
        console.error('ERROR: UPDATE jobs by category');
        console.error(error);
        return;
    }
    console.log('SUCCESS: UPDATE jobs by category into categories');
    return;
}

module.exports = {
    getInitialSalaries, getSalary, insertJobSalary, getCategories, getJobsFromCategoryTag, insertJobByCategoryTag,
}
