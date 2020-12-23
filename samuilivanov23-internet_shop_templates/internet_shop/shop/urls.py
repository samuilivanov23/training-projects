from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('products/', views.Products, name='products'),
    path('products/<int:product_id>', views.ProductDetails, name='products'),
]