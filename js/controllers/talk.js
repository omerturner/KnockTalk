myApp.controller('TalkController',
  ['$scope', '$rootScope', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

    $scope.whichtalk = $routeParams.tId;

    var talkRef = new Firebase(FIREBASE_URL + '/talks/' + $scope.whichtalk);
    $scope.talk = $firebaseObject(talkRef);

    var ref = new Firebase(FIREBASE_URL + '/talks/' +
      $scope.whichtalk + '/opinions');

    var opinions = $firebaseArray(ref);
    $scope.opinions = opinions;

    $scope.order = "createdAt";
    $scope.direction = null;
    $scope.query = '';
    $scope.recordId='';

    $scope.addOpinion = function() {
      var currDate = Firebase.ServerValue.TIMESTAMP;
      var relatedTalk = {
        tid: $scope.whichtalk,
        talkName: $scope.talk.name
      };
      var createdBy = {
        uid: $rootScope.currentUser.$id,
        username: $rootScope.currentUser.firstname + ' ' + $rootScope.currentUser.lastname
      }
      var opinionsRef = new Firebase(FIREBASE_URL + '/opinions/');
      var globalOpinions = $firebaseArray(opinionsRef);
      var globalOpinion = {
        title: $scope.user.opinionTitle,
        text: $scope.user.opinionText,
        relatedTalk: relatedTalk,
        createdBy: createdBy,
        createdAt: currDate
      }; //data

      globalOpinions.$add(globalOpinion).then(function(opinion) {
        var talkOpinionRef = new Firebase(FIREBASE_URL + '/talks/' + $scope.whichtalk +
                                                                                              '/opinions/' + opinion.key());
        var talkOpinion = $firebaseObject(talkOpinionRef);
        talkOpinion.title = $scope.user.opinionTitle;
        talkOpinion.text = $scope.user.opinionText;
        talkOpinion.createdBy = createdBy;
        talkOpinion.createdAt = currDate;
        talkOpinion.$save(talkOpinion).then(function(opinion) {
            var userOpinionRef = new Firebase(FIREBASE_URL + 'users/' +
                                          $rootScope.currentUser.$id + '/opinions/' + opinion.key());
            var userOpinion = $firebaseObject(userOpinionRef);
            userOpinion.relatedTalk = relatedTalk;
            userOpinion.title = $scope.user.opinionTitle;
            userOpinion.text = $scope.user.opinionText;
            userOpinion.createdAt = currDate;
            userOpinion.$save().then(function(opinion) {
              $scope.user.opinionTitle = "";
              $scope.user.opinionText = "";
            }); // User opinions promise
          }); // Talk opinions promise
      }); // Global opinions promis
    }; //Add Opinion

    $scope.howManyOpinionVotes = function(opinion, type) {
      var numOfVotes = 0;
      angular.forEach(opinion[type], function(vote) {
            numOfVotes++;
      });
      return numOfVotes;
    };

    $scope.allowEditOpinion = function (opinion) {
      return ((opinion.createdBy.uid == $rootScope.currentUser.$id) ||
        ($scope.talk.createdBy.uid == $rootScope.currentUser.$id));
    };

    $scope.vote = function(opinionId, type) {
      // valitade input and getting the oposite type
      var oppositeType;
      if (type == 'ups') {
        oppositeType = 'downs';
      } else if (type == 'downs'){
        oppositeType = 'ups';
      } else {
        return;
      }

      // refering the vote
      var refVoter = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId + '/' + type + '/' + $rootScope.currentUser.$id);
      var voter = $firebaseObject(refVoter);

      // undo vote if already voted
      var currentOpinion = $scope.opinions.filter(function( obj ) {
        return obj.$id == opinionId;
      });
      if ($scope.isVoted(currentOpinion[0][type])) {
        voter.$remove($rootScope.currentUser.$id);
        return;
      }

      // remove vote from oposite type
      var oppositeRef = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId + '/' + oppositeType + '/' + $rootScope.currentUser.$id);
      var opposite = $firebaseObject(oppositeRef);
      opposite.$remove($rootScope.currentUser.$id);

      // prepare vote object and save
      voter.username = $rootScope.currentUser.firstname + ' ' + $rootScope.currentUser.lastname;
      voter.createdAt = Firebase.ServerValue.TIMESTAMP;
      voter.$save();
    };//vote

    $scope.isVoted = function(votesArray) {
      if (votesArray) {
        return $rootScope.currentUser.$id in votesArray;
      } else {
        return false;
      }
    };

    $scope.deleteOpinion = function(key) {
      var globalOpinionRef = new Firebase(FIREBASE_URL + '/opinions/' + key);
      var globalOpinion = $firebaseObject(globalOpinionRef);
      globalOpinion.$remove().then(function() {
        var talkOpinionRef = new Firebase(FIREBASE_URL + '/talks/' + $scope.whichtalk + '/opinions/'  + key);
        var talkOpinion = $firebaseObject(talkOpinionRef);
        talkOpinion.$remove().then(function() {
          var userOpinionRef = new Firebase(FIREBASE_URL + 'users/' +
                                               $rootScope.currentUser.$id + '/opinions/' + key);
          var userOpinion = $firebaseObject(userOpinionRef);
          userOpinion.$remove();
        }); // Remove from global opinions
      }); // Remove from talk opinions
    }; // Remove from user opinions


    $scope.showReply = function(myOpinion) {
      myOpinion.show = !myOpinion.show;

      if (myOpinion.userState == 'expanded') {
        myOpinion.userState = '';
      } else {
        myOpinion.userState = 'expanded';
      }
    }; // show love

    $scope.addReply = function(opinion, replyText) {
      var refReply = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinion.$id +
        '/replies');
      var repliesArray = $firebaseArray(refReply);

      var data = {
        createdBy: {
          uid: $rootScope.currentUser.$id,
          username: $rootScope.currentUser.firstname + ' ' + $rootScope.currentUser.lastname
        },
        text: replyText,
        createdAt: Firebase.ServerValue.TIMESTAMP
      }; //data
      repliesArray.$add(data).then(function() {
      });
    }; //giveReply

    $scope.allowEditReply = function (reply) {
      return ((reply.createdBy.uid == $rootScope.currentUser.$id) ||
        ($scope.talk.createdBy.uid == $rootScope.currentUser.$id));
    };

    $scope.deleteReply = function(opinionId, replyid) {
      var refReply = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId +
        '/replies/' + replyid);
      var reply = $firebaseObject(refReply);
      reply.$remove();
    }; //deleteReply

}]); //Controller