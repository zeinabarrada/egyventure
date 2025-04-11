from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),

    path('get_attractions/', views.get_attractions, name='get_attractions'),    
    path('get_attraction_details/', views.get_attraction_details, name='get_attraction_details'),
    path('must_see/', views.get_must_see, name='must_see'),
    path('filter_city/', views.filter_city, name='filter_city'),

    path('get_user/', views.get_user, name='get_user'),     
    path('add_to_likes/', views.add_to_likes, name='add_to_likes'),
    path('remove_from_likes/', views.remove_from_likes, name='remove_from_likes'),
    path('view_likes/', views.view_likes, name='view_likes'),
    path('rate/', views.rate, name='rate'),
    path('post_interests/', views.post_interests, name='post_interests'),
    path('view_ratings/', views.view_ratings, name='view_ratings'),
    
    path('word2vec/', views.word2vec_recommendations, name='word2vec'),
    path('pearson_similarity/', views.pearson_similarity, name='pearson_similarity'),
    path('NMF_SVD/', views.NMF_SVD, name='NMF_SVD'),
]
