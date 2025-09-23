function fn() {
    karate.configure('logPrettyRequest', true);
    karate.configure('logPrettyResponse', true);

    var config = {};   // define config object first

    config.serviceHostUrl = 'http://localhost:8080';
    // config.users = {
    //     customer: { username: 'customer', password: 'customer' },
    //     courier: { username: 'courier', password: 'courier' },
    //     admin: { username: 'admin', password: 'admin' }
    // };

    // call login feature once to get the token
    // var login = function(creds) {
    //     return karate.callSingle('classpath:karate/tests/auth/auth.feature', creds);
    // };
    // config.authToken = auth.authToken;
    //
    // // set a global header with the token
    // karate.configure('headers', {
    //     Accept: '*/*',
    //     Authorization: 'Bearer ' + config.authToken
    // });
    //
    // // return config with additional values


    return config;
}

