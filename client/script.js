
const USERID = localStorage.getItem("username");


//  ------- WEATHER API -----------
export function weather( cityID ) {
    var key = config.MY_API_KEY;
    fetch('https://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&units=imperial' + '&appid=' + key)  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
        drawWeather(data); // Call drawWeather
    })
    .catch(function() {
        // catch any errors
    });
}

export function drawWeather(d) {
    let description = d.weather[0].description;
    let temp = d.main.temp;

    let $text = $('#apitext');
    $text.empty();
    $text.append(`<p>It is currently: <strong>${temp} degrees.</strong> in Chapel Hill, NC</p>`);
    $text.append(`<p>The described condition: <strong>${description}</strong></p>`);
    $text.append(`<p>The perfect day to code / be productive</p>`);
}

// ------ END WEATHER API -----

//  ------- ZEN QUOTES API -----------
export function zen() {
    fetch('https://api.quotable.io/random')  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
        drawQuote(data); // Call drawWeather
    })
    .catch(function() {
        // catch any errors
    });
}

export function drawQuote(d) {
    let quote = d.content;
    let author = d.author;
    //let block = d[0].h;

    let $text = $('#apitext2');
    $text.empty();
    $text.append(`<p><strong><i>Be inspired</i></strong>`);
    $text.append(`<p class="is-centered">"<i>${quote}</i>"</p>`);
    $text.append(`<p> - ${author}</p>`)

}

// ------ END ZEN QUOTES API -----


// ------ BORED TASKS API BEGIN ---- 
export function tasks() {
    fetch('https://www.boredapi.com/api/activity')  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
        drawTask(data); // Call drawWeather
    })
    .catch(function() {
        // catch any errors
    });
}

export function drawTask(d) {
    let task = d['activity'];
    let $text = $('#apitext3');
    $text.empty();
    $text.append(`<p>Need a task to get started?</p>`);
    $text.append(`<p>Here's a suggestion:</p>`);
    $text.append(`<p><i><strong>${task}</strong></i></p>`);
}

// ------ BORED TASKS API END -----


// ----- BITCOIN API CALL ------- 
export function bitcoin() {
    fetch('https://api.coindesk.com/v1/bpi/currentprice.json')  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
        drawCoin(data); // Call drawWeather
    })
    .catch(function() {
        // catch any errors
    });
}

export function drawCoin(d) {
    let coin_price = d['bpi']['USD']['rate']
    let $text = $('#apitext4');
    $text.empty();
    $text.append(`<p>The current price of Bitcoin: </p>`);
    $text.append(`<p><i><strong>$${coin_price}</strong></i></p>`);
    $text.append(`<p>You should add <i>"Invest in Crypto"</i> to your tasks. I suggest looking into Cardano.</p>`);
}

// ----- END BITCOIN API CALL ----- 


// ---- Drink API CALL ------- 
export function drink() {
    fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
        drawDrink(data); // Call drawWeather
    })
    .catch(function() {
        // catch any errors
    });
}

export function drawDrink(d){
    let drink_name = d['drinks'][0]['strDrink'];
    let ingredients = [];

    for(let i = 1; i < 11; i++) {
        let word = 'strIngredient' + String(i);
        let str = d['drinks'][0][word];
        if(str === null) {
            break;
        } else {
            ingredients.push(str);
        }
    }

    let $text = $('#apitext5');
    $text.empty();
    $text.append(`<p>After completing so many tasks, you need a break... </p>`);
    $text.append(`<p>Here's a drink to help you relax: </p>`);
    $text.append(`<p><strong>${drink_name}</p>`);

    let string ="";
    ingredients.forEach(elem => {
        string += elem + ', '
    })
    $text.append(`<p>Ingredients: ${string}</p>`);
    /*
    ingredients.forEach(elem => {
        $text.append(`<p class="is-size-7"><i>${elem}</i></p>`);
    });
    */


}
// ---- End DRINK API CALL ------ 



export async function getUserID() {
    const result = await axios ({
        method: 'get',
        url: 'https://niquelomax.pythonanywhere.com/login/' + USERID,
    });

    return result['id'];
}

export async function getTasks(id) {
    try {
        const result = await axios ({
            method: 'get',
            url: 'https://niquelomax.pythonanywhere.com/category/' + id,
        });
        return result;
    } catch(err) {
        return {'tasks': []};
    }

}

export async function getSubTasks(id) {
    const result = await axios ({
        method: 'get',
        url: 'https://niquelomax.pythonanywhere.com/sub_category/' + id,
        //headers: {"Access-Control-Allow-Origin": "http://localhost:1080/login"+user}
    });

    return result;
}

export async function loadTasks() {
    
    //console.log(USERID);
    const result = await axios ({
        method: 'get',
        url: 'https://niquelomax.pythonanywhere.com/login/' + USERID,
    });

    let user_id = result.data['id'];
    let tasks = await getTasks(user_id);
    build(tasks);


    //
    //let subtasks = getSubTasks(tasks['id'])
}

export async function build(tasks) {
    let $category = $('#categorybegin');
    if (tasks.data['tasks'].length > 0) {
        for(let i = 0; i < tasks.data['tasks'].length; i++) {
            let category_id = tasks.data['tasks'][i]['id']
            let todo_item = tasks.data['tasks'][i]['todo']
            $category.append(`
        <div class='list-item tags' id="toplevel${category_id}">
            <span class='tag is-white'>
                <i class="fas fa-thumbtack"></i>
            </span>
            <li id="list_change${category_id}">
            ${todo_item}
            <!-- Task delete button -->
                <button class="button tag is-delete is-danger categorygone" id="deletecategory${category_id}" data-delete="${category_id}">
                
                </button>
            <!-- Task finish button -->
                <button class="button tag is-success finishtask" id="taskfinish${category_id}" data-finished="${category_id}">
                    <span class="icon is-small">
                        <i class="fas fa-check"></i>
                    </span>
                    <span data-done="${category_id}">Finish</span>
            </button>
            <!-- Add subtask button -->
            
                <button class="button tag is-info newsub" id="addsub${category_id}" data-number="${category_id}">
                    <span class="icon is-small" data-id="${category_id}">
                        <i class="fas fa-plus"></i>
                    </span>
                    <span data-id="${category_id}">Add Sub-task</span>
                </button>
            
            
            <div id="subtaskform${category_id}" data-form="${category_id}">
            </div>
            </li>

            <div id="subcategorystart${category_id}" data-parentcategory="${category_id}">
            </div>
        </div>
            `);
            let sub_category = await getSubTasks(category_id);
            if(sub_category.data['sub_tasks'].length > 0) {
                let $sub = $(`#subcategorystart${category_id}`);
                //let sub_todo = sub_category.data['sub_tasks'][i]['sub_todo'];
                for(let j = 0; j < sub_category.data['sub_tasks'].length; j++) {
                    let sub_todo = sub_category.data['sub_tasks'][j]['sub_todo'];
                    let sub_id = sub_category.data['sub_tasks'][j]['id'];
                    $sub.append(`
                    <ul>
                    <div class='list-item tags' id="subcategory${sub_id}">
                        <span class='tag is-white'>
                            <i class="fas fa-level-down-alt"></i>
                        </span>
                        <li class="has-background-grey-lighter" data-subcategory="${sub_id}">
                            ${sub_todo}
                        <!-- Subtask delete button -->
                            <button class="button tag is-delete is-danger" id="deletesub" data-subdelete="${sub_id}">
                            
                            </button>
                        </li>
                    </div>
                    </ul>
                    `);
                }
            }
        }
    }
}

export async function handleNewTask(event) {
    event.preventDefault();
    let $new_task = $('#tasktext').val();

    const getid = await axios ({
        method: 'get',
        url: 'https://niquelomax.pythonanywhere.com/login/' + USERID,
    });

    let user_id = getid.data['id'];

    if($new_task.length > 0) {
        const result = await axios ({
            method: 'post',
            url: 'https://niquelomax.pythonanywhere.com/category',
            data: {
                "todo": String($new_task),
                "status": false,
                "nid": user_id
            }
        });
    }
    
    $('#tasktext').val('');
    let $category = $('#categorybegin');
    $category.empty();
    loadTasks();



}

export async function handleAddSubTask(event) {
    event.preventDefault();
    const result = await axios ({
        method: 'get',
        url: 'https://niquelomax.pythonanywhere.com/login/' + USERID,
    });

    let id = event.target.getAttribute('data-id');

    let $form = $(`#subtaskform${id}`);
    let $buttonremove = $(`#addsub${id}`);
    let $finishbutton = $(`#taskfinish${id}`);
    $buttonremove.empty();
    $finishbutton.empty();
    $form.append(`
    <div class="control has-icons-left has-addons">
    <input name="task" class="input is-info is-medium" type="text" maxlength="50" placeholder="Add task... " id="formvalue${id}">
    <span class="icon is-small is-left">
        <i class="fas fa-tasks"></i>
    </span>
    <div class="control">
        <button type="submit" class="button is-link is-small submitsubform" id="submitsub${id}" data-subnum="${id}">Submit Sub task</button>
        <button type="submit" class="button is-danger is-small cancelsubform" id="cancelsub${id}" data-cancelsub="${id}">Cancel</button>
    </div>
    </div>`)
    //let user_id = result.data['id'];
    //let tasks = await getTasks(user_id);


}

export async function handleCancelSubTask(event) {
    event.preventDefault();
    let id = event.target.getAttribute('data-cancelsub');
    let $form = $(`#subtaskform${id}`);
    let $finishbutton = $(`#taskfinish${id}`);
    $form.empty();
    let $buttonadd = $(`#addsub${id}`)
    $buttonadd.append(`<span class="icon is-small">
                        <i class="fas fa-plus"></i>
                    </span>
                    <span data-id="${id}">Add Sub-task</span>`);

    $finishbutton.append(`
    <span class="icon is-small">
    <i class="fas fa-check"></i>
    </span>
    <span data-done="${id}">Finish</span>`)

}

export async function handleSubmitNewSubTask(event) {
    event.preventDefault();
    let id = event.target.getAttribute('data-subnum');

    let cid = parseInt(id);

    let $new_subtask = $(`#formvalue${id}`).val();
    if($new_subtask.length > 0) {
        const result = await axios ({
            method: 'post',
            url: 'https://niquelomax.pythonanywhere.com/sub_category',
            data: {
                "sub_todo": String($new_subtask),
                "completed": false,
                "cid": id
            }
        });
    } 


    let $category = $('#categorybegin');
    $category.empty();
    loadTasks();

}

export async function handleCategoryDelete(event) {
    event.preventDefault();

    let id = event.target.getAttribute('data-delete');

    const result = await axios ({
        method: 'delete',
        url: 'https://niquelomax.pythonanywhere.com/category/' + id,
    });

    let $category = $('#categorybegin');
    $category.empty();
    loadTasks();


}

export async function handleSubCategoryDelete(event) {
    event.preventDefault();

    let id = event.target.getAttribute('data-subdelete');

    const result = await axios ({
        method: 'delete',
        url: 'https://niquelomax.pythonanywhere.com/sub_category/' + id,
    });

    let $category = $('#categorybegin');
    $category.empty();
    loadTasks();

}

export function handleCategoryComplete(event) {
    event.preventDefault();
    let id = event.target.getAttribute('data-done');
    let $form = $(`#subtaskform${id}`);
    let $removesubbutton = $(`#addsub${id}`);
    let $buttonremove = $(`#taskfinish${id}`);
    $buttonremove.empty();
    $removesubbutton.empty();
    $form.append(`
    <article class="message is-small" id="article${id}">
        <div class="message-header has-icons-right">
            <p>Complete Task? (This will remove the task from the list)</p>
            <button class="button tag is-success completetask" data-complete="${id}">
                <span class="icon is-small is-right" data-complete="${id}">
                    <i class="fas fa-check-double"></i>
                </span>
                <span data-comp="${id}">IM DONE</span>
            </button>
        <button class="delete is-danger is-medium compformgone" data-rem="${id}" id="removecompleteform${id}" aria-label="delete"></button>

        </div>
    </article>`)

}

export async function handleTaskCompleteForm(event) {
    event.preventDefault();
    let id = event.target.getAttribute('data-comp');
    let $removeform = $(`#subtaskform${id}`);
    $removeform.remove();

    const result = await axios ({
        method: 'delete',
        url: 'https://niquelomax.pythonanywhere.com/category/' + id,
    });

    let $category = $('#categorybegin');
    $category.empty();
    loadTasks();

}

export function handleTaskCompleteFormExit(event) {
    event.preventDefault();
    let id = event.target.getAttribute('data-rem');

    let $remove = $(`#subtaskform${id}`);
    let $addback = $(`#taskfinish${id}`);
    let $addsub = $(`#addsub${id}`);
    $remove.empty();
    $addback.append(`
    <span class="icon is-small">
    <i class="fas fa-check"></i>
    </span>
    <span data-done="${id}">Finish</span>`);
    $addsub.append(`
    <span class="icon is-small" data-id="${id}">
    <i class="fas fa-plus"></i>
    </span>
    <span data-id="${id}">Add Sub-task</span>`)

}

export function handleLogoutButton(event) {
    event.preventDefault();
    window.localStorage.clear();

    window.location.replace('/../index.html');

}

export function loadPage() {
    const $root = $('#root');

    $root.on('click', '#submitnewtask', handleNewTask);
    $root.on('click', '.newsub', handleAddSubTask);
    $root.on('click', '.cancelsubform', handleCancelSubTask);
    $root.on('click', '.submitsubform', handleSubmitNewSubTask);
    $root.on('click', '.categorygone', handleCategoryDelete);
    $root.on('click', '#deletesub', handleSubCategoryDelete);
    $root.on('click', '.finishtask', handleCategoryComplete);
    $root.on('click', '.completetask', handleTaskCompleteForm);
    $root.on('click', '.compformgone', handleTaskCompleteFormExit);

    $root.on('click', '.logout', handleLogoutButton);
    

}


$(window).on('load', function() {
    weather(4460162);
    zen();
    tasks();
    bitcoin();
    drink();
    loadTasks();


})

$(function() {
    loadPage();
})
