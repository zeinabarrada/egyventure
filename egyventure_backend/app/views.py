from django.conf import settings
from collections import defaultdict
import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from sklearn.metrics.pairwise import cosine_similarity
from surprise import NMF, SVD, Dataset, Reader
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
from bson import ObjectId, json_util
import json
import re
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score

""" Remove these lines to the beginning of each view, and close client after use """
client = MongoClient('mongodb://localhost:27017/')
db = client['db']
users_db = db['users']
attractions_db = db['attractions']
ratings_db = db['ratings']

@csrf_exempt
def get_all_cities(request):
    if not client or not attractions_db:
        return JsonResponse({"error": "db not connected"})
    
    # Use distinct to get unique city values directly from MongoDB
    try:
        cities = attractions_db.distinct("city")
        return JsonResponse({'cities': cities})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:  
            data = json.loads(request.body)          
            fname = data['firstName']
            lname = data['lastName']
            username = data['username']
            gender = data['gender']
            email = data['email']
            password = data['password']            
            
            user = {
                'fname': fname,
                'lname': lname,
                'username': username,
                'gender': gender,
                'email': email,
                'password': password,
                'interests':''
            }
        
            result = users_db.insert_one(user)
            
            if result.inserted_id:
                return JsonResponse(
                    {
                    'success':True,'message': 'User created successfully!', 
                    'id': str(result.inserted_id),
                    'name': str(fname),
                    }, status=201)
            else:
                return JsonResponse({'error': 'Failed to create user.'}, status=500)

        except KeyError as e:            
            return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
        except Exception as e:            
            return JsonResponse({'error': 'An unexpected error occurred. Please try again later.'}, status=500)


@csrf_exempt
def login(request):    
    try:                        
        data = json.loads(request.body)  

        email = data['email']
        password = data['password']            

        user = users_db.find_one({'email': email})            

        if user:                
            if  password == user['password']:
                return JsonResponse(
                    {
                    'success':True,
                    'message': 'Login successful!',
                    'user_id': str(user['_id']), 
                    'name': str(user['fname'])
                    }, status=200)
            else:
                return JsonResponse({'error': 'Invalid username or password.'}, status=401)
        else:
            return JsonResponse({'error': 'User not found.'}, status=404)

    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


@csrf_exempt
def get_attractions(request):
    try:
        # Handle different request methods and content types
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        elif request.method == 'GET':
            data = request.GET
        elif request.method == 'POST':
            data = request.POST



        # Query with pagination and projection
        attractions = list(attractions_db.find({}).limit(1000)) 

        # Process results
        result = []
        for attraction in attractions:
            attraction['id'] = str(attraction.pop('_id'))  # Rename _id to id
            attraction.setdefault('image', '')  # Ensure image exists
            attraction['description'] = attraction.get('description', '')  # Truncate
            result.append(attraction)

        return JsonResponse({
            'status': 'success',
            'data': result,
           
        }, safe=False)

    except ValueError as e:
        return JsonResponse({'status': 'error', 'message': 'Invalid page or limit value'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
def get_attraction_details(request):    
    try:            
        # Parse request data
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        elif request.method == 'GET':
            data = request.GET
        elif request.method == 'POST':
            data = request.POST

        attraction_id = data.get('attraction_id')            

        if not attraction_id:
            return JsonResponse({'status': 'error', 'message': 'attraction ID is required.'}, status=400)

        # Convert the ID to ObjectId
        attraction_id = ObjectId(attraction_id)

        # Find the attraction by its ID
        attraction = attractions_db.find_one({'_id': attraction_id})

        if not attraction:
            return JsonResponse({'status': 'error', 'message': 'ttraction not found.'}, status=404)

        # Convert ObjectId to string
        attraction['_id'] = str(attraction['_id'])

        # Return the attraction in a JsonResponse
        return JsonResponse({'status': 'success', 'attraction': attraction}, safe=False)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)    


@csrf_exempt
def get_user(request):    
    try:            
        data = json.loads(request.body)
        user_id = data.get('user_id')

        if not user_id:
            return JsonResponse({'status': 'error', 'message': 'User ID is required.'}, status=400)
        
        user_id = ObjectId(user_id)
        
        user = users_db.find_one({'_id': user_id})

        if not user:
            return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=404)
    
        user['_id'] = str(user['_id'])
        
        return JsonResponse({'status': 'success', 'user': user}, safe=False)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def post_interests(request):
    if request.method =='POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            interests = data.get('interests')            

            if not user_id:
                return JsonResponse({'status': 'error', 'message': 'User ID is required.'}, status=400)
            elif not interests:
                return JsonResponse({'status': 'error', 'message': 'User interests are required.'}, status=400)
            
            user_id = ObjectId(user_id)

            users_db.find_one_and_update(
                {'_id': user_id},
                {'$set': {'interests': interests}},
                upsert=True)

            return JsonResponse({'status' : 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def word2vec_recommendations(request):
    try:
        # Parse request data
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        elif request.method == 'GET':
            data = request.GET
        elif request.method == 'POST':
            data = request.POST        
        
        user_id = data['user_id']
        
        # 1. Get user data
        user_oid = ObjectId(user_id)
        user = users_db.find_one({'_id': user_oid})
        
        if not user:
            return JsonResponse({"error": "user not found"})
        
        interests = user['interests']  # "sights & landmarks, sacred & religious sites"
        
        # 2. Get attractions from MongoDB
        attractions = list(db.attractions.find({}))
        df = pd.DataFrame(attractions)
        
        # 3. Preprocessing
        def preprocess(text):
            return [word.strip().lower() for word in text.split(',')]
        
        # Process attractions
        df['categories_cleaned'] = df['categories'].apply(
            lambda x: preprocess(x) if x else []
        )
        
        # Process user interests
        user_interests_cleaned = preprocess(interests)
        
        # 4. Word2Vec Model
        # Create training data from attraction categories
        sentences = [doc.split() for doc in df['categories'].fillna('').str.lower()]
        
        # Train model
        model = Word2Vec(
            sentences=sentences,
            vector_size=100,
            window=5,
            min_count=1,
            workers=4
        )
        
        # 5. Generate Embeddings
        # Attraction embeddings
        attraction_embeddings = []
        for tags in df['categories']:
            vectors = [model.wv[word] for word in tags.split() if word in model.wv]
            avg_vector = np.mean(vectors, axis=0) if vectors else np.zeros(100)
            attraction_embeddings.append(avg_vector)
        
        # User embedding
        user_vectors = [model.wv[word] for word in ' '.join(user_interests_cleaned).split() if word in model.wv]
        user_embedding = np.mean(user_vectors, axis=0) if user_vectors else np.zeros(100)
        
        # 6. Calculate Similarity
        similarities = cosine_similarity([user_embedding], attraction_embeddings)[0]
        
        # 7. Get top n attractions
        n = 10
        top_indices = np.argsort(similarities)[::-1][:n]
        recommended_attractions = df.iloc[top_indices]
        
        # Convert ObjectIds to strings
        recommended_ids = [str(oid) for oid in recommended_attractions]
        
        recommendations = [{
            "attraction_id": str(attraction['_id']),
            "name": attraction['name'], 
            "description":attraction['description'],            
            "categories": attraction['categories'],
            "city": attraction['city'],        
            "image":attraction['image'],
        } for _, attraction in recommended_attractions.iterrows()]
        
        return JsonResponse({
            "user_id": str(user_id),
            "user_name": user['fname'],
            "recommendations": recommendations
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def NMF_SVD(request):
    """Recommend attractions while strictly excluding already rated ones."""
    try:
        # Get and validate user ID
        user_id = request.GET.get("user_id")
        if not user_id:
            return JsonResponse({"error": "User ID is required."}, status=400)
        
        try:
            user_oid = ObjectId(user_id)
        except:
            return JsonResponse({"error": "Invalid user ID format."}, status=400)

        # Fetch user data
        user = users_db.find_one({"_id": user_oid})
        if not user:
            return JsonResponse({"error": "User not found."}, status=404)

        # Get all attractions and user's ratings first
        attractions = list(attractions_db.find({}))
        if not attractions:
            return JsonResponse({"error": "No attractions found."}, status=404)

        # Get user's rated attractions - CRITICAL FILTER
        user_ratings = list(db.ratings.find({"user_id": user_id}))
        rated_attraction_ids = {str(rating['attraction_id']) for rating in user_ratings}        

        # Get all ratings for training
        all_ratings = list(db.ratings.find({}))
        if not all_ratings:
            return JsonResponse({"error": "No ratings data found."}, status=404)

        # Prepare DataFrame
        ratings_df = pd.DataFrame(all_ratings)
        
        # Create mappings
        user_ids = {str(id): idx for idx, id in enumerate(ratings_df["user_id"].unique())}
        attraction_ids = {str(id): idx for idx, id in enumerate(ratings_df["attraction_id"].unique())}
        
        # Create reverse mapping for later
        idx_to_attraction_id = {v: k for k, v in attraction_ids.items()}

        # Check if user exists in ratings
        user_idx = user_ids.get(str(user_oid))
        if user_idx is None:
            return JsonResponse({"error": "User not found in ratings."}, status=404)

        # Prepare matrix data
        ratings_df["user_idx"] = ratings_df["user_id"].map(user_ids)
        ratings_df["attraction_idx"] = ratings_df["attraction_id"].map(attraction_ids)
        ratings_df = ratings_df.dropna().astype({'user_idx': int, 'attraction_idx': int})
        ratings_df["rating"] = (ratings_df["rating"] >= 3).astype(int)

        # Train model
        reader = Reader(rating_scale=(0, 1))
        data = Dataset.load_from_df(ratings_df[["user_idx", "attraction_idx", "rating"]], reader)
        full_trainset = data.build_full_trainset()
        testset = full_trainset.build_testset()
        
        # Train & Compare NMF and SVD
        def train_model(model, trainset, testset):
            """Train model and return evaluation scores."""
            model.fit(full_trainset)
            y_true, y_pred = [], []

            for uid, iid, actual in testset:
                pred = model.predict(uid, iid).est
                predicted_label = 1 if pred >= 0.5 else 0
                y_true.append(actual)
                y_pred.append(predicted_label)

            return {
                "accuracy": accuracy_score(y_true, y_pred),
                "precision": precision_score(y_true, y_pred, zero_division=0),
                "recall": recall_score(y_true, y_pred, zero_division=0),
                "f1": f1_score(y_true, y_pred, zero_division=0),
                "model": model
            }

        nmf_results = train_model(NMF(n_factors=5, n_epochs=50, reg_pu=0.1, reg_qi=0.1), full_trainset, testset)
        svd_results = train_model(SVD(n_factors=10, n_epochs=100, lr_all=0.005, reg_all=0.02), full_trainset, testset)

        # Choose the best model
        if nmf_results["f1"] >= svd_results["f1"] :
            model_name = 'NMF'
            best_model = nmf_results['model']            
        else:
            model_name = 'SVD'
            best_model = svd_results['model']

        # Generate predictions ONLY for unrated attractions
        predictions = []
        for attraction_idx in attraction_ids.values():
            attraction_id_str = idx_to_attraction_id[attraction_idx]
                        
            if attraction_id_str in rated_attraction_ids:
                continue
                
            try:
                pred = best_model.predict(user_idx, attraction_idx)
                predictions.append({
                    "attraction_id": attraction_id_str,
                    "score": pred.est,
                    "iid": attraction_idx
                })
            except Exception as e:
                return JsonResponse({'message': str(e)}, staus=500)

        # Sort by score descending
        predictions.sort(key=lambda x: x["score"], reverse=True)

        # Get top 10 unrated attractions
        top_recommendations = predictions[:10]
        recommended_ids = [rec["attraction_id"] for rec in top_recommendations]

        # filter any rated attractions that slipped through
        recommended_attractions = [
            attraction for attraction in attractions 
            if str(attraction["_id"]) in recommended_ids
            and str(attraction["_id"]) not in rated_attraction_ids
        ]

        # Prepare response
        recommendations = [{
            "id": str(attraction["_id"]),
            "score": round(next(rec["score"] for rec in top_recommendations 
                            if rec["attraction_id"] == str(attraction["_id"])), 2),
            "name": attraction["name"],
            "categories": attraction['categories'],
            "city": attraction['city'],            
            "image": attraction.get("image", "")
        } for attraction in recommended_attractions]

        return JsonResponse({
            "user_id": str(user_oid),
            'user_name': user['fname'],
            'model': model_name,
            "recommendations": recommendations,
            "debug": {
                "recommended_attractions": len(attraction_ids),
                "unrated_considered": len(predictions)                
            }
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_must_see(request):
    try:
        
        rating_threshold = 4
        min_reviews = 1000

        df = pd.DataFrame(list(attractions_db.find({})))        

        # Filter most-rated attractions
        must_see = df[df['numberOfRatings'] >= min_reviews].copy()
        must_see.sort_values(by='numberOfRatings', ascending=False, inplace=True)

        must_see_list = [{
            "attraction_id": str(attraction["_id"]),
            "name": attraction["name"],
            "description": attraction['description'],
            "categories": attraction['categories'],
            "city": attraction['city'],
            "image": attraction.get("image", "")
        } for attraction in must_see.to_dict('records')]  # Convert DataFrame to list of dicts

        return JsonResponse({            
            'must_see': must_see_list
        })
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)


@csrf_exempt
def add_to_likes(request):
    try:        
        if 'application/json' in request.content_type:
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        else:
            data = request.POST

        user_id = data.get('user_id')
        attraction_id = data.get('attraction_id')

        if not user_id or not attraction_id:
            return JsonResponse({"messages": "Both user_id and attraction_id are required"}, status=400)
        
        user_oid = ObjectId(user_id)
        attraction_oid = ObjectId(attraction_id)

        updated_user = users_db.find_one_and_update(
            {'_id':user_oid},
            {"$addToSet": {"likes": attraction_oid}},
                return_document=True
            )
                
        if not updated_user:
                return JsonResponse({"message":"User not found"}, status=500)
        
        return JsonResponse({
            "success": True,
            "user": str(updated_user)
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


@csrf_exempt
def remove_from_likes(request):
    try:        
        if 'application/json' in request.content_type:
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        else:
            data = request.POST

        user_id = data.get('user_id')
        attraction_id = data.get('attraction_id')

        if not user_id or not attraction_id:
            return JsonResponse({"messages": "Both user_id and attraction_id are required"}, status=400)
        
        user_oid = ObjectId(user_id)
        attraction_oid = ObjectId(attraction_id)

        updated_user = users_db.find_one_and_update(
            {'_id': user_oid},
            {"$pull": {"likes": attraction_oid}},
            return_document=True
        )
                
        if not updated_user:
            return JsonResponse({"message": "User not found"}, status=404)
        
        return JsonResponse({
            "success": True,
            "user": str(updated_user)
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


@csrf_exempt
def view_likes(request):
    try:
        if request.method != 'GET':
            return JsonResponse({"error": "Only GET method is allowed"}, status=405)
        
        if 'application/json' in request.content_type:
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        else:
            data = request.GET
        
        user_id = data.get('user_id')

        if not user_id:
            return JsonResponse({"error": "user_id is required"}, status=400)
        
        user_oid = ObjectId(user_id)
        user = users_db.find_one({'_id': user_oid}, {'likes': 1})
        
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)
        
        likes_ids = user.get('likes', [])
        
        # Fetch full details for each attraction
        attractions = []
        for attraction_id in likes_ids:
            attraction = attractions_db.find_one({'_id': attraction_id})
            if attraction:
                attraction['_id'] = str(attraction['_id'])
                attractions.append(attraction)

        return JsonResponse({
            "success": True,
            "attractions": attractions
        }, status=200)
    
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


@csrf_exempt
def rate(request):
    try:
        # Parse request data
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        else:
            data = request.POST

        # Validate required fields
        required_fields = ['user_id', 'attraction_id', 'rating']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return JsonResponse({'error': f'Missing fields: {", ".join(missing_fields)}'}, status=400)

        user_id = data['user_id']
        attraction_id = data['attraction_id']
        rating = data['rating']

        # Validate rating value
        try:
            rating = float(rating)
            if not (0 <= rating <= 5):
                return JsonResponse({'error': 'Rating must be between 0 and 5'}, status=400)
        except ValueError:
            return JsonResponse({'error': 'Rating must be a number'}, status=400)

        # Get user and attraction names
        try:
            user = users_db.find_one({"_id": ObjectId(user_id)})
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            attraction = attractions_db.find_one({"_id": ObjectId(attraction_id)})
            if not attraction:
                return JsonResponse({'error': 'Attraction not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'Error validating user or attraction'}, status=500)
        
        ratings_db.insert_one({
            "user_id": user_id,
            "user_name": user.get('fname', ''),
            "attraction_id": attraction_id,
            "attraction_name": attraction.get('name', ''),
            "rating": rating,            
        })

        return JsonResponse({
            'success': True,
            'user_name': user.get('fname', ''),
            'attraction_name': attraction.get('name', ''),
            'rating': rating
        }, status=201)

    except Exception as e:        
        return JsonResponse({
            'error': 'An unexpected error occurred. Please try again later.'
        }, status=500)


@csrf_exempt
def pearson_similarity(request):     
    # Parse request data
    if request.content_type == 'application/json':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    
    elif request.method == 'GET':
        data = request.GET

    elif request.method == 'POST':
        data = request.POST

    try:
        target_user_id = data['user_id']
        
        # Fetch ratings from MongoDB
        ratings = ratings_db.find({}, {'user_id': 1, 'attraction_id': 1, 'rating': 1, '_id': 0})
        ratings = list(ratings)

        if not ratings:
            return JsonResponse({'error': 'No ratings found in database'}, status=404)
        
        # Create user-item matrix        
        df = pd.DataFrame(ratings)
        user_item_matrix = df.pivot(index='user_id', columns='attraction_id', values='rating')
        
        if user_item_matrix.empty:
            return JsonResponse({'error': 'No data available to process'}, status=404)
        
        # Check if target user exists
        if target_user_id not in user_item_matrix.index:
            return JsonResponse({'error': f'Target user {target_user_id} not found'}, status=404)
        
        # Compute user similarities using Pearson correlation
        user_similarity_df = user_item_matrix.T.corr(method='pearson').fillna(0)
        
        # Extract similarities for the target user
        target_similarities = user_similarity_df.loc[target_user_id]
        
        # Exclude target user and filter out non-positive similarities
        similar_users = target_similarities.drop(target_user_id).to_dict()
        similar_users = {user: sim for user, sim in similar_users.items() if sim > 0}
        
        if not similar_users:
            return JsonResponse({'error': f'No similar users found for {target_user_id}'}, status=404)
        
        # Identify attractions the target hasn't rated
        target_rated = user_item_matrix.loc[target_user_id].dropna().index
        all_attractions = user_item_matrix.columns
        target_unrated = [att for att in all_attractions if att not in target_rated]
        
        # Calculate weighted scores for each unrated attraction
        attraction_scores = defaultdict(float)
        
        for attraction in target_unrated:
            total_score = 0.0
            total_weight = 0.0
            for user, similarity in similar_users.items():
                user_rating = user_item_matrix.loc[user, attraction]
                if not pd.isna(user_rating):
                    total_score += user_rating * similarity
                    total_weight += similarity
            if total_weight > 0:
                attraction_scores[attraction] = total_score / total_weight
        
        if not attraction_scores:
            return JsonResponse({'error': 'No recommendations available'}, status=404)
        
        # Sort attractions by their weighted score in descending order
        sorted_recommendations = sorted(attraction_scores.items(), key=lambda x: -x[1])
        recommendations = [ObjectId(attraction) for attraction, _ in sorted_recommendations]
        
        # Select top 5 recommendations
        top_recommendations = recommendations[:5]
        
        # Get user and attraction details for response
        user = users_db.find_one({"_id": ObjectId(target_user_id)})
        attraction_details = []
        
        for attraction_id in top_recommendations:
            attraction = attractions_db.find_one({"_id": attraction_id})
            if attraction:
                attraction_details.append({
                    'id': str(attraction['_id']),
                    'name': attraction.get('name', '')                    
                })
        
        response_data = {
            'user_id': target_user_id,
            'user_name': user.get('fname', '') if user else '',
            'recommendations': attraction_details
        }
        
        return JsonResponse(response_data)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def view_ratings(request):
    if request.content_type == 'application/json':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    elif request.method == 'GET':
        data = request.GET
    elif request.method == 'POST':
        data = request.POST
    user_id = data['user_id']
    try:
        # Validate user_id format
        try:
            user_object_id = ObjectId(user_id)
        except:
            return JsonResponse({'error': 'Invalid user ID format'}, status=400)

        # Check if user exists
        user = users_db.find_one({'_id': user_object_id})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Get all ratings for the user
        ratings = list(ratings_db.find(
            {'user_id': user_id},
            {'_id': 0, 'user_id': 0}  # Exclude these fields from response
        ))

        # Convert ObjectId fields to strings in the attractions
        for rating in ratings:
            if 'attraction_id' in rating:
                rating['attraction_id'] = str(rating['attraction_id'])

        response_data = {
            'user_id': user_id,
            'user_name': user.get('fname', ''),
            'total_ratings': len(ratings),
            'ratings': ratings
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def filter_city(request):
    location = None
    
    # Handle different request methods
    if request.method == 'GET':
        location = request.GET.get('city')
    elif request.method == 'POST':
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body.decode('utf-8'))
                location = data.get('city')
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        else:
            location = request.POST.get('city')
    
    # Validate location parameter
    if not location:
        return JsonResponse({'error': 'Location parameter is required'}, status=400)
    
    try:
        # Normalize the search query
        normalized_query = re.sub(r'[,\s]+', ' ', location.lower().strip())
        
        # Create a regex pattern that matches variations
        regex_pattern = '.*' + '.*'.join(normalized_query.split()) + '.*'
        
        # Query database
        attractions = list(attractions_db.find({
            'city': {'$regex': regex_pattern, '$options': 'i'}
        }))
                    
        # Convert MongoDB objects to JSON
        attractions_json = json.loads(json_util.dumps(attractions))
        
        # Return consistent response format
        return JsonResponse({'attractions': attractions_json}, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
