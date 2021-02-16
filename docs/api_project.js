define({
  "name": "Wikonnect",
  "version": "0.4.0",
  "description": "Wikonnect community docs",
  "title": "Wikonnect community docs",
  "url": "https://app.wikonnect.org",
  "sampleUrl": "https://app.wikonnect.org",
  "order": [
    "Authentication",
    "Chapters",
    "Reactions",
    "PostAReaction",
    "GetAReAction",
    "GetReactions",
    "DeleteARection"
  ],
  "header": {
    "title": "Getting Started",
    "content": "<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->\n<p><a href=\"#contributors\"><img src=\"https://img.shields.io/badge/all_contributors-9-orange.svg?style=flat-square\" alt=\"All Contributors\"></a></p>\n<!-- ALL-CONTRIBUTORS-BADGE:END -->\n  <img  height=\"200\" src=\"https://app.wikonnect.org/images/icons/wikonnect-primary.svg\">\n<h1 align=\"center\">Welcome to wikonnect 👋</h1>\n<p align=\"center\">\n  <img alt=\"Version\" src=\"https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000\" />\n  <a href=\"https://docs.wikonnect.org/\" target=\"_blank\">\n    <img alt=\"Documentation\" src=\"https://img.shields.io/badge/documentation-yes-brightgreen.svg\" />\n  </a>\n  <a href=\"#\" target=\"_blank\">\n    <img alt=\"License: MIT\" src=\"https://img.shields.io/badge/License-MIT-yellow.svg\" />\n  </a>\n  <a href=\"#\" target=\"_blank\">\n    <img alt=\"Issues\" src=\"https://img.shields.io/github/issues/tunapanda/wikonnect\" />\n  </a>\n  <a href=\"#\" target=\"_blank\">\n    <img alt=\"Forks\" src=\"https://img.shields.io/github/forks/tunapanda/wikonnect\" />\n  </a>\n  <a href=\"#\" target=\"_blank\">\n    <img alt=\"Stars\" src=\"https://img.shields.io/github/stars/tunapanda/wikonnect\" />\n  </a>\n</p>\n<h1>Wikonnect</h1>\n<p>Wikonnect is an open-source e-learning platform that is designed to allow anyone to learn, create content, and contribute to the code. The initial courses offered on the platform will be around digital literacy, to get more people using the internet in more productive ways. Developed by Tunapanda Institute in Nairobi, Kenya. The original platform (called 'swag') was used to provide technology, design, and business training in low-income communities with low bandwidth.</p>\n<h2>Getting Started</h2>\n<p>The front-end is developed using Ember.js. We recommend <a href=\"https://guides.emberjs.com/release/getting-started/quick-start/\">getting started</a> with Ember by going through the tutorials.</p>\n<p>The back-end is developed using <a href=\"https://koajs.com/\">KoaJS</a>. API doc is hosted at <a href=\"https://tunapanda.github.io/wikonnect\">tunapanda.github.io/wikonnect)</a></p>\n<h2>Prerequisites</h2>\n<h3>Tech Stack</h3>\n<ul>\n<li><a href=\"https://guides.emberjs.com\">EmberJS</a> for frontend</li>\n<li><a href=\"https://www.postgresql.org/\">Postgres</a> with <a href=\"https://vincit.github.io/objection.js/\">Objection.js</a> and <a href=\"https://gist.github.com/NigelEarle/80150ff1c50031e59b872baf0e474977\">knex</a> for database management</li>\n<li><a href=\"https://koajs.com/\">KoaJS</a> a node.js web framework for building the API(server)</li>\n<li><a href=\"https://www.chaijs.com/\">chai</a> for writing unit tests.\n<ul>\n<li>chai-http</li>\n</ul>\n</li>\n<li><a href=\"https://cypress.io\">Cypress</a> for integration testing</li>\n<li><a href=\"https://yarnpkg.com/\">Yarn</a> project package manager</li>\n<li><a href=\"https://www.elastic.co/\">ElasticSearch</a> search and indexing tool</li>\n</ul>\n<h2>Development Setup</h2>\n<h3>Installing Node.js</h3>\n<p>Follow instructions for downloading and <a href=\"https://nodejs.org/en/download/\">installing Node.js</a> for your operating system from the official Node.js website.</p>\n<p>Ensure you are installing Node 10 or greater.</p>\n<h3>Set up PostgreSQL</h3>\n<ul>\n<li><a href=\"https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04\">Ubuntu installation</a></li>\n<li><a href=\"https://fedoraproject.org/wiki/PostgreSQL\">Fedora installation</a></li>\n<li><a href=\"https://www.codementor.io/engineerapart/getting-started-with-postgresql-on-mac-osx-are8jcopb\">OSX installation</a></li>\n<li><a href=\"http://www.postgresqltutorial.com/install-postgresql/\">Windows installation</a></li>\n</ul>\n<p>You should create a postgres user (with password), and set up database. (Don't forget to grant privileges to your user on the database!)</p>\n<pre class=\"prettyprint lang-SQL\">=# CREATE USER my_user WITH PASSWORD 'my_password';\n=# CREATE DATABASE my_database;\n=# GRANT ALL PRIVILEGES ON DATABASE my_database TO my_user;\n</pre>\n<h2>Starting the Development Server</h2>\n<p>Open up Terminal/Powershell/bash and navigate to the directory where you want the project to live.</p>\n<p>Clone this repository:</p>\n<pre class=\"prettyprint\">git clone https://github.com/tunapanda/wikonnect.git\n</code></pre>\n<p>Install the node packages in the <strong>main project directory</strong>...</p>\n<pre class=\"prettyprint\">cd wikonnect/\nyarn\n</code></pre>\n<h3>Server (API) setup</h3>\n<hr>\n<p>Now let's set up the <strong>server</strong>. First, go into the server directory and install the node packages.</p>\n<pre class=\"prettyprint\">cd server/\nyarn\n</code></pre>\n<p>Then, rename the file <code>server/config/db.example.js</code> to <code>server/config/db.js</code>, then edit the credentials that will provide access to your development database. (Do not use the development database in a production environment)</p>\n<pre class=\"prettyprint lang-js\">development: {\n    host: 'localhost',\n    database: 'my_database',\n    user: 'my_user',\n    password: 'my_password',\n  },\n</pre>\n<h4>Next, you will want to set up your database and start your server.</h4>\n<p>Ensure that you have redis-server running locally in your pc.</p>\n<p>For Macos and Windows systems, check out the <a href=\"https://redis.io/download\">Download page</a> to download redis-server.</p>\n<p>To install it in a linux system, run the command below:</p>\n<pre class=\"prettyprint\">sudo apt-get install redis-server\n</code></pre>\n<p>To confirm that the service is active, use the command below:</p>\n<pre class=\"prettyprint\">sudo service redis-server status\n</code></pre>\n<p>If the service is not running, use the command below to start it:</p>\n<pre class=\"prettyprint\">sudo service redis-server start\n</code></pre>\n<p>To run the knex commands that follow later, there are 2 possible options:</p>\n<ul>\n<li>Install knex CLI globally</li>\n<li>prefix all the knex commands with npx e.g <code>npx knex migrate:latest</code>  (If you have <a href=\"https://www.npmjs.com/package/npx\">npx</a> installed)</li>\n</ul>\n<p>To check if knex CLI is installed globally, run the command below which shows the Knex CLI version:</p>\n<pre class=\"prettyprint\">knex --version\n</code></pre>\n<p>If knex CLI is not installed globally, install it using the command below and make sure to confirm that the installation was successful using the command above:</p>\n<pre class=\"prettyprint\">npm install -g knex\n</code></pre>\n<p>Running <code>knex migrate:latest</code> in the <code>server/</code> directory will use the migration files in <code>server/migrations</code> to create and format the tables so that they will work with wikonnect.</p>\n<p>To populate the database with dummy data (defined in <code>server/db/seeds</code>), run <code>knex seed:run</code>.</p>\n<p>Now start your server! <code>yarn start</code></p>\n<p>If you see an Elasticsearch error, don't worry, you don't need Elasticsearch to run the app.</p>\n<h3>Designs</h3>\n<table>\n  <tr>\n    <td><img src=\"screenshots/1.png\" width=270 height=480></td>\n    <td><img src=\"screenshots/2.png\" width=270 height=480></td>\n    <td><img src=\"screenshots/3.png\" width=270 height=480></td>\n  </tr>\n </table>\n<p>Head over to <a href=\"https://xd.adobe.com/view/4373354a-a52e-4413-4a61-8831bd731d75-3542/grid\">Adobe XD</a> to see the complete design.</p>\n<h3>Front End set-up</h3>\n<hr>\n<h4>Get Ember up and running</h4>\n<p>Install the node packages for the Ember app. Run <code>yarn</code> in wikonnect/frontend.</p>\n<p>Now start your server!</p>\n<pre class=\"prettyprint\">yarn start\n</code></pre>\n<p>Now point your favorite browser to http://localhost:4200/ and you will be able to see the app.</p>\n<h2>Contributing</h2>\n<ul>\n<li>You should join our <a href=\"https://discord.gg/tT9Ug6D\">Discourse</a> server to get connected with people interested in this project and to be aware of our future announcements.</li>\n<li>Please read the suggested <a href=\"https://github.com/tunapanda/wikonnect/blob/master/CONTRIBUTING.md\">steps to contribute code to the Wikonnect project</a> before creating issues, forking, or submitting any pull requests.</li>\n</ul>\n<h2>Authors 🧙</h2>\n<h3>Lead Developers</h3>\n<ul>\n<li><strong><a href=\"https://github.com/mosesokemwa\">Moses Okemwa</a></strong> - <em>Lead developer and maintainer</em></li>\n<li><strong><a href=\"https://github.com/proverbial-ninja\">Proverbial Ninja</a></strong> - <em>Lead developer and maintainer</em></li>\n</ul>\n<h2>Contributors ✨</h2>\n<p>Thanks goes to these wonderful people (<a href=\"https://allcontributors.org/docs/en/emoji-key\">emoji key</a>):</p>\n<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->\n<!-- prettier-ignore-start -->\n<!-- markdownlint-disable -->\n<table>\n  <tr>\n    <td align=\"center\"><a href=\"https://github.com/mosesokemwa\"><img src=\"https://avatars0.githubusercontent.com/u/13944912?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Moses Okemwa</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=mosesokemwa\" title=\"Code\">💻</a> <a href=\"#design-mosesokemwa\" title=\"Design\">🎨</a></td>\n    <td align=\"center\"><a href=\"https://github.com/proverbial-ninja\"><img src=\"https://avatars3.githubusercontent.com/u/2375904?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Kiki</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=proverbial-ninja\" title=\"Code\">💻</a> <a href=\"#design-proverbial-ninja\" title=\"Design\">🎨</a></td>\n    <td align=\"center\"><a href=\"https://github.com/mrlarso\"><img src=\"https://avatars1.githubusercontent.com/u/5390448?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>mrlarso</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=mrlarso\" title=\"Code\">💻</a></td>\n    <td align=\"center\"><a href=\"https://github.com/Jakeii\"><img src=\"https://avatars2.githubusercontent.com/u/1731150?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Jake Lee Kennedy</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=Jakeii\" title=\"Code\">💻</a></td>\n    <td align=\"center\"><a href=\"https://github.com/bkmgit\"><img src=\"https://avatars1.githubusercontent.com/u/1679477?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Benson Muite</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=bkmgit\" title=\"Code\">💻</a></td>\n    <td align=\"center\"><a href=\"http://colleowino.github.io/\"><img src=\"https://avatars3.githubusercontent.com/u/2420182?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Cliff Owino</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=colleowino\" title=\"Code\">💻</a></td>\n    <td align=\"center\"><a href=\"https://github.com/Mutugiii\"><img src=\"https://avatars3.githubusercontent.com/u/48474421?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Mutugi</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=Mutugiii\" title=\"Code\">💻</a></td>\n  </tr>\n  <tr>\n    <td align=\"center\"><a href=\"https://github.com/avicndugu\"><img src=\"https://avatars1.githubusercontent.com/u/37213663?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>Avic Ndugu</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=avicndugu\" title=\"Code\">💻</a></td>\n    <td align=\"center\"><a href=\"https://bonfacemunyoki.com/\"><img src=\"https://avatars0.githubusercontent.com/u/11820306?v=4?s=100\" width=\"100px;\" alt=\"\"/><br /><sub><b>BonfaceKilz</b></sub></a><br /><a href=\"https://github.com/tunapanda/wikonnect/commits?author=BonfaceKilz\" title=\"Code\">💻</a></td>\n  </tr>\n</table>\n<!-- markdownlint-enable -->\n<!-- prettier-ignore-end -->\n<!-- ALL-CONTRIBUTORS-LIST:END -->\n<div align=\"center\">\n  <br>\n  <h3>Happy Coding ❤︎</h3>\n</div>\n"
  },
  "footer": {
    "title": "Contributing Guidelines",
    "content": "<h1>How to Contribute</h1>\n<h2>Reporting Bugs</h2>\n<p>Report issues you've discovered via the <a href=\"https://github.com/tunapanda/wikonnect/issues\">issue tracker</a>.</p>\n<h2>Issue Labeling</h2>\n<p>Wikonnect uses <a href=\"https://github.com/wagenet/StandardIssueLabels\">StandardIssueLabels</a> for Github Issues.</p>\n<h2>Issues</h2>\n<p>Think you've found a bug or have a new feature to suggest? Let us know!</p>\n<h2>Reporting a Bug</h2>\n<ol>\n<li>\n<p>Update to the most recent master release if possible. We may have already\nfixed your bug.</p>\n</li>\n<li>\n<p>Search for similar issues. It's possible somebody has encountered\nthis bug already.</p>\n</li>\n<li>\n<p>Provide very specific steps to reproduce the error. If we cannot reproduce it, we will\nclose the ticket.</p>\n</li>\n<li>\n<p>Your issue will be verified. The provided example will be tested for\ncorrectness. The Wikonnect team will work with you until your issue can\nbe verified.</p>\n</li>\n<li>\n<p>Keep up to date with feedback from the Wikonnect team on your ticket. Your\nticket may be closed if it becomes stale.</p>\n</li>\n<li>\n<p>If possible, submit a Pull Request with a failing test. Better yet, take\na stab at fixing the bug yourself if you can!</p>\n</li>\n</ol>\n<p>The more information you provide, the easier it is for us to validate that\nthere is a bug and the faster we'll be able to take action.</p>\n<h2>Creating a pull requests</h2>\n<p>We love contributors</p>\n<ol>\n<li>For the repo. Always create a new branch from the latest master and work on a feature or a bug fix branch. Learn more about git branches <a href=\"https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell\">here</a>.</li>\n<li>Run the tests. We only take pull requests with passing tests, and it's great to know that you have a clean slate: <code>yarn install &amp;&amp; yarn test</code>.</li>\n<li>Make the tests pass</li>\n<li>Commit your changes. Please use an appropriate commit prefix. If your pull request fixes an issue specify it in the commit message. Some examples:</li>\n</ol>\n<pre class=\"prettyprint lang-markdown\">[DOC beta] Update CONTRIBUTING.md for commit prefixes\n[FEATURE query-params-new] Message\n[BUGFIX beta] Message\n[SECURITY CVE-111-1111] Message\n</pre>\n<ol start=\"5\">\n<li>\n<p>Push to your fork and submit a pull request. Please provide us with some explanation of why you made the changes you made. For new features make sure to explain a standard use case to us.</p>\n</li>\n<li>\n<p>Once your feature is done, create a pull requests against <code>master</code> branch. And describe in detail the work you've done.</p>\n</li>\n</ol>\n<h2>Documentation</h2>\n<p>Please document your code using the <a href=\"https://apidocjs.com/\">apidoc</a> library.</p>\n<h2>Testing</h2>\n<p>There are 3 types of tests within Wikonnect</p>\n<ul>\n<li>Coding standards tests via <a href=\"https://eslint.org\">eslint</a></li>\n<li>The API is unit tested using <a href=\"https://mochajs.org/\">mocha</a> with <a href=\"https://shouldjs.github.io/\">should.js</a></li>\n<li>Integration tests are done via <a href=\"https://cypress.io\">cypress</a>.</li>\n</ul>\n<h2>Travis CI Tests</h2>\n<p>We use Travis CI to test each PR before it is merged.</p>\n<p>When you submit your PR (or later change that code), a Travis build will automatically be kicked off. A note will be added to the PR, and will indicate the current status of the build.\nSubmitting Work</p>\n<h3>Tools to Install</h3>\n<p><code>yarn global add mocha cypress eslint chai chai-http</code></p>\n<p>The rest are included with the build tools.</p>\n<h3>ESlint tests</h3>\n<p>These will make sure that all the code that's contributed is consistent and readable.</p>\n<p>Run the frontend tests with</p>\n<ul>\n<li><code>yarn --cwd app lint:js</code></li>\n<li><code>yarn --cwd app lint:hbs</code></li>\n</ul>\n<p>Run the backend tests with</p>\n<ul>\n<li><code>yarn --cwd api lint:js</code></li>\n</ul>\n<p>Modern text editors can show you these errors and warnings in real time while coding if configured correctly.</p>\n<h3>API Unit tests</h3>\n<p>Tests are located in the <code>api/test</code> folder, there should be a test file for each API resource (so one for every file in <code>api/routes</code>), these may be broken apart if there are enough tests to warrent it.</p>\n<p>There is also a global.test.js file that closes the db connection after all the tests are finished.</p>\n<p>Within each file the tests are grouped by the REST methods <strong><em>GET, POST, PUT, DELETE</em></strong>.</p>\n<h3>Writing API tests with <code>Mocha</code> &amp; <code>should.js</code></h3>\n<p>Tests are grouped using <code>describe()</code> and tests are wrapped in <code>it()</code> with a semantic name for the test, be sure to pass it a promise or async function if the test is asyncronous which for the API is mostly the case.</p>\n<p>Use <code>beforeEach()</code> to setup and teardown the test database.</p>\n<p>Use <code>chai-http</code> and <code>chai.request()</code> to retrive the API response for testing.</p>\n<p>Finally test the response using <code>should.js</code>, which add <code>should</code> &amp; others to every object, allowing to write almost plain english tests e.g. <code>response.body.should.equal('Hello World')</code></p>\n<p>Try to test for everything that should go right and wrong.</p>\n<p>Run all the the tests using the <code>mocha</code> from the <code>api</code> directory or <code>mocha path/to/test/file.test.js</code> to run a single file.</p>\n<h3>Frontend/Integration tests using <code>cypress</code></h3>\n<p>Tests are located within the <code>cypress/integration</code> directory.</p>\n<p>They should be &quot;end-to-end&quot; tests, in that they test the whole stack at once rather than each in isolation.</p>\n<p>They should test the interaction of the frontend, and makes sure they behave as they should, as well as it's interaction with the backend.</p>\n<p>Test each ember route for functionality and interaction.</p>\n<p>At a bare minimum, visit the page and check that it loads correctly.</p>\n<p>Additionally, test form interactivity, error messages, buttons etc.</p>\n<p><a href=\"https://docs.cypress.io/api/api/table-of-contents.html\">Cypress API documentation and examples</a>.</p>\n"
  },
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2021-02-10T12:59:28.026Z",
    "url": "https://apidocjs.com",
    "version": "0.26.0"
  }
});
