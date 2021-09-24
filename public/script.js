const socket = io("/");
const videoGrid = document.getElementById("video-chat");
const time = document.getElementById("time");

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
let videoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};

// GET THE USER WEBCAM
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    videoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // IF USER CONNECTED THEN CREATE ANOTHER VIDEO ELEMENT TO THE SCREEN AND SHARE STREAM
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    let userMessage = $("#chat_message");

    $("html").keydown(function (e) {
      // ENTER askew code = 13
      if (e.which == 13 && userMessage.val().length !== 0) {
        socket.emit("message", userMessage.val());
        userMessage.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  socket.emit("join-room", roomId, id);
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

const scrollToBottom = () => {
  var d = $(".allChats");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = videoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    videoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  let enabled = videoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    videoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const content = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".muteBTN").innerHTML = content;
};

const setUnmuteButton = () => {
  const content = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".muteBTN").innerHTML = content;
};

const setStopVideo = () => {
  const content = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".videoBTN").innerHTML = content;
};

const setPlayVideo = () => {
  const content = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".videoBTN").innerHTML = content;
};

let [seconds, minutes, hours] = [0, 0, 0];
setInterval(() => {
  seconds++;
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  if (minutes === 60) {
    minutes = 0;
    hours++;
  }
  let h = hours >= 10 ? hours : "0" + hours;
  let m = minutes >= 10 ? minutes : "0" + minutes;
  let s = seconds >= 10 ? seconds : "0" + seconds;
  time.innerHTML = ` ${h} : ${m} : ${s}  `;
}, 1000);

// TAKE SCREEN SHOT
const TakeScreenShot = () => {};
