from django.conf import settings
from collections import defaultdict
import pandas as pd
import numpy as np
from surprise import NMF, SVD, Dataset, Reader
from surprise.model_selection import train_test_split
from gensim.models import Word2Vec
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
from bson import ObjectId, json_util
import json
import re
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from bson import ObjectId
import json
from django.http import JsonResponse

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
    
    try:
        # Pipeline to:
        # 1. Group by city and count attractions
        # 2. Filter cities with at least 5 attractions
        pipeline = [
            {"$group": {
                "_id": {"$trim": {"input": "$city"}},  # Remove whitespace from city names
                "count": {"$sum": 1}
            }},
            {"$match": {
                "count": {"$gte": 5},
                "_id": {"$ne": None, "$ne": ""}  # Exclude empty or null cities
            }},
            {"$project": {
                "city": "$_id",
                "_id": 0
            }}
        ]
        
        # Execute aggregation pipeline
        cities_with_counts = list(attractions_db.aggregate(pipeline))
        
        # Extract just the city names
        cities = [item["city"] for item in cities_with_counts]
        
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
        
        user_id = data.get('user_id')
        if not user_id:
            return JsonResponse({"error": "user_id is required"}, status=400)
        
        # 1. Get user data
        try:
            user_oid = ObjectId(user_id)
            user = users_db.find_one({'_id': user_oid})
        except:
            return JsonResponse({"error": "Invalid user ID format"}, status=400)
        
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)
        
        interests = user.get('interests', '')
        
        # 2. Get attractions from MongoDB
        attractions = list(attractions_db.find({}))
        if not attractions:
            return JsonResponse({"error": "No attractions found"}, status=404)
            
        df = pd.DataFrame(attractions)
        
        # 3. Preprocessing
        def preprocess(text):
            if not text or pd.isna(text):
                return []
            return [word.strip().lower() for word in str(text).split(',') if word.strip()]
        
        # Process attractions
        df['categories_cleaned'] = df['categories'].apply(preprocess)
        
        # Process user interests
        user_interests_cleaned = preprocess(interests)
        
        # 4. Word2Vec Model
        # Create training data from cleaned categories
        sentences = df['categories_cleaned'].tolist()
        
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
        for tags in df['categories_cleaned']:
            vectors = [model.wv[word] for word in tags if word in model.wv]
            avg_vector = np.mean(vectors, axis=0) if vectors else np.zeros(100)
            attraction_embeddings.append(avg_vector)
        
        # User embedding
        user_vectors = [model.wv[word] for word in user_interests_cleaned if word in model.wv]
        user_embedding = np.mean(user_vectors, axis=0) if user_vectors else np.zeros(100)
        
        # 6. Calculate Similarity
        similarities = cosine_similarity([user_embedding], attraction_embeddings)[0]
        
        # 7. Get top n attractions
        n = 10
        top_indices = np.argsort(similarities)[::-1][:n]
        recommended_attractions = df.iloc[top_indices]
        
        # Prepare response
        recommendations = []
        for _, attraction in recommended_attractions.iterrows():
            rec = {
                "attraction_id": str(attraction['_id']),
                "name": attraction.get('name', ''),
                "description": attraction.get('description', ''),
                "categories": attraction.get('categories', ''),
                "city": attraction.get('city', ''),
                "image": attraction.get('image', '')
            }
            recommendations.append(rec)
        
        return JsonResponse({
            "user_id": str(user_id),
            "user_name": user.get('fname', ''),
            "recommendations": recommendations
        }, safe=False)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)


@csrf_exempt
def NMF_SVD(request):
    users_df = pd.DataFrame(list(users_db.find({})))
    attractions_df = pd.DataFrame(list(attractions_db.find({})))
    ratings_df = pd.DataFrame(list(ratings_db.find({})))    
    
    # Ensure attraction_id and user_id are unique
    user_ids = {id: idx for idx, id in enumerate(users_df["_id"].unique())}
    attraction_ids = {id: idx for idx, id in enumerate(attractions_df["_id"].unique())}
    inv_attraction_ids = {v: k for k, v in attraction_ids.items()}  # Reverse mapping    

    # Convert Ratings to Binary for Classification (1 = liked, 0 = not liked)
    threshold = 3
    ratings_df["rating"] = (ratings_df["rating"] >= threshold).astype(int)    

    # Map IDs to indices
    ratings_df["user_id"] = ratings_df["user_id"].map(user_ids)
    ratings_df["attraction_id"] = ratings_df["attraction_id"].map(attraction_ids)

    # Debugging Info
    print("\n📊 *Data Distribution* 📊")
    print("Number of users:", len(user_ids))
    print("Number of attractions:", len(attraction_ids))
    print("Number of ratings:", len(ratings_df))
    print("Rating distribution:\n", ratings_df["rating"].value_counts())

    # Prepare attractions data  removed ', '
    attractions_df["categories"] = attractions_df["categories"].apply(lambda x: x.split(",") if isinstance(x, str) else [])

    # Prepare dataset for Surprise
    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(ratings_df[["user_id", "attraction_id", "rating"]], reader)
    trainset, testset = train_test_split(data, test_size=0.2)

    # Train model (NMF with fallback to SVD)
    try:
        print("\n🚀 Training NMF Model...")
        nmf_model = NMF(n_factors=5, n_epochs=50, reg_pu=0.1, reg_qi=0.1)
        nmf_model.fit(trainset)
        model_to_use = nmf_model
        print("✅ NMF Model Trained Successfully!")
    except ZeroDivisionError as e:
        print(f"\n⚠ NMF failed: {e}. Switching to SVD...")
        svd_model = SVD(n_factors=10, n_epochs=100, lr_all=0.005, reg_all=0.02)
        svd_model.fit(trainset)
        model_to_use = svd_model
        print("✅ SVD Model Trained Successfully!")

    # Evaluate Model
    def evaluate_model(model, testset):
        y_true, y_pred = [], []
        for uid, iid, actual in testset:
            pred = model.predict(uid, iid).est
            predicted_label = 1 if pred >= 0.5 else 0
            y_true.append(actual)
            y_pred.append(predicted_label)

        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)

        print("\n🔍 *Model Evaluation Metrics* 🔍")
        print(f"📌 Accuracy: {accuracy:.4f}")
        print(f"📌 Precision: {precision:.4f}")
        print(f"📌 Recall: {recall:.4f}")
        print(f"📌 F1-Score: {f1:.4f}")

    evaluate_model(model_to_use, testset)

    # Recommend attractions for a user
    def recommend_attractions(user_id, model, attractions_df, top_n=5):
        user_idx = user_ids.get(user_id, None)
        if user_idx is None:
            print(f"⚠ User {user_id} not found!")
            return pd.DataFrame()

        predictions = [model.predict(user_idx, attraction_id) for attraction_id in attraction_ids.values()]
        predictions = [pred for pred in predictions if pred.est >= 0]
        predictions.sort(key=lambda x: x.est, reverse=True)

        recommended_ids = [pred.iid for pred in predictions[:top_n]]
        real_ids = [inv_attraction_ids[iid] for iid in recommended_ids]
        recommended_attractions = attractions_df[attractions_df["_id"].isin(real_ids)]
        return recommended_attractions[["name", "categories"]]

    def get_attraction_by_collection_index(index: int):
        cursor = attractions_db.find().skip(index).limit(1)
        if cursor.count() == 0:
            return None
        return cursor.next()

    # Recommend similar attractions to a given attraction
    def recommend_similar_attractions(attraction_id, model, top_n=5):
        if not hasattr(model, 'qi'):
            print("❌ This model doesn't support item similarity (fallback model used).")
            return pd.DataFrame()

        attraction_idx = attraction_ids.get(attraction_id, None)
        print("id index", attraction_idx)

        if attraction_idx is None:
            print(f"⚠ Attraction ID {attraction_id} not found!")
            return pd.DataFrame()

        # Check if target vector is valid
        target_vector = model.qi[attraction_idx]
        if np.count_nonzero(target_vector) == 0:
            print("⚠ Target attraction vector is empty or unrated.")
            return fallback_by_category(attraction_id, top_n)

        # Filter out under-rated attractions
        rating_counts = ratings_df["attraction_id"].value_counts()
        well_rated_indices = [aid for aid in rating_counts[rating_counts >= 2].index]

        similarities = []
        for idx in well_rated_indices:
            if idx != attraction_idx and np.count_nonzero(model.qi[idx]) > 0:
                sim = np.dot(target_vector, model.qi[idx]) / (np.linalg.norm(target_vector) * np.linalg.norm(model.qi[idx]))
                similarities.append((idx, sim))

        similarities.sort(key=lambda x: x[1], reverse=True)
        top_indices = [idx for idx, sim in similarities[:top_n]]
        real_ids = [inv_attraction_ids[iid] for iid in top_indices]
            
        for i, iid in enumerate(top_indices):
            attraction_id = inv_attraction_ids[iid]
            
            # Get by recommendation position
            rec_position_attraction = get_attraction_by_collection_index(i)
            
            df_attraction = attractions_df[attractions_df["_id"] == attraction_id].iloc[0]
            
            similar_attractions.append({
                "position": i,
                "id": str(attraction_id),
                "name": df_attraction['name'],
                "categories": df_attraction['categories']
            })
        similar_attractions = attractions_df[attractions_df["_id"].isin(real_ids)]

        return similar_attractions[["name", "categories"]]

    # Fallback using content-based (category match)
    def fallback_by_category(attraction_id, top_n=5):
        row = attractions_df[attractions_df["_id"] == attraction_id]
        if row.empty:
            return pd.DataFrame()
        cats = row.iloc[0]["categories"]
        similar = attractions_df[attractions_df["categories"].apply(lambda c: any(cat in c for cat in cats))]
        return similar[["name", "categories"]].head(top_n)

    # Example: Recommend based on attraction
    test_attraction = list(attraction_ids.keys())[4]
    similar_attractions = recommend_similar_attractions(test_attraction, model_to_use, top_n=5)
    print(f"\n🔸 *Attractions Similar to '{test_attraction}'* 🔸")
    print(similar_attractions)

    return JsonResponse({"attractions": json_util.dumps(similar_attractions)})


@csrf_exempt
def get_must_see(request):
    try:
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


def pearson_similarity2(request):
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
        target_item_id = data['attraction_id']
            
        attractions = list(attractions_db.find({}))
        
        if not attractions:
            return JsonResponse({'error': 'No attractions found in database'}, status=404)
        
        # Find target attraction
        target_attraction = None
        other_attractions = []
        for attraction in attractions:
            if str(attraction['_id']) == target_item_id:
                target_attraction = attraction
            else:
                other_attractions.append(attraction)
        
        if not target_attraction:
            return JsonResponse({'error': f'Target attraction {target_item_id} not found'}, status=404)
        
        # Prepare category features
        attraction_features = []
        attraction_ids = []
        
        # First add all other attractions
        for attraction in other_attractions:
            categories = attraction.get('categories', [])
            if not isinstance(categories, list):
                categories = [str(categories)] if categories else []
            else:
                categories = [str(c) for c in categories]
            attraction_features.append(' '.join(categories))
            attraction_ids.append(str(attraction['_id']))
        
        # Then add target attraction's categories (for comparison only)
        target_categories = target_attraction.get('categories', [])
        if not isinstance(target_categories, list):
            target_categories = [str(target_categories)] if target_categories else []
        else:
            target_categories = [str(c) for c in target_categories]
        target_feature = ' '.join(target_categories)
        
        # Create TF-IDF vectors (including target for comparison)
        vectorizer = TfidfVectorizer()
        all_features = attraction_features + [target_feature]
        tfidf_matrix = vectorizer.fit_transform(all_features)
        
        # Calculate similarity between target and others
        target_vector = tfidf_matrix[-1]
        other_vectors = tfidf_matrix[:-1]
        similarity_scores = cosine_similarity(target_vector, other_vectors)[0]
        
        # Pair scores with attraction IDs and sort
        scored_attractions = zip(attraction_ids, similarity_scores)
        sorted_attractions = sorted(scored_attractions, key=lambda x: x[1], reverse=True)
        
        # Get top 5 similar attractions
        top_attractions = sorted_attractions[:10]
        
        # Prepare response
        attractions = []
        for attraction_id, score in top_attractions:
            attraction = next(a for a in other_attractions if str(a['_id']) == attraction_id)
            attractions.append({
                'attraction_id': attraction_id,
                'name': attraction.get('name', ''),
                'description': attraction.get('description', ''),
                'image':attraction.get('image', ''),
                'city':attraction.get('city', ''),
                'categories': attraction.get('categories', [])
            })
        
        response_data = {            
            'attractions': attractions,      
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
    
        attractions_list = [{
            "attraction_id": str(attraction["_id"]),
            "name": attraction["name"],
            "description": attraction['description'],
            "categories": attraction['categories'],
            "city": attraction['city'],
            "image": attraction.get("image", "")
        } for attraction in attractions]

        # Return consistent response format
        return JsonResponse({'attractions': attractions_list}, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
