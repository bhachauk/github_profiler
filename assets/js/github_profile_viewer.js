// Main method to render all profile information.

github_user_api_url = "https://api.github.com/users/"
github_url = 'https://github.com/'
master_data = {}
repo_data = {}

spec = {
    'star' : 'stargazers_count',
    'fork' : 'forks_count',
    'watchers': 'watchers_count'
}


function get_languages_div()
{
    return document.getElementById("languages");
}

// utils
function curr_user()
{
    return document.getElementById("uname").value;
}


function handleErrors(response) {
    if (!response.ok) {
        error()
    }
    return response;
}

async function get_json_data(url)
{
    return fetch(url).then(handleErrors).then(res => res.json()).catch(err => error())
}

function get_top_metric_desc(json_data, metric)
{
    sorted = json_data.sort(function(a, b){
            return b[metric] - a[metric];

    }).filter(user => user[metric] != 0);
    x_axis = sorted.map(user => "<a style='color:red; font-weight: bold;' href='" + github_url + curr_user() + '/' + user['name'] + "'>" + user['name'] + "</a>")
    return [
      {
        x: x_axis,
        y: sorted.map(user => user[metric]),
        text: sorted.map(user => user[metric]).map(String),
        type: 'bar',
        marker: {
            color: 'rgb(142,124,195)'
        }
      }
    ]
}

async function fill_profile_info(master_data)
{
    document.getElementById('followers').text = master_data['followers']
    document.getElementById('following').text = master_data['following']
}

async function get_languages_info(repo_data)
{
    result_dict = {}
    temp_list = repo_data.map(repo => repo['languages_url'])
    /*temp_list = temp_list.slice(0, 2)*/
    for (url in temp_list)
    {
        console.log(url)
        url = temp_list[url]
        detail = await get_json_data(url)
        console.log(detail)
        console.log(Object.keys(detail))
        Object.keys(detail).forEach( temp_key => {
            if (Object.keys(result_dict).indexOf(temp_key) == -1)
                result_dict[temp_key] = 0
            result_dict[temp_key] = result_dict[temp_key] + 1;
        })
    }
    var sortable = [];
    for (var lang in result_dict) {
        sortable.push([lang, result_dict[lang]]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    })
    return sortable
}

function get_label_tag(in_data)
{
    tag = document.createElement("LABEL")
    tag.textContent = in_data
    return tag
}


function loading()
{
    document.getElementById('languages').innerHTML = ''
    document.getElementById('profile').style.display = 'none'
    document.getElementById('index').style.display = 'none'
    document.getElementById('error').style.display = 'none'
    document.getElementById('loader').style.display = 'block'
}

function error()
{
    document.getElementById('error').style.display = 'block'
    document.getElementById('loader').style.display = 'none'
}

function loaded()
{
    document.getElementById('profile').style.display = 'block'
    document.getElementById('loader').style.display = 'none'
}


async function render()
{
    loading()
    console.log("curr user : " + curr_user())
    master_data = await get_json_data(github_user_api_url + curr_user())
    if (master_data['message'] == "Not Found"){
        alert("Can't find the user : " + curr_user())
        return
     }
    fill_profile_info(master_data)
    repo_data = await get_json_data(github_user_api_url + curr_user() + '/repos')
    document.getElementById('curr_avatar').src = master_data['avatar_url']

    languages_info = await get_languages_info(repo_data);
    console.log(languages_info)
    languages_div = get_languages_div()
    languages_info.forEach( language => {
        temp_tag = document.createElement('DIV')
        temp_tag.className = "language"
        name_tag = get_label_tag(language[0]);
        name_tag.className = "lang_name"
        temp_tag.appendChild(name_tag);
        repo_value = " x " + language[1]
        temp_tag.appendChild(get_label_tag(repo_value));
        languages_div.appendChild(temp_tag);
    })
    console.log(languages_div)

    for (var key of Object.keys(spec)) {
            layout = {
                title: spec[key],
                barmode: 'stack',
                xaxis:  {
                    'showgrid': false,
                    },
                yaxis: {
                    'showgrid': false
                    },
                 marker_color: 'red',
                 font: { family : 'Bad Script, cursive'}
            }
            plot_data = get_top_metric_desc(repo_data, spec[key])
            check_array = plot_data[0]['y'];
            if (check_array.length > 0){
                Plotly.newPlot(key, plot_data, layout);
            }
            else{
                Plotly.deleteTraces(key, 0);
            }
    }
    loaded()
}
