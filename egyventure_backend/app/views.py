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
            fname = request.POST['firstName']
            lname = request.POST['lastName']
            username = request.POST['username']
            gender = request.POST['gender']
            email = request.POST['email']
            password = request.POST['password']
            
            user_document = {
                'fname': fname,
                'lname': lname,
                'username': username,
                'gender': gender,
                'email': email,
                'password': password  # Note: In a real application, hash the password before storing it
            }
        
            result = users_db.insert_one(user_document)
            
            if result.inserted_id:
                return JsonResponse({'message': 'User created successfully!', 'id': str(result.inserted_id)}, status=201)
            else:
                return JsonResponse({'error': 'Failed to create user.'}, status=500)

        except KeyError as e:            
            return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
        except Exception as e:            
            return JsonResponse({'error': 'An unexpected error occurred. Please try again later.'}, status=500)
    else:
        # Render the form template for GET requests
        return render(request, 'signup.html')


@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:            
            username = request.POST['username']
            password = request.POST['password']
            
            user = users_db.find_one({'username': username})

            if user:                
                if  password == user['password']:
                    return JsonResponse({'message': 'Login successful!', 'user': str(user['_id'])}, status=200)
                else:
                    return JsonResponse({'error': 'Invalid username or password.'}, status=401)
            else:
                return JsonResponse({'error': 'User not found.'}, status=404)

        except KeyError as e:
            return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    else:        
        return render(request, 'login.html')

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
