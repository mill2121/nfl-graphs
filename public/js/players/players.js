(function () {
    "use strict";
    var app;
    app = angular.module('players', ['highcharts-ng'])
        .controller('PlayersCtrl', function ($scope) {
            document.title = 'Players List';
            $scope.chartConfig = {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Browser market shares. January, 2015 to May, 2015'
                },
                subtitle: {
                    text: 'Click the slices to view versions. Source: netmarketshare.com.'
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}: {point.y:.1f}%'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [{
                             name: "Brands",
                             colorByPoint: true,
                             data: [{
                                        name: "Microsoft Internet Explorer",
                                        y: 56.33,
                                        drilldown: "Microsoft Internet Explorer"
                                    }, {
                                        name: "Chrome",
                                        y: 24.03,
                                        drilldown: "Chrome"
                                    }, {
                                        name: "Firefox",
                                        y: 10.38,
                                        drilldown: "Firefox"
                                    }, {
                                        name: "Safari",
                                        y: 4.77,
                                        drilldown: "Safari"
                                    }, {
                                        name: "Opera",
                                        y: 0.91,
                                        drilldown: "Opera"
                                    }, {
                                        name: "Proprietary or Undetectable",
                                        y: 0.2,
                                        drilldown: null
                                    }]
                         }],
                drilldown: {
                    series: [{
                                 name: "Microsoft Internet Explorer",
                                 id: "Microsoft Internet Explorer",
                                 data: [
                                     ["v11.0", 24.13],
                                     ["v8.0", 17.2],
                                     ["v9.0", 8.11],
                                     ["v10.0", 5.33],
                                     ["v6.0", 1.06],
                                     ["v7.0", 0.5]
                                 ]
                             }, {
                                 name: "Chrome",
                                 id: "Chrome",
                                 data: [
                                     ["v40.0", 5],
                                     ["v41.0", 4.32],
                                     ["v42.0", 3.68],
                                     ["v39.0", 2.96],
                                     ["v36.0", 2.53],
                                     ["v43.0", 1.45],
                                     ["v31.0", 1.24],
                                     ["v35.0", 0.85],
                                     ["v38.0", 0.6],
                                     ["v32.0", 0.55],
                                     ["v37.0", 0.38],
                                     ["v33.0", 0.19],
                                     ["v34.0", 0.14],
                                     ["v30.0", 0.14]
                                 ]
                             }, {
                                 name: "Firefox",
                                 id: "Firefox",
                                 data: [
                                     ["v35", 2.76],
                                     ["v36", 2.32],
                                     ["v37", 2.31],
                                     ["v34", 1.27],
                                     ["v38", 1.02],
                                     ["v31", 0.33],
                                     ["v33", 0.22],
                                     ["v32", 0.15]
                                 ]
                             }, {
                                 name: "Safari",
                                 id: "Safari",
                                 data: [
                                     ["v8.0", 2.56],
                                     ["v7.1", 0.77],
                                     ["v5.1", 0.42],
                                     ["v5.0", 0.3],
                                     ["v6.1", 0.29],
                                     ["v7.0", 0.26],
                                     ["v6.2", 0.17]
                                 ]
                             }, {
                                 name: "Opera",
                                 id: "Opera",
                                 data: [
                                     ["v12.x", 0.34],
                                     ["v28", 0.24],
                                     ["v27", 0.17],
                                     ["v29", 0.16]
                                 ]
                             }]
                }
            };
            /*$scope.chartConfig = {

                options: {
                    //This is the Main Highcharts chart config. Any Highchart options are valid here.
                    //will be overriden by values specified below.
                    chart: {
                        type: 'bar'
                    },
                    tooltip: {
                        style: {
                            padding: 10,
                            fontWeight: 'bold'
                        }
                    }
                },
                //The below properties are watched separately for changes.

                //Series object (optional) - a list of series using normal highcharts series options.
                series: [{
                             data: [10, 15, 12, 8, 7]
                         }],
                //Title configuration (optional)
                title: {
                    text: 'Hello'
                },
                //Boolean to control showng loading status on chart (optional)
                //Could be a string if you want to show specific loading text.
                loading: false,
                //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
                //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
                xAxis: {
                    currentMin: 0,
                    currentMax: 20,
                    title: {text: 'values'}
                },
                //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
                useHighStocks: false,
                //size (optional) if left out the chart will default to size of the div or something sensible.
                size: {
                    width: 400,
                    height: 300
                },
                //function (optional)
                func: function (chart) {
                    //setup some logic for the chart
                }
            };*/
        });
}());
