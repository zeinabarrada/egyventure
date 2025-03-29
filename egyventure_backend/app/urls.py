from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),

    path('get_attractions/', views.get_attractions, name='get_attractions'),    
    path('get_attraction/', views.get_attraction, name='get_attraction'),
    path('must_see/', views.get_must_see, name='must_see'),
    path('get_user/', views.get_user, name='get_user'),     
    path('post_interests/', views.post_interests, name='post_interests'),
    
    path('word2vec/', views.word2vec_recommendations, name='word2vec'),
    path('NMF_SVD/', views.NMF_SVD, name='NMF_SVD'),
]
