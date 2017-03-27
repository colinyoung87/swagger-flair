require "spec_helper"

RSpec.describe Swagger::Flair do
  it "has a version number" do
    expect(Swagger::Flair::VERSION).not_to be nil
  end

  it "does something useful" do
    expect(false).to eq(true)
  end
end
