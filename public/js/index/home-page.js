(function () {
    "use strict";
    var app;
    app = angular.module('home-page', ['highcharts-ng'])
        .controller('HomePageCtrl', function ($scope) {
            document.title = 'NFL Graphs';
            var colors = Highcharts.getOptions().colors;
            console.log(colors);
            $scope.chartConfig = {
                options: {
                    chart: {
                        type: 'pie'
                    },
                    tooltip: {
                        /*headerFormat: '',
                        pointFormat: '<span>{point.name}</span>:<br/>' +
                        '<br/><div ng-repeat="play in point.plays">{play}</div>',*/
                        formatter: function() {
                            var result = '<span style="font-weight:bold">' + this.point.name + '</span>:<br/>';
                            angular.forEach(this.point.plays, function (play) {
                                result += '<br/><div>' + play + '</div>'
                            });
                            return result;
                        }
                    },
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: true,
                                format: '{point.name}: {point.y:.1f}%'
                            }
                        }
                    }
                },
                title: {
                    text: 'Detroit Lions'
                },
                series: [{
                     name: "Players",
                     size: '100%',
                     colorByPoint: true,
                     data: [
                         {
                            name: "Calvin Johnson",
                            y: 48.7,
                            color: '#005A8B',
                             plays: [
                                 '36 yard catch',
                                 '15 yard catch',
                                 '10 yard catch'
                             ]
                        },
                        {
                            name: "Golden Tate III",
                            y: 29.2,
                            color: '#005A8B',
                            plays: [
                                '36 yard catch',
                                '15 yard catch',
                                '10 yard catch'
                            ]
                        },
                        {
                            name: "Ameer Abdullah",
                            y: 8.4,
                            color: '#B0B7BC',
                             plays: [
                                 '36 yard catch',
                                 '15 yard catch',
                                 '10 yard catch'
                             ]
                        },
                        {
                            name: "Joquie Bell",
                            y: 13.7,
                            color: '#B0B7BC',
                             plays: [
                                 '36 yard catch',
                                 '15 yard catch',
                                 '10 yard catch'
                             ]
                        }
                     ]
                 }]
            };
        });
}());
