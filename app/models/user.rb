require 'digest/md5'

class User < ActiveRecord::Base
  has_many :sites, -> { order(:name) }, :inverse_of => :user
  has_many :topics, :through => :sites
  has_many :comments, -> { order('comments.created_at DESC') }, :through => :topics
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :rememberable, :validatable,
         :timeoutable

  before_validation :nullify_blank_password_on_update
  
  def accessible_comments
    if admin?
      Comment.where(nil)
    else
      comments
    end
  end
  
  def accessible_sites
    if admin?
      Site.where(nil)
    else
      sites
    end
  end
  
  def email_md5
    if email
      Digest::MD5.hexdigest(email.downcase)
    else
      nil
    end
  end

  def role
    if admin?
      :admin
    else
      nil
    end
  end

private
  def nullify_blank_password_on_update
    if !new_record?
      self.password = nil if password.blank?
      self.password_confirmation = nil if password_confirmation.blank?
    end
  end
end
