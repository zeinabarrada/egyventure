from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db.utils import DatabaseError
import logging
from .models import User

# Set up logging
logger = logging.getLogger(__name__)

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        try:
            # Log the incoming request data
            logger.info(f'Incoming request data: {request.POST}')

            # Get form data from the request
            fname = request.POST['fname']
            lname = request.POST['lname']
            username = request.POST['username']
            gender = request.POST['gender']
            email = request.POST['email']
            password = request.POST['password']

            # Log the extracted data
            logger.info(f'Extracted data: fname={fname}, lname={lname}, username={username}, gender={gender}, email={email}, password={password}')

            # Create a new User instance
            user = User(
                fname=fname,
                lname=lname,
                username=username,
                gender=gender,
                email=email,
                password=password
            )
            # Save the user to MongoDB
            user.save()
            return JsonResponse({'message': 'User created successfully!', 'id': str(user.id)}, status=201)
        except KeyError as e:
            logger.error(f'Missing field: {str(e)}')
            return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
        except ValidationError as e:
            logger.error(f'Validation error: {str(e)}')
            return JsonResponse({'error': str(e)}, status=400)
        except DatabaseError as e:
            logger.error(f'Database error: {str(e)}')
            return JsonResponse({'error': 'A database error occurred. Please try again later.'}, status=500)
        except Exception as e:
            logger.error(f'Unexpected error: {str(e)}')
            return JsonResponse({'error': 'An unexpected error occurred. Please try again later.'}, status=500)
    else:
        # Render the form template for GET requests
        return render(request, 'signup.html')
