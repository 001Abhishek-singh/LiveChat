const AppId = '81bea77086b24875933f84012586867e';
const ChannelName = sessionStorage.getItem('channel');
const TokenId = sessionStorage.getItem('token');
let UID = Number(sessionStorage.getItem('UID')); 

let ClientUserName = sessionStorage.getItem('Clientname');

const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})

let localTracks = [];
let remoteUsers = {};

// main function to regulate everything when video calling occur
let joinAndDisplayLocalStream = async() => {
    document.getElementById('room-name').innerText = ChannelName;

    client.on('user-published',handleUserJoined);
    client.on('user-left',handleUserLeft);

    try{
        await client.join(AppId,ChannelName,TokenId,UID);
    }
    catch(error){
        console.error(error);
        window.open('/','_self');
    }
    
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    
    let member = await createMember();

    let players = `<div class="video-container" id="video-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">${member.name} </span></div>
                    <div class="video-player" id="user-${UID}"></div>
                    </div>`;
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',players);

    localTracks[1].play(`user-${UID}`);
    await client.publish([localTracks[0], localTracks[1]]);
}

// to join the user in a meeting from another window or tab 
let handleUserJoined = async (user,mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user,mediaType);
    if(mediaType === 'video'){
        let player = document.getElementById(`video-container-${user.uid}`);
        if(player != null){
            player.remove();
        }

        let member = await getMember(user)

        let players = `<div class="video-container" id="video-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">${member.name} </span></div>
                    <div class="video-player" id="user-${user.uid}"></div>
                    </div>`;
        document.getElementById('video-streams').insertAdjacentHTML('beforeend',players);
        user.videoTrack.play(`user-${user.uid}`);
    }
    if(mediaType === 'audio'){
        user.audioTrack.play();
    }
}

// to remove the user from the meeting when they will join from another computer or tab
let handleUserLeft = async(user) => {
    delete remoteUsers[user.uid];
    document.getElementById(`video-container-${user.uid}`).remove();
}

// to leave the meeting
let leaveAndRemoveLocalStream = async() => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop();
        localTracks[i].close();
    }
    await client.leave();
    deleteMember()
    window.open('/','_self');
}
document.getElementById('stop-btn').addEventListener('click',leaveAndRemoveLocalStream);

// to mute the voice whenever user want to shut-down his/her voice
let toggleAudio = async(event) =>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false); // if camera ON then
        event.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[0].setMuted(true); // if camera OFF then
        event.target.style.backgroundColor = '#f23030'
    }
}
document.getElementById('audio-btn').addEventListener('click',toggleAudio);

// to close the camera so that they can maintain the privacy as well 
let toggleCamera = async(event) =>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false); // if camera ON then
        event.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[1].setMuted(true); // if camera OFF then
        event.target.style.backgroundColor = '#f23030'
    }
}
document.getElementById('video-btn').addEventListener('click',toggleCamera);

// to display the specific user name in each meeting
let createMember = async() =>{
    let response = await fetch('/create_member/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':ClientUserName,'user_channel':ChannelName,'uid':UID})
    })
    let member = await response.json()
    return member
}

// to get the user name when they will join the meeting
let getMember = async (user) =>{
    let response = await fetch(`/get_member/?UID=${user.uid}&channel_room=${ChannelName}`)
    let member = await response.json()
    return member
}

// to delete the specific user in respective meeting
let deleteMember = async() =>{
    let response = await fetch('/delete_member/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':ClientUserName,'user_channel':ChannelName,'uid':UID})
    })
    let member = await response.json()
}

joinAndDisplayLocalStream()

window.addEventListener('beforeunload',deleteMember)
