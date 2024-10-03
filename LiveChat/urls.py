from LiveChat.views import room,meeting,getToken,createUser,getMember,deleteUser
from django.urls import path

urlpatterns = [
    path('',room,name='room'),
    path('meeting/',meeting,name='meeting'),
    path('get_token/',getToken,name='getToken'),
    path('create_member/',createUser,name='createUser'),
    path('get_member/',getMember,name='getMember'),
    path('delete_member/',deleteUser,name='deleteUser'),
]
