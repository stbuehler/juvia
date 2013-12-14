Juvia::Application.routes.draw do
  match 'api/:action(.:format)', :to => 'api', :via => [:get, :post]
  root :to => 'admin/dashboard#index'
  
  devise_for :users
  
  namespace :admin do
    resources :comments do
      collection do
        get :preview
        get :import, :to => 'comments#new_import'
        post :import, :to => 'comments#import'
      end
      member do
        put :approve
      end
    end
    resources :sites do
      member do
        get :created
        get :test
      end
    end
    resources :users
    resources :topics
  end
  
  get 'admin/dashboard', :to => 'admin/dashboard#index', :as => :dashboard
  get 'admin/dashboard/new_admin', :to => 'admin/dashboard#new_admin'
  put 'admin/dashboard/create_admin', :to => 'admin/dashboard#create_admin'
  get 'admin/dashboard/new_site', :to => 'admin/dashboard#new_site'
  put 'admin/dashboard/create_site', :to => 'admin/dashboard#create_site'
  get 'admin/help(/:action)', :to => 'admin/help', :as => :admin_help
  
  match 'test/:action', :to => 'test', :via => [:get, :post] if Rails.env.test?

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
