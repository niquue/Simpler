export async function handleLogin(event) {
    event.preventDefault();
    const $message = $('.message');
    $message.empty();
    let user = String($('#username').val());
    let pass = String($('#password').val());

    try {
        const result = await axios ({
            method: 'post',
            url: 'https://niquelomax.pythonanywhere.com/login/' + user,
            //headers: {"Access-Control-Allow-Origin": "http://localhost:1080/login"+user}
            data: {
                "username": user,
                "password": pass
            }

        });
        if (result) {
            $message.append(`<div class="notification is-success has-text-centered">
            <p><span class="has-text-weight-bold">Success! </span>Logging you in...</p>
        </div>
        <div class="progress">
        <progress class="progress is-small is-primary" max="100">15%</progress>
        </div>`)
            setTimeout(() => {
                window.location.replace('client/index.html');
                window.localStorage.setItem("username", user);
            }, 4000);
        } else {
            $message.append(`<div class="notification is-danger has-text-centered">
            <p><span class="has-text-weight-bold">Invalid! </span>Username or password is incorrect!</p>
        </div>`)
        }
    } catch(err) {
        $message.append(`<div class="notification is-danger has-text-centered">
        <p><span class="has-text-weight-bold">Invalid! </span>Username or password is incorrect!</p>
    </div>`)
    }

    //console.log(result);

}

/*
document.getElementById('loginButton').onclick = function(e) {
    e.preventDefault();
    let user = String($('#username').val());
    let pass = String($('#password').val());

    $message.append(`<div class="notification is-success has-text-centered">
        <p><span class="has-text-weight-bold">Success! </span>Logging you in...</p>
    </div>`)
}
*/

export async function handleSignUp(event) {
    event.preventDefault();
    const $message = $('#signmessage');
    let user = $('#signuser').val();
    let pass = $('#signpass').val();

    try {
        const result = await axios ({
            method: 'post',
            url: 'https://niquelomax.pythonanywhere.com/login',
            data: {
                "username": user,
                "password": pass,
            },
            responseType: "json"
        });
        $message.empty();
        $message.append(`<div class="notification is-success has-text-centered">
        <p><span class="has-text-weight-bold">Success! </span>User Created - Redirecting to homepage</p>
        </div>
        <div class="progress">
        <progress class="progress is-small is-primary" max="100">15%</progress>
        </div>`)
        setTimeout(() => {
            window.location.replace('index.html');
        }, 4000);
    } catch(err) {
        $message.empty();
        $message.append(`<div class="notification is-danger has-text-centered">
        <p><span class="has-text-weight-bold">Invalid! </span>Username is already taken!</p>
        </div>`)
    }
}

export function loadLogin() {
    const $root = $('#root');
    $root.on('click', "#loginButton", handleLogin);
    $root.on('click', '#signupbutton', handleSignUp);
}

$(function() {
    loadLogin();
})