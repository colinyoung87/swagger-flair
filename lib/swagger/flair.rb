require "swagger/flair/version"
require "rack/static"
require "rack/builder"
require "erb"
require "stringio"
require "net/http"

module Swagger
  module Flair
    def self.build(options = {})
      Rack::Builder.new do
        use Rack::Static, :urls => %w[/], :root => __dir__+"/assets"
        run Swagger::Flair::Html.new(options)
      end
    end

    class Html
      def initialize(options)
        @options = options
      end

      def call(env)
        @resp = JSON.parse(Net::HTTP.get(URI.parse(@options[:docs_url].to_s)))

        build_sections

        @base_url     = env['SCRIPT_NAME']
        current_dir   = File.expand_path(File.dirname(__FILE__))
        template      = File.new(current_dir + "/index.erb").read
        html          = ERB.new(template, nil, "%").result(binding)

        # Status, headers, string response
        [200, {}, StringIO.new(html)]
      end

      private

      def build_sections
        @sections = [{
          slug: "home",
          title: "Home",
          paths: [{
            title: @resp["info"]["title"],
            description: @resp["info"]["description"],
            slug: "top"
          }]
        }];

        @resp["paths"].each do |url, data|
          data.each do |method, props|
            slug = props["tags"][0].to_s.downcase.gsub(/[^a-z0-9 -_]/, "").gsub(" ", "-");

            collection = @sections.select { |s| s[:slug] == slug }.first
            fresh = !collection
            collection = { slug: slug, title: props["tags"][0], paths: [] } if fresh

            collection[:paths].push({
              method: method,
              url: url,
              slug: props["title"].downcase.gsub(/[^a-z0-9 -_]/, "").gsub(/ /, "-"),
              title: props["title"],
              description: props["description"],
              params: props["parameters"],
              responses: props["responses"],
              security: props["security"]
            })

            if fresh
              @sections.push(collection)
            else
              @sections = @sections.map { |s| s[:slug] == slug ? collection : s }
            end
          end
        end
      end
    end
  end
end
