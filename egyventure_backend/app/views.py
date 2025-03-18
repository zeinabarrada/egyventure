from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
from pymongo import MongoClient

logger = logging.getLogger(__name__)
client = MongoClient('mongodb://localhost:27017/')
db = client['db']
users_db = db['users']

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        try:        
            logger.info(f'Incoming request data: {request.POST}')
            
            fname = request.POST['fname']
            lname = request.POST['lname']
            username = request.POST['username']
            gender = request.POST['gender']
            email = request.POST['email']
            password = request.POST['password']
            
            logger.info(f'Extracted data: fname={fname}, lname={lname}, username={username}, gender={gender}, email={email}, password={password}')
            
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
            logger.error(f'Missing field: {str(e)}')
            return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
        except Exception as e:
            logger.error(f'Unexpected error: {str(e)}')
            return JsonResponse({'error': 'An unexpected error occurred. Please try again later.'}, status=500)
    else:
        # Render the form template for GET requests
        return render(request, 'signup.html')
