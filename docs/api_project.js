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
    "content": "<h1>SWAG-NATION</h1>\n<h2>Table of Contents</h2>\n<ul>\n<li><a href=\"#the-learning-platform\">The Learning Platform</a></li>\n<li><a href=\"#contributing\">Contributing</a></li>\n<li><a href=\"#license\">License</a></li>\n<li><a href=\"#api-overview\">API Overview</a></li>\n</ul>\n<h2>The learning platform</h2>\n<h2>Contributing</h2>\n<p><a href=\"https://github.com/tunapanda/swag/blob/master/CONTRIBUTING.md\">Please follow this steps to contribute</a></p>\n<h3>API Overview</h3>\n<h4>AUTH Endpoint</h4>\n<p>prefix = <code>/api/v1</code></p>\n<table>\n<thead>\n<tr>\n<th style=\"text-align:left\">method</th>\n<th style=\"text-align:left\">resource</th>\n<th style=\"text-align:left\">description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style=\"text-align:left\">POST</td>\n<td style=\"text-align:left\"><code>/auth</code></td>\n<td style=\"text-align:left\">creates a user account</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">POST</td>\n<td style=\"text-align:left\"><code>/users</code></td>\n<td style=\"text-align:left\">returns a token for a logged in user</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">GET</td>\n<td style=\"text-align:left\"><code>/users</code></td>\n<td style=\"text-align:left\">returns a list of all users)</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">GET</td>\n<td style=\"text-align:left\"><code>/users/:id</code></td>\n<td style=\"text-align:left\">returns a single user</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">PUT</td>\n<td style=\"text-align:left\"><code>/users/:id</code></td>\n<td style=\"text-align:left\">returns a single user after update</td>\n</tr>\n</tbody>\n</table>\n<p><strong>Register body object</strong></p>\n<pre class=\"prettyprint lang-json\">{\n    \"user\":{\n        \"username\":\"type:string\",\n        \"password\":\"type:string\",\n        \"email\":\"type:string\"\n    }\n}\n</pre>\n<p><strong>Login body object</strong></p>\n<pre class=\"prettyprint lang-json\">{\n    \"user\":{\n        \"username\":\"type:string\",\n        \"password\":\"type:string\"\n    }\n}\n</pre>\n<h4>Learning Path Endpoint</h4>\n<table>\n<thead>\n<tr>\n<th style=\"text-align:left\">method</th>\n<th style=\"text-align:left\">resource</th>\n<th style=\"text-align:left\">description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style=\"text-align:left\">POST</td>\n<td style=\"text-align:left\"><code>/paths</code></td>\n<td style=\"text-align:left\">creates a user account</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">GET</td>\n<td style=\"text-align:left\"><code>/paths</code></td>\n<td style=\"text-align:left\">returns a list of all users)</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">GET</td>\n<td style=\"text-align:left\"><code>/paths/:id</code></td>\n<td style=\"text-align:left\">returns a single user</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">PUT</td>\n<td style=\"text-align:left\"><code>/paths/:id</code></td>\n<td style=\"text-align:left\">returns a single user after update</td>\n</tr>\n<tr>\n<td style=\"text-align:left\">DELETE</td>\n<td style=\"text-align:left\"><code>/paths/:id</code></td>\n<td style=\"text-align:left\">returns a single user after update</td>\n</tr>\n</tbody>\n</table>\n<h4>SEARCH Endpoint</h4>\n<pre><code>GET /api/v1/search?q=your-query\n</code></pre>\n<p><strong>Sample JSON</strong></p>\n<pre class=\"prettyprint lang-json\">{\n    \"paths\":{\n        \"id\": \"learning_path1\",\n        \"name\": \"A Learning Path\",\n        \"slug\": \"a-learning-path\",\n        \"description\": \"For the organisation of courses.\",\n        \"status\": \"published\",\n        \"creatorId\": \"user1\",\n        \"metadata\": null,\n        \"createdAt\": \"2017-12-20T16:17:10.000Z\",\n        \"updatedAt\": \"2017-12-20T16:17:10.000Z\",\n        \n    }\n}\n</pre>\n"
  },
  "footer": {
    "title": "Contributing Guidelines",
    "content": "<h1>How to Contribute</h1>\n<h2>Reporting Bugs</h2>\n<p>Report issues you've discovered via the <a href=\"https://github.com/tunapanda/wikonnect/issues\">issue tracker</a>.</p>\n<h2>Issue Labeling</h2>\n<p>Wikonnect uses <a href=\"https://github.com/wagenet/StandardIssueLabels\">StandardIssueLabels</a> for Github Issues.</p>\n<h2>Issues</h2>\n<p>Think you've found a bug or have a new feature to suggest? Let us know!</p>\n<h2>Reporting a Bug</h2>\n<ol>\n<li>\n<p>Update to the most recent master release if possible. We may have already\nfixed your bug.</p>\n</li>\n<li>\n<p>Search for similar issues. It's possible somebody has encountered\nthis bug already.</p>\n</li>\n<li>\n<p>Provide very specific steps to reproduce the error. If we cannot reproduce it, we will\nclose the ticket.</p>\n</li>\n<li>\n<p>Your issue will be verified. The provided example will be tested for\ncorrectness. The Wikonnect team will work with you until your issue can\nbe verified.</p>\n</li>\n<li>\n<p>Keep up to date with feedback from the Wikonnect team on your ticket. Your\nticket may be closed if it becomes stale.</p>\n</li>\n<li>\n<p>If possible, submit a Pull Request with a failing test. Better yet, take\na stab at fixing the bug yourself if you can!</p>\n</li>\n</ol>\n<p>The more information you provide, the easier it is for us to validate that\nthere is a bug and the faster we'll be able to take action.</p>\n<h2>Creating a pull requests</h2>\n<p>We love contributors</p>\n<ol>\n<li>For the repo. Always create a new branch from the latest master and work on a feature or a bug fix branch. Learn more about git branches <a href=\"https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell\">here</a>.</li>\n<li>Run the tests. We only take pull requests with passing tests, and it's great to know that you have a clean slate: <code>yarn install &amp;&amp; yarn test</code>.</li>\n<li>Make the tests pass</li>\n<li>Commit your changes. Please use an appropriate commit prefix. If your pull request fixes an issue specify it in the commit message. Some examples:</li>\n</ol>\n<pre class=\"prettyprint lang-markdown\">[DOC beta] Update CONTRIBUTING.md for commit prefixes\n[FEATURE query-params-new] Message\n[BUGFIX beta] Message\n[SECURITY CVE-111-1111] Message\n</pre>\n<ol start=\"5\">\n<li>\n<p>Push to your fork and submit a pull request. Please provide us with some explanation of why you made the changes you made. For new features make sure to explain a standard use case to us.</p>\n</li>\n<li>\n<p>Once your feature is done, create a pull requests against <code>master</code> branch. And describe in detail the work you've done.</p>\n</li>\n</ol>\n<h2>Documentation</h2>\n<p>Please document your code using the <a href=\"https://apidocjs.com/\">apidoc</a> library.</p>\n<h2>Testing</h2>\n<p>There are 3 types of tests within Wikonnect</p>\n<ul>\n<li>Coding standards tests via <a href=\"https://eslint.org\">eslint</a></li>\n<li>The API is unit tested using <a href=\"https://mochajs.org/\">mocha</a> with <a href=\"https://shouldjs.github.io/\">should.js</a></li>\n<li>Integration tests are done via <a href=\"https://cypress.io\">cypress</a>.</li>\n</ul>\n<h2>Travis CI Tests</h2>\n<p>We use Travis CI to test each PR before it is merged.</p>\n<p>When you submit your PR (or later change that code), a Travis build will automatically be kicked off. A note will be added to the PR, and will indicate the current status of the build.\nSubmitting Work</p>\n<h3>Tools to Install</h3>\n<p><code>yarn global add mocha cypress eslint chai chai-http</code></p>\n<p>The rest are included with the build tools.</p>\n<h3>ESlint tests</h3>\n<p>These will make sure that all the code that's contributed is consistent and readable.</p>\n<p>Run the frontend tests with</p>\n<ul>\n<li><code>yarn --cwd app lint:js</code></li>\n<li><code>yarn --cwd app lint:hbs</code></li>\n</ul>\n<p>Run the backend tests with</p>\n<ul>\n<li><code>yarn --cwd api lint:js</code></li>\n</ul>\n<p>Modern text editors can show you these errors and warnings in real time while coding if configured correctly.</p>\n<h3>API Unit tests</h3>\n<p>Tests are located in the <code>api/test</code> folder, there should be a test file for each API resource (so one for every file in <code>api/routes</code>), these may be broken apart if there are enough tests to warrent it.</p>\n<p>There is also a global.test.js file that closes the db connection after all the tests are finished.</p>\n<p>Within each file the tests are grouped by the REST methods <strong><em>GET, POST, PUT, DELETE</em></strong>.</p>\n<h3>Writing API tests with <code>Mocha</code> &amp; <code>should.js</code></h3>\n<p>Tests are grouped using <code>describe()</code> and tests are wrapped in <code>it()</code> with a semantic name for the test, be sure to pass it a promise or async function if the test is asyncronous which for the API is mostly the case.</p>\n<p>Use <code>beforeEach()</code> to setup and teardown the test database.</p>\n<p>Use <code>chai-http</code> and <code>chai.request()</code> to retrive the API response for testing.</p>\n<p>Finally test the response using <code>should.js</code>, which add <code>should</code> &amp; others to every object, allowing to write almost plain english tests e.g. <code>response.body.should.equal('Hello World')</code></p>\n<p>Try to test for everything that should go right and wrong.</p>\n<p>Run all the the tests using the <code>mocha</code> from the <code>api</code> directory or <code>mocha path/to/test/file.test.js</code> to run a single file.</p>\n<h3>Frontend/Integration tests using <code>cypress</code></h3>\n<p>Tests are located within the <code>cypress/integration</code> directory.</p>\n<p>They should be &quot;end-to-end&quot; tests, in that they test the whole stack at once rather than each in isolation.</p>\n<p>They should test the interaction of the frontend, and makes sure they behave as they should, as well as it's interaction with the backend.</p>\n<p>Test each ember route for functionality and interaction.</p>\n<p>At a bare minimum, visit the page and check that it loads correctly.</p>\n<p>Additionally, test form interactivity, error messages, buttons etc.</p>\n<p><a href=\"https://docs.cypress.io/api/api/table-of-contents.html\">Cypress API documentation and examples</a>.</p>\n"
  },
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2021-07-04T21:13:57.950Z",
    "url": "https://apidocjs.com",
    "version": "0.27.1"
  }
});
