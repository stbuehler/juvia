source 'https://rubygems.org'

gem "rails", "~> 4.0.2"

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

gem 'schema_plus'
gem 'bluecloth'
gem 'devise', '~> 3.2.2'
gem 'jquery-rails', '~> 3.0.4'
gem 'will_paginate', '~> 3.0.5'
gem 'css3buttons'
gem 'cancan', '~> 1.6.10'
gem 'inherited_resources'
gem 'nokogiri'
gem 'settingslogic', '~> 2.0.9'

# Deploy with Capistrano
# gem 'capistrano'

# Deploy with fastcgi
group :fastcgi do
  gem "fcgi", "~> 0.9.2", :require => false
end

# To use debugger
# gem 'ruby-debug'
gem 'bcrypt-ruby'

group :development do
  gem 'guard-livereload'

  # Gems used for comment import from WordPress
  # gem 'htmlentities'
  # gem 'sequel'
  # gem 'mysqlplus'
end

# Bundle gems for the local environment. Make sure to
# put test-only gems in this group so their generators
# and rake tasks are available in development mode:
group :development, :test do
  gem 'rspec-rails', '~> 2.4'
  gem 'capybara', :require => false
  gem 'capybara-webkit', :require => false
  gem 'database_cleaner', :require => false
  gem 'factory_girl_rails', "~> 4.0", :require => false
  gem 'launchy', :require => false
  gem 'spork', '0.9.0.rc9', :require => false
end

# Use SCSS for stylesheets
gem "sass-rails", "~> 4.0.1"

# Use CoffeeScript for .js.coffee assets and views
gem "coffee-rails", "~> 4.0.1"

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 2.3.3'

group :mysql do
  # adapter: mysql2
  gem 'mysql2', :require => false
end

group :postgres do
  # adapter: postgresql
  gem 'pg', :require => false
end

group :sqlite do
  # adapter: sqlite3
  gem 'sqlite3', :require => false
end
