require "swagger/flair/version"

require "erb"
require "rack/static"
require "rack/builder"

module Swagger
  module Flair
    def self.build(options)
      Rack::Builder.new do
        use Rack::Static, :urls => ["/css", "/images"], :root => "public"
        run Swagger::Flair::Html.new(options)
      end
    end

    class Html
      def initialize(options)
        @options = options
      end

      def call(env)
        current_dir   = File.expand_path(File.dirname(__FILE__))
        template      = File.new(current_dir + "/index.erb").read
        ERB.new(template, nil, "%").result(binding)
      end
    end
  end
end
