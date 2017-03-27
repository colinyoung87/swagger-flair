require "swagger/flair/version"

require "erb"
require "rack/static"
require "rack/builder"

module Swagger
  module Flair
    def self.build(options)
      Rack::Builder.new do
        use Rack::Static, :urls => ["/css", "/images"], :root => "public"
        run Swagger::Flair::Html, options
      end
    end

    class Html
      def initialize(app, options)
        @app = app
        @options = options
      end

      def call(env)
        current_dir   = File.expand_path(File.dirname(__FILE__))
        template      = File.new(current_dir + "/index.erb").read
        html          = ERB.new(template, nil, "%").result(binding)

        # Status, headers, string response
        [200, {}, html]
      end
    end
  end
end
