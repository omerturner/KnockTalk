myApp.controller('UserController',
  ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', '$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, $routeParams, FIREBASE_URL) {

    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);

    auth.$onAuth(function(authUser) {
      if (authUser) {
        $scope.whichuser = $routeParams.uId;

        var userRef = new Firebase(FIREBASE_URL + '/users/' + $scope.whichuser);
        var user = $firebaseObject(userRef);
        $scope.user = user;

        var talksRef = new Firebase(FIREBASE_URL + '/talks');
        var talksInfo = $firebaseArray(talksRef);
        $scope.talks = talksInfo;

        var userTalksRef = new Firebase(FIREBASE_URL + 'users/' + $scope.whichuser + '/talks');
        var userTalks = $firebaseArray(userTalksRef);
        $scope.userTalks = userTalks;

        $scope.allowEditUser = function() {
          return $scope.whichuser == $rootScope.currentUser.$id;
        };

        if ($scope.allowEditUser()) {
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

          $scope.allowEditTalk = function(talk) {
            if (talk.createdBy == $rootScope.currentUser.$id) {
              return true;
            }
            return false;
          };

          $scope.deleteTalk = function(key) {
            userTalks.$remove(key).then(function() {
              talksInfo.$remove(key);
            }); // Delete talk from global talks
          }; // Delete talk from user talks

        } // If allow edit
       }// User Authenticated
    }); // on Auth
}]); //Controller