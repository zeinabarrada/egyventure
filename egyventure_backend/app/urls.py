from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('get_attractions/', views.get_attractions, name='get_attractions'),    
    path('get_attraction/', views.get_attraction, name='get_attraction'),
    path('get_user/', views.get_user, name='get_user'),
    
    path('word2vec/', views.word2vec_recommendations, name='word2vec'),
    path('post_interests/', views.post_interests, name='post_interests'),
]

