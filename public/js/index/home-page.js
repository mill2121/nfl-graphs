(function () {
    "use strict";
    var app;
    app = angular.module('home-page', ['highcharts-ng', 'ui.bootstrap'])
        .controller('HomePageCtrl', function ($scope, $http) {
            document.title = 'NFL Graphs';
            $scope.currentTab = 'offense';
            $scope.driveFilter = 'all';

            $scope.$watch('playerData', function (playerData) {
                if (playerData) {
                    $scope.teams = $scope.formatPlayerDataIntoTeamData(playerData);
                    $scope.chartConfigs = [];
                    angular.forEach($scope.teams, function (teamData) {
                        $scope.chartConfigs.push($scope.formatChartConfig(teamData));
                    });
                }
            });

            $scope.$watch('gameData', function (gameData) {
                if (gameData) {
                    $scope.gaugeConfigs = [];
                    angular.forEach(gameData, function (game) {
                        $scope.gaugeConfigs.push($scope.formatGaugeConfig(game));
                    });
                }
            });

            $scope.$watch('playData', function (playData) {
                if (playData) {
                    var formattedPlayData = $scope.formatPlayData(playData);
                    $scope.fieldPossessionConfigs = [];
                    angular.forEach(formattedPlayData, function (formattedPlayRow) {
                        $scope.fieldPossessionConfigs.push($scope.formatFieldPossessionConfig(formattedPlayRow));
                    });
                }
            });

            $scope.initialLoad = function () {
                $scope.loadingPlayData = true;
                $http.post("application/index/get-play-data").success(function (data) {
                    $scope.loadingPlayData = false;
                    $scope.playData = data.playData;
                });
            };
            $scope.initialLoad();

            $scope.convertHex = function (hex,opacity){
                hex = hex.replace('#','');
                var r = parseInt(hex.substring(0,2), 16),
                g = parseInt(hex.substring(2,4), 16),
                b = parseInt(hex.substring(4,6), 16);
                return 'rgba('+r+','+g+','+b+','+opacity/100+')';
            };


            /**
             * Format the play by play data in groups so it can be used by highcharts
             * @param playData
             */
            $scope.formatPlayData = function (playData) {
                var gsisId = playData[0]['gsis_id'], firstTeam, secondTeam, formattedPlayData = [],
                    firstTeamData = [], secondTeamData = [], firstTeamColors, secondTeamColors;
                angular.forEach(playData, function (play, key) {
                    if (gsisId != play['gsis_id']) {
                        gsisId = play['gsis_id'];
                        formattedPlayData.push([
                            {
                                name: firstTeam['name'],
                                label: firstTeam['label'],
                                data: firstTeamData,
                                //fillColor: $scope.convertHex(firstTeamColors['primary'],75),
                                color: firstTeamColors['primary'],
                                threshold: -30
                            },
                            {
                                name: secondTeam['name'],
                                label: secondTeam['label'],
                                data: secondTeamData,
                                //fillColor: $scope.convertHex(secondTeamColors['primary'],75),
                                color: secondTeamColors['primary'],
                                threshold: -30
                            }
                        ]);
                        firstTeam = null;
                        secondTeam = null;
                        firstTeamData = [];
                        secondTeamData = [];
                    }
                    if (!firstTeam) {
                        firstTeam = {
                            name: play['pos_team'],
                            label: play['pos_label']
                        };
                        firstTeamColors = {
                            primary: play['primary_color'],
                            secondary: play['secondary_color']
                        };
                    }
                    if (firstTeam['name'] == play['pos_team']) {
                        firstTeamData.push($scope.getRelevantPlayData(play));
                        secondTeamData.push($scope.getNullPoint(play.time_seconds));
                    } else {
                        if (!secondTeam) {
                            secondTeam = {
                                name: play['pos_team'],
                                label: play['pos_label']
                            };
                            secondTeamColors = {
                                primary: play['primary_color'],
                                secondary: play['secondary_color']
                            };
                        }
                        secondTeamData.push($scope.getRelevantPlayData(play));
                        firstTeamData.push($scope.getNullPoint(play.time_seconds));
                    }
                });
                return formattedPlayData;
            };

            $scope.getNullPoint = function (time) {
                return {
                    time: null,
                    x: time,
                    y: null,
                    name: 'N/A'
                }
            };

            $scope.getRelevantPlayData = function (play)
            {
                var playData = {
                    time: play.time,
                    x: play.time_seconds,
                    y: play.yardline,
                    name: play.description
                    //marker: {symbol:'circle',radius:5}
                };
                if (play.scored) {
                    playData.marker = {
                        enabled: true,
                        radius: 5,
                        symbol:'circle'
                    }
                } else if (play.turnover) {
                    playData.marker = {
                        enabled: true,
                        radius:6,
                        symbol:'diamond'
                    }
                }
                return playData;
            };

            /**
             * Pass in the yard integer (-50 to 50) and receive the text label associated with it
             * @param yardInt
             * @returns {*}
             */
            $scope.formatYardLine = function (yardInt) {
                if (yardInt === 50) {
                    return 'End Zone';
                } else if (yardInt === -50) {
                    return 'Safety';
                } else if (yardInt > 0) {
                    return 'OPP ' + (50 - yardInt);
                } else if (yardInt < 0) {
                    return 'OWN ' + (50 - (yardInt * -1))
                }
                return 50;
            };

            /**
             * Formats the player data, row by row, and groups it into team data.
             * @param playerData
             * @returns {Array}
             */
            $scope.formatPlayerDataIntoTeamData = function (playerData) {
                var currentTeam, borderColor, score, rushingYds, receivingYds, teamData = [], teams = [], otherData;
                angular.forEach(playerData, function (player, key) {
                    if (player['team'] != currentTeam) {
                        if (currentTeam) {
                            teams.push({
                                team: currentTeam,
                                score: score,
                                borderColor: borderColor,
                                rushingYds: rushingYds,
                                receivingYds: receivingYds,
                                playerData: $scope.formatTeamDataIntoGraphPoints(teamData, otherData)
                            });
                            teamData = [];
                        }
                        otherData = null;
                        rushingYds = 0;
                        receivingYds = 0;
                        currentTeam = player['team'];
                        score = player['score'];
                        borderColor = player['border_color'];
                    }

                    if (player.play_type == 'RUSHING') {
                        rushingYds += player.yards;
                    } else if (player.play_type == 'RECEIVING') {
                        receivingYds += player.yards;
                    }

                    if (player.percentage > 3.0) {
                        teamData.push(player);
                    } else {
                        if (!otherData) {
                            otherData = player;
                            otherData.players = [];
                        }
                        otherData.players.push(player.full_name)
                    }
                });
                if (teamData && teamData.length > 0) {
                    teams.push({
                        team: currentTeam,
                        borderColor: borderColor,
                        rushingYds: rushingYds,
                        receivingYds: receivingYds,
                        score: score,
                        playerData: $scope.formatTeamDataIntoGraphPoints(teamData, otherData)
                    });
                }
                return teams;
            };

            /**
             * Get the individual player rows in the format used for highchart's points
             * @param teamData
             * @param otherData
             * @returns {Array}
             */
            $scope.formatTeamDataIntoGraphPoints = function (teamData, otherData) {
                var graphPoints = [];
                angular.forEach(teamData, function (playerRow, key) {
                    graphPoints.push({
                        name: playerRow['full_name'],
                        abbr_name: playerRow['abbr_name'],
                        y: parseFloat(playerRow['percentage']),
                        color: playerRow['color'],
                        stats: playerRow['stats']
                    });
                });
                if (otherData) {
                    graphPoints.push({
                        name: 'Other',
                        abbr_name: 'Other',
                        y: parseFloat(otherData['percentage']),
                        color: otherData['color'],
                        stats: otherData['players']
                    });
                }
                return graphPoints;
            };

            $scope.formatChartConfig = function (teamData) {
                var chartConfig = {
                    options: {
                        chart: {
                            type: 'pie',
                            backgroundColor:'transparent',
                            height:220,
                            style: {
                                color: 'black',
                                'overflow': 'visible'

                            }
                        },
                        tooltip: {
                            useHTML: true,
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            zIndex: 999999,
                            formatter: function() {
                                var result = '<span style="font-weight:bold">' + this.point.name + ' (' +
                                    this.point.y.toFixed(1) + '%)</span>:<br/>';
                                this.point.color = 'white';
                                if (this.point.stats instanceof Array) {
                                    angular.forEach(this.point.stats, function (stat) {
                                        result += '<div>' + stat + '</div>';
                                    });
                                } else {
                                    result += '<div>' + this.point.stats + '</div>';
                                }
                                return result;
                            },
                            style: {
                                'z-index': 9999999
                            }
                        },
                        plotOptions: {
                            pie: {
                                borderColor: teamData.borderColor,
                                dataLabels: {
                                    //distance: 40,
                                    enabled: true,
                                    style: {
                                        width: '100px',
                                        'word-break': 'break-all'
                                    },
                                    formatter: function() {
                                        if (this.percentage < 5) {
                                            return null;
                                        }
                                        return '<span style="color:black;text-shadow: none">'
                                            + this.point.abbr_name + ': ' + Math.round(this.point.y*10)/10 + '%</span>:<br/>';
                                    }
                                },
                                shadow: {
                                    //color: teamData.borderColor == '#FFFFFF' ? 'black' : 'white',
                                    color: 'gray',
                                    offsetX: 1,
                                    offsetY: 1,
                                    width: 5
                                },
                                // For shadow: color, offsetX, offsetY, opacity and width
                                innerSize: '40%'
                            }
                        }
                    },
                    title: {
                        useHTML: true,
                        text: teamData.team + "<div style='font-size:.6em;'>Rushing: " + teamData.rushingYds +
                            " yds - Receiving: " + teamData.receivingYds + " yds</div>",
                        style: {
                            color: 'black',
                            'text-align': 'center',
                            //'text-shadow': '2px 1px 0px rgba(0,0,0, .4)',
                            //'text-shadow': '-1px -1px 1px #000,1px -1px 1px #000,-1px 1px 0 #000,1px 1px 1px #000'
                        }
                    },
                    series: [{
                                 name: "Players",
                                 size: '100%',
                                 //size: 100,
                                 colorByPoint: true,
                                 style: {
                                     color: 'black'
                                 },
                                 data: teamData.playerData
                             }]
                };
                return chartConfig;
            };

            $scope.formatGaugeConfig = function (gameData) {
                var gaugeConfig = {
                    options: {
                        chart: {
                            type: 'gauge',
                            backgroundColor:'transparent',
                            height:240,
                            style: {
                                color: 'black',
                                'overflow': 'visible'

                            },
                            spacingTop: 0,
                            spacingLeft: 0,
                            spacingRight: 0,
                            spacingBottom: 0
                        },
                        plotOptions: {
                            dial: {
                                baseLength: '0%',
                                baseWidth: 10,
                                radius: '100%',
                                rearLength: '0%',
                                topWidth: 1
                            }
                        },
                        tooltip: {
                            enabled: false
                        },
                        pane: {
                            startAngle: -90,
                            endAngle: 90,
                            background: {
                                innerRadius: '40%',
                                outerRadius: '100%',
                                shape: 'arc'
                            }
                        },
                        title: {
                            useHTML: true,
                            text: "<img height='60px' src='" + gameData.logo_url + "'/>",
                            style: {
                                color: 'black',
                                margin: 'auto'
                                //'text-align': 'center'
                            }
                        },
                        xAxis: {
                            labels: {
                                formatter: function () {
                                    console.log(this);
                                }
                            }
                        },
                        yAxis: {
                            labels: {
                                distance: -20,
                                formatter: function () {
                                    if (this.value == 40) {
                                        return 'Red<br/>Zone';
                                    }
                                    return 50 - Math.abs(this.value);
                                }
                            },
                            tickPositions: [-30, 0, 40],
                            min: -50,
                            max: 50,
                            plotBands: [/*{
                                            from: -50,
                                            to: 30,
                                            color: '#FFFFFF', // green
                                            thickness: '100%'
                                        }, */{
                                            from: 30,
                                            to: 50,
                                            color: '#DF5353', // red
                                            thickness: '60%'
                                        }]
                        }
                        },
                        series: [{
                                     name: "Field Position",
                                     size: '100%',
                                     data: [$scope.formatFieldPosition(gameData.yardline)],
                                     dataLabels: {
                                         formatter: function () {
                                             var down = parseInt(gameData.down), suffix = $scope.getSuffix(down);
                                             return down + suffix + ' & ' + gameData.yards_to_go;
                                         }
                                     }
                                 }]
                };
                return gaugeConfig;
            };

            $scope.formatFieldPossessionConfig = function(playData) {
                playData.threshold = 50;
                var fieldPossessionConfig = {
                    options: {
                        chart: {
                            type: 'area',
                            backgroundColor:'transparent',
                            spacingBottom: 30
                        },
                        title: {
                            text: null
                        },
                        subtitle: {
                            text: null,
                            floating: true,
                            align: 'center',
                            verticalAlign: 'bottom',
                            y: 15
                        },
                        xAxis: {
                            lineColor: '#666666',
                            tickColor: '#666666',
                            tickPositions: [900, 1800, 2700, 3600],
                            labels: {
                                enabled: true,
                                formatter: function () {
                                    if (this.value == 900) {
                                        return '1st Quarter';
                                    } else if (this.value === 1800) {
                                        return '2nd Quarter'
                                    } else if (this.value === 2700) {
                                        return '3rd Quarter'
                                    } else if (this.value === 3600) {
                                        return '4th Quarter'
                                    }
                                    return null;
                                }
                            }
                        },
                        yAxis: {
                            gridLineColor: '#666666',
                            title: {
                                text: 'Yardline'
                            },
                            min: -50,
                            max: 50,
                            endOnTick:false,
                            labels: {
                                formatter: function () {
                                    return $scope.formatYardLine(this.value);
                                }
                            }
                        },
                        tooltip: {
                            formatter: function () {
                                console.log(this);
                                return '<b>' + this.series.name + ' @ ' + $scope.formatYardLine(this.y) + '</b><br/>' +
                                    '<br/>' + this.point.name;
                            }
                        },
                        legend: {
                            labelFormatter: function () {
                                return this.userOptions.label;
                            }
                        },
                        plotOptions: {
                            area: {
                                fillOpacity: 0.5
                            }
                        },
                        credits: {
                            enabled: false
                        }
                    },
                    series: playData
                };
                return fieldPossessionConfig;
            };

            $scope.formatFieldPosition = function (yardLine) {
                var formattedYardLine = yardLine.replace("(", "");
                formattedYardLine = formattedYardLine.replace(")", "");
                formattedYardLine = parseInt(formattedYardLine);
                return formattedYardLine;
            };

            $scope.getSuffix = function (down) {
                var suffix = 'th';
                if (down == 1) {
                    suffix = 'st';
                } else if (down == 2) {
                    suffix = 'nd';
                } else if (down == 3) {
                    suffix = 'rd';
                }
                return suffix;
            };

            $scope.toHHMMSS = function (seconds) {
                var sec_num = parseInt(seconds, 10); // don't forget the second param
                var hours   = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (hours   < 10) {hours   = "0"+hours;}
                if (minutes < 10) {minutes = "0"+minutes;}
                if (seconds < 10) {seconds = "0"+seconds;}
                var time    = minutes+':'+seconds;
                return time;
            };

            $scope.getQuarterTime = function (time, abbr) {
                if (time) {
                    var secondsLeft = parseInt(time.substring(time.indexOf(",") + 1, time.length - 1)),
                        playClock = $scope.toHHMMSS(900 - secondsLeft);
                    if (time === '(Final,0)') {
                        return 'Final';
                    } else if (time === '(Half,0)') {
                        return 'Halftime';
                    } else if (time.substr(0, 3) === '(OT') {
                        return 'Overtime ' + playClock;
                    }
                    var quarter = parseInt(time.substr(time.indexOf(",") - 1, 1)), suffix = $scope.getSuffix(quarter);

                    if (abbr) {
                        return 'Q' + quarter + ' ' + playClock;
                    }
                    return quarter + suffix + ' Quarter ' + playClock;
                }
                return '';
            };
        });
}());
