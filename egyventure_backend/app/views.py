import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from sklearn.metrics.pairwise import cosine_similarity
from surprise import NMF, SVD, Dataset, Reader
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
from bson import ObjectId
import json


client = MongoClient('mongodb://localhost:27017/')
db = client['db']
users_db = db['users']
attractions_db = db['attractions']
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
    if request.method == 'POST':
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
    attractions = list(attractions_db.find({}))

    # Convert ObjectId to string in each document
    for doc in attractions:
        doc['_id'] = str(doc['_id'])

    # Return the documents in a JsonResponse
    return JsonResponse({'status': 'success', 'attractions': attractions}, safe=False)


@csrf_exempt
def get_attraction(request):
    if request.method == 'POST':
        try:            
            data = json.loads(request.body)
            attraction_id = data.get('id')

            if not attraction_id:
                return JsonResponse({'status': 'error', 'message': 'Attraction ID is required.'}, status=400)

            # Convert the ID to ObjectId
            attraction_id = ObjectId(attraction_id)

            # Find the attraction by its ID
            attraction = attractions_db.find_one({'_id': attraction_id})

            if not attraction:
                return JsonResponse({'status': 'error', 'message': 'Attraction not found.'}, status=404)

            # Convert ObjectId to string
            attraction['_id'] = str(attraction['_id'])

            # Return the attraction in a JsonResponse
            return JsonResponse({'status': 'success', 'attraction': attraction}, safe=False)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    else:        
        return render(request, 'get_attraction.html')


@csrf_exempt
def get_user(request):
    if request.method == 'GET':
        try:            
            data = json.loads(request.body)
            user_id = data.get('id')

            if not user_id:
                return JsonResponse({'status': 'error', 'message': 'User ID is required.'}, status=400)

            # Convert the ID to ObjectId
            user_id = ObjectId(user_id)

            # Find the attraction by its ID
            user = users_db.find_one({'_id': user_id})

            if not user:
                return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=404)

            # Convert ObjectId to string
            user['_id'] = str(user['_id'])

            # Return the attraction in a JsonResponse
            return JsonResponse({'status': 'success', 'user': user}, safe=False)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def post_interests(request):
    if request.method =='POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('id')            
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
        # data = json.loads(request.body)
        id = request.GET.get('id')
        
        # 1. Get user data
        user_id = ObjectId(id)
        user = db.users.find_one({'_id': user_id})
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
        recommended_attractions = df.iloc[top_indices][['_id', 'name', 'description', 'image']]
        
        # Convert ObjectIds to strings
        recommended_ids = [str(oid) for oid in recommended_attractions]
        
        recommendations = [{
            "id": str(attraction['_id']),
            "name": attraction['name'], 
            "descriptions":attraction['description'],
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
    """Unified function for recommendations using NMF & SVD."""
    try:
        user_id = request.GET.get("id")
        if not user_id:
            return JsonResponse({"error": "User ID is required."}, status=400)

        # Convert user_id to ObjectId for MongoDB
        from bson import ObjectId
        user_id = ObjectId(user_id)    

        # Fetch user and attraction data
        user = users_db.find_one({"_id": user_id})
        if not user:
            return JsonResponse({"error": "User not found."}, status=404)

        attractions = list(attractions_db.find({}))
        if not attractions:
            return JsonResponse({"error": "No attractions found."}, status=404)

        # Load ratings dataset
        ratings = list(db.ratings.find({}))
        ratings_df = pd.DataFrame(ratings)

        if ratings_df.empty:
            return JsonResponse({"error": "No ratings data found."}, status=404)

        # Convert attraction & user IDs to numeric format
        user_ids = {id: idx for idx, id in enumerate(ratings_df["user_id"].unique())}
        attraction_ids = {id: idx for idx, id in enumerate(ratings_df["attraction_id"].unique())}

        ratings_df["user_id"] = ratings_df["user_id"].map(user_ids)
        ratings_df["attraction_id"] = ratings_df["attraction_id"].map(attraction_ids)
        ratings_df.dropna(inplace=True)
        ratings_df = ratings_df.astype(int)

        # Convert Ratings to Binary (1 = Liked, 0 = Not Liked)
        ratings_df["rating"] = (ratings_df["rating"] >= 3).astype(int)

        # Prepare data for Surprise
        reader = Reader(rating_scale=(0, 1))
        data = Dataset.load_from_df(ratings_df[["user_id", "attraction_id", "rating"]], reader)
        trainset, testset = train_test_split(data, test_size=0.2)

        # Train & Compare NMF and SVD
        def train_model(model, trainset, testset):
            """Train model and return evaluation scores."""
            model.fit(trainset)
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

        nmf_results = train_model(NMF(n_factors=5, n_epochs=50, reg_pu=0.1, reg_qi=0.1), trainset, testset)
        svd_results = train_model(SVD(n_factors=10, n_epochs=100, lr_all=0.005, reg_all=0.02), trainset, testset)

        # Choose the best model
        best_model = nmf_results["model"] if nmf_results["f1"] >= svd_results["f1"] else svd_results["model"]

        # Generate Recommendations for the User
        user_idx = user_ids.get(str(user_id))
        if user_idx is None:
            return JsonResponse({"error": "User not found in ratings."}, status=404)

        predictions = [best_model.predict(user_idx, attraction_id) for attraction_id in attraction_ids.values()]
        predictions.sort(key=lambda x: x.est, reverse=True)

        top_n = 5
        recommended_ids = [pred.iid for pred in predictions[:top_n]]
        recommended_attractions = [attraction for attraction in attractions if str(attraction["_id"]) in recommended_ids]

        recommendations = [{
            "id": str(attraction["_id"]),
            "name": attraction["name"],
            "description": attraction.get("description", ""),
            "image": attraction.get("image", ""),
        } for attraction in recommended_attractions]

        return JsonResponse({
            "user_id": str(user["user_id"]),
            "user_name": user["fname"],
            "model_used": "NMF" if best_model == nmf_results["model"] else "SVD",
            "recommendations": recommendations
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)