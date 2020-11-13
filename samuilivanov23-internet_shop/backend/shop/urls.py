from django.urls import path
from django.conf.urls import url
from . import views
from modernrpc.views import RPCEntryPoint
import re

urlpatterns= [
    path('', views.index, name='index'),
    url(r'^rpc/', RPCEntryPoint.as_view()),
]