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
                'password': password  # hash the password before storing it
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
