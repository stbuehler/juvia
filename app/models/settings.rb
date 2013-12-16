class Settings < Settingslogic
  source "#{Rails.root}/config/application.yml"
  namespace Rails.env
  load!

  def secret(key, temporary = true)
    ENV[key.upcase] || self[key] || if Rails.env.development? or Rails.env.test?
      SecureRandom.hex(64)
    else
      if temporary
        STDERR.puts "No #{key.upcase} set in environment, neither configured #{key}: generating a temporary secret (see config/application.yml.example)."
        SecureRandom.hex(64)
      else
        raise "No #{key.upcase} set in environment, neither configured #{key}: can't use temporary secret in production for this (see config/application.yml.example)."
      end
    end
  end

  def secret?(key, temporary = true)
    ENV[key.upcase] || self[key]
  end
end
