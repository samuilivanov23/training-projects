from django.urls import path
from django.conf.urls import url
from . import views
from modernrpc.views import RPCEntryPoint
import re

urlpatterns= [
    path('', views.index, name='index'),
    path('payment/', views.ProccessEpayNotification, name='ProccessEpayNotification'),
    url(r'^rpc/', RPCEntryPoint.as_view()),
    url(r'^rpc/filters/', RPCEntryPoint.as_view()),
]