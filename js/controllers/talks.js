myApp.controller('TalksController',
  ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL) {

    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);

    auth.$onAuth(function(authUser) {
      if (authUser) {
        var talksRef = new Firebase(FIREBASE_URL + '/talks');
        var talksInfo = $firebaseArray(talksRef);
        $scope.talks = talksInfo;

        var userTalksRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/talks');
        var userTalks = $firebaseArray(userTalksRef);
        $scope.userTalks = userTalks;

        talksInfo.$loaded().then(function(data) {
          $rootScope.howManytalks = userTalks.length;
        }); //Make sure talk data is loaded

        talksInfo.$watch(function(data) {
          $rootScope.howManyTalks = userTalks.length;
        });

        $scope.addTalk = function() {
          var currDate = Firebase.ServerValue.TIMESTAMP;
          talksInfo.$add({
            createdBy: $rootScope.currentUser.$id,
            name: $scope.talkName,
            date: currDate
          }).then(function(talk) {
            var userTalkRef = new Firebase(FIREBASE_URL + 'users/' +
                                          $rootScope.currentUser.$id + '/talks/' + talk.key());
            var userTalk = $firebaseObject(userTalkRef);
            userTalk.name = $scope.talkName;
            userTalk.date = currDate;
            userTalk.$save().then(function() {
              $scope.talkName='';
            }); //user promise
          }); //talks promise
        }; // addTalk

        $scope.deleteTalk = function(key) {
          userTalks.$remove(key).then(function() {
            talksInfo.$remove(key);
          }); // Delete talk from global talks
        }; // Delete talk from user talks

      } // User Authenticated
    }); // on Auth
}]); //Controller