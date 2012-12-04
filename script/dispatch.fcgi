#!/usr/bin/env ruby

require_relative '../config/environment'
require 'fcgi'

if defined?(FCGI::Stream::Error)
  $realstderr = STDERR.dup

  class FCGI
    # print exception like ruby does
    def self.printex(e)
      bt = e.backtrace
      btl = bt[1..-1].map { |l| "  from #{l}\n"}.join ''
      $realstderr.print "#{bt[0]}: #{e} (#{e.class})\n#{btl}"
    end

    # rack uses each, and FCGI has an alias each_request for it
    def self.each
      each_request do |request|
        begin
          yield request
        rescue FCGI::Stream::Error => e
          printex(e)
        end
      end
    end
  end
end

Rack::Handler::FastCGI.run Juvia::Application
