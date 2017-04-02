# SwaggerFlair

UI for swagger generated documentation.

Initially built to work with a Sinatra API, using swagger v2.0 to output documentation in JSON format.
https://github.com/phawk/sinatra-api
https://github.com/fotinakis/swagger-blocks

## Getting Started

Add to your Gemfile:
`gem 'swagger-flair', :git => 'git://github.com/colinyoung87/swagger-flair.git'`

In Sinatra, update your `config.ru` file:
```sh
run Rack::URLMap.new('/' => Api::Base, '/docs' => Swagger::Flair.build(
  base_url: 'https://your-api.com',
  docs_url: 'https://your-api.com/api-docs.json'
))
```

Note the `base_url` is the url to your api, and the `docs_url` is the url to the swagger blocks JSON output.

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