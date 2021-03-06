'use strict';

/**
 * @ngdoc function
 * @name startupWeekApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the startupWeekApp
 */
angular.module('startupWeekApp')
  .controller('MainCtrl', function ($scope, Restangular, moment) {
	$scope.description = 'A week of hacking, designing, networking, and learning with the best and brightest in NYC tech.';
	$scope.about = 'Tech@NYU’s weeklong conference celebrating entrepreneurship, tech, and design is here!  Startup Week is dedicated to introducing students to the NYC tech scene. We host a series of talks and workshops that span a wide range of topics and are led by the best and brightest in the industry. Make sure to subscribe to our newsletter to get all the latest news and updates.';
	var dow = ['Monday, November 13th', 'Tuesday, November 14th', 'Wednesday, November 15th', 'Thursday, November 16th', 'Friday, November 17th', 'Saturday, November 18th'];
	$scope.days = {};
	$scope.prevSponsorsImg = [
        {
            href: 'https://hioscar.com',
            title: 'Oscar',
            src: '../images/logos/oscar.jpg',
            alt: 'Oscar'
        },
        {
            href: 'http://roughdraft.vc/',
            title: 'Rough Draft Ventures',
            src: '../images/logos/rdv.png',
            alt: 'Rough Draft Ventures'
        },
        {
           href: 'https://giphy.com/',
           title: 'Giphy',
           src: '../images/logos/giphy.png',
           alt: 'Giphy'
        },
        {
           href: 'https://www.codecademy.com',
           title: 'Codecademy',
           src: '../images/logos/codecademy.png',
           alt: 'Codecademy'
        },
        {
           href: 'https://dev.to/',
           title: 'The Practical Developer',
           src: '../images/logos/dev.jpg',
           alt: 'The Practical Developer'
        },
        {
          href: 'https://www.meetup.com/',
          title: 'Meetup',
          src: '../images/logos/meetup.png',
          alt: 'Meetup'
        },
        {
           href: 'http://generalcatalyst.com/',
           title: 'General Catalyst',
           src: '../images/logos/generalcatalyst.png',
           alt: 'General Catalyst'
        },
        {
           href: 'https://www.ideo.com/',
           title: 'IDEO',
           src: '../images/logos/IDEO.png',
           alt: 'IDEO'
        },
        {
           href: 'http://www.newinc.org/',
           title: 'New Inc',
           src: '../images/logos/newinc.png',
           alt: 'New Inc'
        },
        {
           href: 'https://www.microsoft.com/',
           title: 'Microsoft',
           src: '../images/logos/microsoft.png',
           alt: 'Microsoft'
        }
        ];
        $scope.socialMedia = [
        	{
            href: 'https://www.facebook.com/TechatNYU/',
            title: 'Facebook',
            src: '../images/icons/facebook.png',
            alt: 'Facebook'
          },
          {
            href: 'https://twitter.com/TechatNYU',
            title: 'Twitter',
            src: '../images/icons/twitter.png',
            alt: 'Twitter'
          }
        ];
	Restangular.one('events?filter[simple][teams]=5440609d6b0287336dfc51cf&sort=startDateTime&include=presenters,venue')
 	.get()
		.then(function(data) {
        	var swFl2017 = data.data.filter(function(event) {
        		var now = moment();
        		var theEvent = moment(event.attributes.startDateTime);
        		var springMonth = 10; //november month - index 0
                var isPast = theEvent.isAfter(now) ? false: true;
        		return ((theEvent.year() === now.year()) && (theEvent.month() === springMonth) && !isPast);
        	});
            var additionalData = data.included;
            var l = additionalData.length;
            var venues = {};
            var thePresenters = {};
            var presenterID, orgID, twitter;

            function assign(presenterID, orgID) {
                Restangular.one('organizations/' + orgID + '/')
                  .get()
                  .then(function(data) {
                    var employerData;
                    if (data) {
                        var info = data.data.attributes;
                        var employer = info.name;
                        var employerUrl = info.url;
                        employerData = {
                            name: employer,
                            url: employerUrl
                        };
                    }
                    thePresenters[presenterID].currentEmployer = employerData;
                 });
            }
            for (var m = 0; m < l; m++) {
                if (additionalData[m].type === 'presenters') {
                    orgID = additionalData[m].relationships.currentEmployer.data;
                    orgID = orgID ? orgID.id : '';
                    twitter = additionalData[m].attributes.contact;
                    twitter = twitter ? twitter.twitter : '';
                    twitter = "https://twitter.com/" + twitter;

                    thePresenters[additionalData[m].id] = {
                        name: additionalData[m].attributes.name,
                        url: additionalData[m].attributes.url,
                        orgID: orgID,
                        twitter:twitter
                    };
                    presenterID = additionalData[m].id;
                    console.log("twitter: " , thePresenters[presenterID].twitter);
                    if (orgID) {
                        thePresenters[presenterID].currentEmployer = assign(presenterID, orgID);
                    }
                }
                else if (additionalData[m].type === 'venues') {
                    venues[additionalData[m].id] = {
                        name: additionalData[m].attributes.name,
                        address: 'http://maps.google.com/?q=' + additionalData[m].attributes.address,
                    };
                }
            }
        	for (var i = 0; i < swFl2017.length; i++) {
                var current = swFl2017[i];
        		var timing = moment(current.attributes.startDateTime);
        		var details = current.attributes;
    			var title = details.title;
    			var description = details.description;
                var url = details.rsvpUrl;
                var time = timing.format('HH:mm') + ' - ' + moment(details.endDateTime).format('HH:mm');
                var speakers = [];
                var presenters = current.relationships.presenters.data;
                if (presenters) {
                    for (var j = 0; j < presenters.length; j++) {
                        if (presenters[j]) {
                            // console.log("presenter info: " , presenters[j]);
                            speakers.push(thePresenters[presenters[j].id]);
                        }
                    }
                }
                var locationDetails = current.relationships.venue.data ? venues[current.relationships.venue.data.id]: '';
                var theEvent = {
                    'title': title,
                    'url': url,
                    'description': description,
                    'time': time,
                    'speakers': speakers,
                    'location': locationDetails
                };
        		if (timing.isoWeekday() === 1) {
        			if (!($scope.days[dow[0]])) {
        				$scope.days[dow[0]] = [];
        			}
        			$scope.days[dow[0]].push(theEvent);
        		}
        		else if (timing.isoWeekday() === 2) {
        			if (!($scope.days[dow[1]])) {
        				$scope.days[dow[1]] = [];
        			}
        			$scope.days[dow[1]].push(theEvent);
        		}
        		else if (timing.isoWeekday() === 3) {
        			if (!($scope.days[dow[2]])) {
        				$scope.days[dow[2]] = [];
        			}
        			$scope.days[dow[2]].push(theEvent);
        		}
        		else if (timing.isoWeekday() === 4) {
        			if (!($scope.days[dow[3]])) {
        				$scope.days[dow[3]] = [];
        			}
        			$scope.days[dow[3]].push(theEvent);
        		}
        		else if (timing.isoWeekday() === 5) {
        			if (!($scope.days[dow[4]])) {
        				$scope.days[dow[4]] = [];
        			}
        			$scope.days[dow[4]].push(theEvent);
        		}
                else if (timing.isoWeekday() === 6) {
                    if (!($scope.days[dow[5]])) {
                        $scope.days[dow[5]] = [];
                    }
                    $scope.days[dow[5]].push(theEvent);
                }
        	}
        });
});
