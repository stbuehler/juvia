# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# see config/application.yml(.example)
if !Settings.secret?('secret_token') && !Settings.secret?('secret_key_base')
  # use a temporary generated one, prints warning
  Juvia::Application.config.secret_key_base = Settings.secret('secret_key_base')
else
  Juvia::Application.config.secret_token = Settings.secret('secret_token') if Settings.secret?('secret_token')
  Juvia::Application.config.secret_key_base = Settings.secret('secret_key_base') if Settings.secret?('secret_key_base')
end
