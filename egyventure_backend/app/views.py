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
                        'first_name': str(user['fname'])
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


def word2vec_recommendations(request):
    import numpy as np
    import pandas as pd
    from gensim.models import Word2Vec
    from sklearn.metrics.pairwise import cosine_similarity
    
    try:
        # 1. Get user data
        user_id = ObjectId('67d9e145c008daadabbbfa37')
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
        n =10
        top_indices = np.argsort(similarities)[::-1][:n]
        recommended_attractions = df.iloc[top_indices][['_id', 'name']]
        
        # Convert ObjectIds to strings
        recommended_ids = [str(oid) for oid in recommended_attractions]
        
        recommendations = [{
            "id": str(attraction['_id']),
            "name": attraction['name']
        } for _, attraction in recommended_attractions.iterrows()]
        
        return JsonResponse({
            "user_id": str(user_id),
            "user_name": user['fname'],
            "recommendations": recommendations
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
