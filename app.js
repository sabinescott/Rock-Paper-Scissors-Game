
  var config = {
    apiKey: "AIzaSyAFHCpWfSxri1yfyddE9OqkpIBDt4EZskY",
    authDomain: "rock-paper-scissors-43a95.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-43a95.firebaseio.com",
    storageBucket: "rock-paper-scissors-43a95.appspot.com"
  };
  
  firebase.initializeApp(config);

var directory = firebase.directory();
var aggregate = directory.ref("/gab");
var participantArchive = directory.ref("participants");
var presentSourceArchive = directory.ref("turn");
var profileID = "Guest";
var presentParticipants = null;
var presentSource = null;
var participantCount = false;
var participantOccurence1 = false;
var participantOccurence2 = false;
var participantAggregate1 = null;
var participantAggregate2 = null;


$("#start").click(function() {
  if ($("#profileID").val() !== "") {
    profileID = capitalize($("#profileID").val());
    enterGame();
  }
});


$("#profileID").keypress(function(e) {
  if (e.which === 13 && $("#profileID").val() !== "") {
    profileID = capitalize($("#profileID").val());
    enterGame();
  }
});


function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}


$("#gab-send").click(function() {
  if ($("#gab-input").val() !== "") {
    var message = $("#gab-input").val();

    aggregate.push({
      name: profileID,
      message: message,
      time: firebase.directory.ServerValue.TIMESTAMP,
      idNum: participantCount
    });

    $("#gab-input").val("");
  }
});



$("#gab-input").keypress(function(e) {
  if (e.which === 13 && $("#gab-input").val() !== "") {
    var message = $("#gab-input").val();

    aggregate.push({
      name: profileID,
      message: message,
      time: firebase.directory.ServerValue.TIMESTAMP,
      idNum: participantCount
    });

    $("#gab-input").val("");
  }
});


$(document).on("click", "li", function() {
  console.log("click");

 
  var clickChoice = $(this).text();
  console.log(participantArchive);

  
  participantRef.child("choice").set(clickChoice);

  
  $("#participant" + participantCount + " ul").empty();
  $("#participant" + participantCount + "picked").text(clickChoice);


  presentSourceArchive.transaction(function(turn) {
    return turn + 1;
  });
});


aggregate.orderByChild("time").on("child_added", function(snapshot) {
  $("#gab-messages").append(
    $("<p>").addClass("participant-" + snapshot.val().idNum),
    $("<span>").text(snapshot.val().name + ":" + snapshot.val().message)
  );

  
  $("#gab-messages").scrollTop($("#gab-messages")[0].scrollHeight);
});


participantArchive.on("value", function(snapshot) {
  
  presentParticipants = snapshot.numChildren();

 
  participantOccurence1 = snapshot.child("1").exists();
  participantOccurence2 = snapshot.child("2").exists();

  
  participantAggregate1 = snapshot.child("1").val();
  participantAggregate2 = snapshot.child("2").val();

 
  if (participantOccurence1) {
    $("#participant1-name").text(participantAggregate1.name);
    $("#participant1-wins").text("Wins: " + participantAggregate1.wins);
    $("#participant1-losses").text("Losses: " + participantAggregate1.losses);
  } else {
   
    $("#participant1-name").text("Waiting for Participant 1");
    $("#participant1-wins").empty();
    $("#participant1-losses").empty();
  }

 
  if (participantOccurence2) {
    $("#participant2-name").text(participantAggregate2.name);
    $("#participant2-wins").text("Wins: " + participantAggregate2.wins);
    $("#participant2-losses").text("Losses: " + participantAggregate2.losses);
  } else {
   
    $("#participant2-name").text("Waiting for Participant 2");
    $("#participant2-wins").empty();
    $("#participant2-losses").empty();
  }
});


presentSourceArchive.on("value", function(snapshot) {
 
  presentSource = snapshot.val();

  
  if (participantCount) {
    
    if (presentSource === 1) {
      
      if (presentSource === participantCount) {
        $("#present-source h2").text("It's Your Turn!");
        $("#participant" + participantCount + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
      } else {
        
        $("#present-source h2").text("Waiting for " + participantAggregate1.name + " to pick.");
      }

      
      $("#participant1").css("border", "2px solid green");
      $("#participant2").css("border", "1px solid blue");
    } else if (presentSource === 2) {
      
      if (presentSource === participantCount) {
        $("#current-turn").text("It's Your Turn!");
        $("#participant" + participantCount + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
      } else {
        
        $("#present-source").text("Waiting for " + participantAggregate2.name + " to pick.");
      }

      
      $("#participant2").css("border", "2px solid green");
      $("#participant1").css("border", "1px solid blue");
    } else if (presentSource === 3) {
      
      gameLogic(participantAggregate1.choice, participantAggregate2.choice);

      
      $("#participant1-picked").text(participantAggregate1.choice);
      $("#participant2-picked").text(participantAggregate2.choice);

      
      var moveOn = function() {
        $("#participant1-picked").empty();
        $("#participant2-picked").empty();
        $("#result").empty();

        
        if (participantOccurence1 && participantOccurence2) {
          presentSourceArchive.set(1);
        }
      };

   
      setTimeout(moveOn, 2000);
    } else {
     
      $("#participant1 ul").empty();
      $("#participant2 ul").empty();
      $("#present-source").html("<h2>Waiting for another participant to join the game....</h2>");
      $("#participant2").css("border", "1px solid blue");
      $("#participant1").css("border", "1px solid blue");
    }
  }
});


participantArchive.on("child_added", function(snapshot) {
  if (presentParticipants === 1) {
   
    presentSourceArchive.set(1);
  }
});


function enterGame() {

  var aggregateDisc = directory.ref("/gab/" + Date.now());

  if (presentParticipants < 2) {
    if (participantOccurence1) {
      participantCount = 2;
    } else {
      participantCount = 1;
    }

   
    particpantRef = directory.ref("/particpants/" + participantCount);

   
    particpantRef.set({
      name: profile,
      wins: 0,
      losses: 0,
      choice: null
    });

   
    participantRef.onDisconnect().remove();

  
    presentSourceArchive.onDisconnect().remove();

   
    aggregateDisc.onDisconnect().set({
      name: profileID,
      time: firebase.directory.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNum: 0
    });

    
    $("#swap-zone").empty();

    $("#swap-zone").append($("<h2>").text("Hi " + profileID + "! You are Participant " + participantCount));
  } else {
    
    alert("Sorry, room full!");
  }
}


function gameLogic(participant1choice, participant2choice) {
  var participant1Victory = function() {
    $("#result").text(participantAggregate1.name + " Wins!");
    if (participantCount === 1) {
      participantArchive
        .child("1")
        .child("wins")
        .set(participantAggregate1.wins + 1);
      participantArchive
        .child("2")
        .child("losses")
        .set(participantAggregate2.losses + 1);
    }
  };

  var participant2Victory = function() {
    $("#result").text(participantAggregate2.name + " Wins!");
    if (participantCount === 2) {
      participantArchive
        .child("2")
        .child("wins")
        .set(participantAggregate2.wins + 1);
      participantArchives
        .child("1")
        .child("losses")
        .set(participantAggregate1.losses + 1);
    }
  };

  var draw = function() {
    $("#result").text("It's a draw!");
  };

  if (participant1choice === "Rock" && participant2choice === "Rock") {
    draw();
  } else if (participant1choice === "Paper" && participant2choice === "Paper") {
    draw();
  } else if (participant1choice === "Scissors" && participant2choice === "Scissors") {
    draw();
  } else if (participant1choice === "Rock" && participant2choice === "Paper") {
    participant2Victory();
  } else if (participant1choice === "Rock" && participant2choice === "Scissors") {
    participant1Victory();
  } else if (participant1choice === "Paper" && participant2choice === "Rock") {
    participant1Victory();
  } else if (participant1choice === "Paper" && participant2choice === "Scissors") {
    participant2Victory();
  } else if (participant1choice === "Scissors" && participant2choice === "Rock") {
    participant2Victory();
  } else if (participant1choice === "Scissors" && participant2choice === "Paper") {
    participant1Victory();
  }
}
