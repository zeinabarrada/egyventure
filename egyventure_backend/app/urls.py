from django.urls import path
from . import views

urlpatterns = [        
    path('get_all_cities/', views.get_all_cities, name='get_all_cities'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),

    path('get_similar_attractions/', views.get_similar_attractions, name='get_similar_attractions'),
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
    
    path('add_review/', views.add_review, name='add_review'),
    path('edit_review/', views.edit_review, name='edit_review'),
    path('delete_review/', views.delete_review, name='delete_review'),
    path('get_reviews/', views.get_reviews, name='get_reviews'),

    path('bert_reviews/', views.bert, name='bert_review'),
    path('word2vec/', views.word2vec_recommendations, name='word2vec'),
    path('pearson_similarity/', views.pearson_similarity2, name='pearson_similarity'),
    path('NMF_SVD/', views.NMF_SVD, name='NMF_SVD'),

    path('update_interests/', views.update_interests, name='update_interests'),
    path('account/', views.get_account_details, name='get_account_details'),
]
