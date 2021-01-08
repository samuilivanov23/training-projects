from django.urls import path
from . import views
from .custom_views import product_views, customer_views, order_views

urlpatterns = [
    path('', views.index, name='index'),
    path('products/', product_views.Products, name='products'),
    path('products/<int:product_id>/', product_views.ProductDetails, name='productDedails'),
    path('cart/', product_views.CartProducts, name='cartProducts'),
    path('checkout/', order_views.CheckoutOrder, name='chekoutOrder'),
    path('register/', customer_views.RegisterCustomer, name='registerCustomer'),
    path('register/<uuid:token_id>/', customer_views.ConfirmEmail, name='confirmEmail'),
    path('login/', customer_views.LoginCustomer, name='loginCustomer'),
    path('logout/', customer_views.LogoutCustomer, name='logoutCustomer'),
]