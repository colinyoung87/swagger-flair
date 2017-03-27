require "swagger/flair/version"

require "erb"
require "rack/static"
require "rack/builder"
require "stringio"

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
        @base_url     = env['SCRIPT_NAME']
        current_dir   = File.expand_path(File.dirname(__FILE__))
        template      = File.new(current_dir + "/index.erb").read
        html          = ERB.new(template, nil, "%").result(binding)

        # Status, headers, string response
        [200, {}, StringIO.new(html)]
      end
    end
  end
end
