var webrtc = require('..');

var RTCPeerConnection     = webrtc.RTCPeerConnection;
var RTCSessionDescription = webrtc.RTCSessionDescription;
var RTCIceCandidate       = webrtc.RTCIceCandidate;

var pc1 = new RTCPeerConnection();
var pc2 = new RTCPeerConnection();

pc1.onicecandidate = function(candidate) {
  pc2.addIceCandidate(candidate.candidate);
}

pc2.onicecandidate = function(candidate) {
  pc1.addIceCandidate(candidate.candidate);
}

function handle_error(error)
{
  throw error;
}

var checks = 0;
var expected = 2;

function create_data_channels() {
  var dc1 = pc1.createDataChannel('test');
  dc1.onopen = function() {
    console.log("pc1: data channel open");
    if(++ checks == expected) {
      done();
    }
  }
  pc2.ondatachannel = function(event) {
    var dc2 = event.channel;
    dc2.onopen = function() {
      console.log("pc2: data channel open");
      if(++ checks == expected) {
        done();
      }
    };
  }

  create_offer();
}

function create_offer() {
  console.log('pc1: create offer');
  pc1.createOffer(set_pc1_local_description, handle_error);
}

function set_pc1_local_description(desc) {
  console.log('pc1: set local description');
  pc1.setLocalDescription(
    new RTCSessionDescription(desc),
    set_pc2_remote_description.bind(undefined, desc),
    handle_error
  );
}

function set_pc2_remote_description(desc) {
  console.log('pc2: set remote description');
  pc2.setRemoteDescription(
    new RTCSessionDescription(desc),
    create_answer,
    handle_error
  );
}

function create_answer() {
  console.log('pc2: create answer');
  pc2.createAnswer(
    set_pc2_local_description,
    handle_error
  );
}

function set_pc2_local_description(desc) {
  console.log('pc2: set local description');
  pc2.setLocalDescription(
    new RTCSessionDescription(desc),
    set_pc1_remote_description.bind(undefined, desc),
    handle_error
  );
}

function set_pc1_remote_description(desc) {
  console.log('pc1: set remote description');
  pc1.setRemoteDescription(
    new RTCSessionDescription(desc),
    wait,
    handle_error
  );
}

function wait() {
  console.log('waiting');
}

function run() {
  create_data_channels();
}

function done() {
  console.log('cleanup');
  pc1.close();
  pc2.close();
  console.log('done');
}

run();