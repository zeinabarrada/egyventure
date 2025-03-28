from django.db import models

# Create your models here.

class User(models.Model):
    fname = models.CharField(max_length=100)
    lname = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    gender = models.CharField(max_length=100)
    email = models.EmailField(max_length=200)
    password = models.CharField(max_length=100)
    interests = models.CharField(max_length=2000)

    def __str__(self):
        return self.fname
