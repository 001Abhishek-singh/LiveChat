from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
from django.shortcuts import render
import random
import time
import json
from LiveChat.models import roomMember
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
def getToken(request):
    appId = '81bea77086b24875933f84012586867e'
    appCertificate = '643d72a290e5423f9aac8380d7cb1dfa'
    channelName = request.GET.get('channel')
    uid = random.randint(1,230) 
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    token = RtcTokenBuilder.buildTokenWithUid(appId,appCertificate,channelName,uid,role,privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid},safe=False)
def room(request):
    return render(request,'room.html',{})

def meeting(request):
    return render(request,'meeting.html',{})

@csrf_exempt
def createUser(request):
    data = json.loads(request.body)
    member,created = roomMember.objects.get_or_create(
        name = data['name'],
        user = data['UID'],
        channel = data['channel']
    )
    return JsonResponse({'name':data['name']},safe=False)

def getMember(request):
    uid = request.GET.get('UID')
    user_channel = request.GET.get('user_channel')
    member = roomMember.objects.get(
        uid = uid,
        user_channel = user_channel,
    )
    name = member.name
    return JsonResponse({'name':name},safe=False)

@csrf_exempt
def deleteUser(request):
    data = json.loads(request.body)
    member = roomMember.objects.get(
        name = data['name'],
        uid = data['UID'],
        user_channel = data['channel'],
    )
    member.delete()
    return JsonResponse('Member was deleted',safe=False)
