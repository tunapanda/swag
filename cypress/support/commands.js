
Cypress.Commands.add('login', function () {
  cy.fixture('user').then(user => {
    cy.request({
      method: 'POST',
      url: '/api/v1/auth',
      body: {
        username: user.username,
        password: user.password
      }
    })
      .its('body')
      .then(res => {
        this.token = res.token;
        const rawData =this.token.split('.')[1];
        const data =rawData?JSON.parse(atob(rawData)):'';
        window.localStorage.setItem('ember_simple_auth-session', JSON.stringify({
          "authenticated": {
            "authenticator": "authenticator:jwt",
            "token": res.token,
            "exp": Math.floor(new Date().getTime() / 1000) + 1000 * 60 * 60,
            "tokenData": data
          }
        }));
      });
  });
});


Cypress.Commands.add('chapters', (queryParams = {}) => {
    const qs = Object.keys(queryParams).reduce((acc, key) => {
        acc += `${key}=${queryParams[key]}&`;
        return acc;
    }, '')

    let headers = {'Accept': `application/json`}

    // check if user is authenticated
    const session = window.localStorage.getItem('ember_simple_auth-session');
    if (session) {
        const parsed = JSON.parse(session);
        if (parsed.authenticated && parsed.authenticated.token) {
            headers = {...headers, 'Authorization': `Bearer ${parsed.authenticated.token}`}
        }
    }

    return cy.request({
        method: 'GET',
        url: `/api/v1/chapters?${qs}`,
        headers: headers
    })
    .its('body.chapters')
    .then((chapters) => chapters);
});

Cypress.Commands.add('comments', (queryParams = {}) => {
    const qs = Object.keys(queryParams).reduce((acc, key) => {
        acc += `${key}=${queryParams[key]}&`;
        return acc;
    }, '')

    let headers = {'Accept': `application/json`}

    // check if user is authenticated
    const session = window.localStorage.getItem('ember_simple_auth-session');
    if (session) {
        const parsed = JSON.parse(session);
        if (parsed.authenticated && parsed.authenticated.token) {
            headers = {...headers, 'Authorization': `Bearer ${parsed.authenticated.token}`}
        }
    }

    return cy.request({
        method: 'GET',
        url: `/api/v1/comments?${qs}`,
        headers: headers
    })
        .its('body.comment')
        .then((chapters) => chapters);
});

Cypress.Commands.add('badges', (queryParams = {}) => {
    const qs = Object.keys(queryParams).reduce((acc, key) => {
        acc += `${key}=${queryParams[key]}&`;
        return acc;
    }, '')

    let headers = {'Accept': `application/json`}

    // check if user is authenticated
    const session = window.localStorage.getItem('ember_simple_auth-session');
    if (session) {
        const parsed = JSON.parse(session);
        if (parsed.authenticated && parsed.authenticated.token) {
            headers = {...headers, 'Authorization': `Bearer ${parsed.authenticated.token}`}
        }
    }

    return cy.request({
        method: 'GET',
        url: `/api/v1/badges?${qs}`,
        headers: headers
    })
        .its('body.badge')
        .then((badges) => badges);
});

Cypress.Commands.add('triggers', (queryParams = {}) => {
    const qs = Object.keys(queryParams).reduce((acc, key) => {
        acc += `${key}=${queryParams[key]}&`;
        return acc;
    }, '')

    let headers = {'Accept': `application/json`}

    // check if user is authenticated
    const session = window.localStorage.getItem('ember_simple_auth-session');
    if (session) {
        const parsed = JSON.parse(session);
        if (parsed.authenticated && parsed.authenticated.token) {
            headers = {...headers, 'Authorization': `Bearer ${parsed.authenticated.token}`}
        }
    }

    return cy.request({
        method: 'GET',
        url: `/api/v1/triggers?${qs}`,
        headers: headers
    })
        .its('body.trigger')
        .then((triggers) => triggers);
});

Cypress.Commands.add('surveys', (queryParams = {}) => {
    const qs = Object.keys(queryParams).reduce((acc, key) => {
        acc += `${key}=${queryParams[key]}&`;
        return acc;
    }, '')

    let headers = {'Accept': `application/json`}

    // check if user is authenticated
    const session = window.localStorage.getItem('ember_simple_auth-session');
    if (session) {
        const parsed = JSON.parse(session);
        if (parsed.authenticated && parsed.authenticated.token) {
            headers = {...headers, 'Authorization': `Bearer ${parsed.authenticated.token}`}
        }
    }

    return cy.request({
        method: 'GET',
        url: `/api/v1/surveys?${qs}`,
        headers: headers
    })
        .its('body.surveys')
        .then((surveys) => surveys);
});
