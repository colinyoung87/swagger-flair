# SwaggerFlair

UI for swagger generated documentation

Initially built to work with a Sinatra API, using swagger v2.0 to output documentation in JSON format.
https://github.com/phawk/sinatra-api

## Getting Started

To get started using this UI on your project, simply take a copy of the public folder and update the `base_url` and `docs_url` within `js/config.js`. Open the index.html file, and you should be good to go.

## Contributing

```sh
# Bower for dependancies
$ bower install
# Grunt dependancies
$ npm install
# Watch JS/SCSS to auto build changes
$ grunt watch
# One off build
$ grunt
```