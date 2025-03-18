from django.urls import path
from . import views

urlpatterns = [
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('get_attractions', views.get_attractions, name='get_attractions'),
]

