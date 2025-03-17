from django.db import models

# Create your models here.

class User(models.Model):
    fname = models.CharField(max_length=50)
    lname = models.CharField(max_length=50)
    username = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=30)

    def __str__(self):
        return self.fname
