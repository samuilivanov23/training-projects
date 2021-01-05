from django.urls import path
from . import views
from .custom_views import product_views

urlpatterns = [
    path('', views.index, name='index'),
    path('products/', product_views.Products, name='products'),
    path('products/<int:product_id>/', product_views.ProductDetails, name='productDedails'),
    #path('login/', product_views.LoginCustomer, name='login'),
]