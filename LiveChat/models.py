from django.db import models

# Create your models here.

'''
    1. Create Database Model(roomMember) to store user name,uid & channel name
    2. On join, create roomMember in database
    3. On handleUserJoin event, query database for room member name by uid 
    4. On leave, delete the roomMember
'''

class roomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    channel = models.CharField(max_length=200)

    def __str__(self) -> str:
        return self.user_name