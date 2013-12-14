class Admin::DashboardController < ApplicationController
  layout 'admin'
  
  skip_before_filter :authenticate_user!, :only => [:index, :new_admin, :create_admin]
  skip_authorization_check
  before_filter :require_admin!, :except => [:index, :new_admin, :create_admin]
  before_filter :require_no_admins_defined, :only => [:new_admin, :create_admin]
  before_filter :set_navigation_ids
  
  def index
    if User.where(:admin => true).count == 0
      redirect_to :action => 'new_admin'
    elsif current_user && current_user.accessible_sites.count == 0
      redirect_to :action => 'new_site'
    else
      redirect_to admin_sites_path
    end
  end
  
  def new_admin
    @user = User.new
  end
  
  def create_admin
    @user = User.new(create_first_user_params)
    @user.admin = true
    if @user.save
      sign_in(@user)
      redirect_to dashboard_path
    else
      render :action => 'new_admin'
    end
  end
  
  def new_site
    @site = Site.new
  end
  
  def create_site
    @site = Site.new(create_site_params)
    @site.user = current_user
    if @site.save
      redirect_to created_admin_site_path(@site)
    else
      render :action => 'new_site'
    end
  end

private
  def require_no_admins_defined
    if User.where(:admin => true).count > 0
      render :template => 'shared/forbidden'
    end
  end
  
  def set_navigation_ids
    @navigation_ids = [:dashboard]
  end

  def create_first_user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :remember_me)
  end

  def create_site_params
    # :user is overwritten in create, no need to allow it/:user_id for current_user.admin? here
    params.require(:site).permit(:name, :url, :moderation_method, :akismet_key)
  end
end
