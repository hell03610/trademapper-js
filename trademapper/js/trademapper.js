/*
 * The main trademapper library
 */
define(
	[
		"trademapper.arrows",
		"trademapper.csv",
		"trademapper.mapper",
		"trademapper.route",
		"d3",
		"text!../fragments/filterskeleton.html",
		"text!../fragments/csvonlyskeleton.html"
	],
	function(arrows, csv, mapper, route, d3, filterSkeleton, csvOnlySkeleton) {
	"use strict";

	var config, mapRootElement, formElement, fileInputElement, tmsvg, currentCsvData, currentCsvType,

		defaultConfig = {
			ratio: 0.6,
			arrowColours: {
				pathStart: "black",
				pathEnd: "orange"
			},
			minArrowWidth: 1,
			maxArrowWidth: 30
		},

	init = function(mapId, formElementId, tmConfig) {
		mapRootElement = d3.select(mapId);
		formElement = d3.select(formElementId);
		setConfigDefaults(tmConfig);

		createCsvOnlyForm();

		tmsvg = mapRootElement.insert("svg")
			.attr("width", config.width)
			.attr("height", config.height)
			.attr("id", "mapcanvas")
			.attr("class", "map-svg flow")
			.attr("viewBox", "0 0 1500 900");
		arrows.init(tmsvg, config.arrowColours, config.minArrowWidth, config.maxArrowWidth);
		mapper.init(tmsvg, config);

		csv.init(csvLoadedCallback, csvLoadErrorCallback);

		route.setCountryGetPointFunc(mapper.countryCentrePoint);
		route.setLatLongToPointFunc(mapper.latLongToPoint);

		// TODO: delete when happy to do so
		//hardWiredTest();
	},

	setConfigDefaults = function(tmConfig) {
		config = tmConfig || {};

		// set defaults for all
		Object.keys(defaultConfig).forEach(function(key) {
			config[key] = config[key] || defaultConfig[key];
		});

		// work out some stuff from the size of the element we're attached to
		if (!config.hasOwnProperty("width")) {
			config.width = parseInt(mapRootElement.style('width'));
		}
		if (!config.hasOwnProperty("height")) {
			config.height = config.width * config.ratio;
		}
	},

	// hardwired code that will be replaced down the road
	// TODO: delete this
	hardWiredTest = function() {

		routes = [
			new route.Route([
				new route.PointCountry("IN"),
				new route.PointCountry("CN")
			], 2),
			new route.Route([
				new route.PointCountry("KE"),
				new route.PointCountry("US"),
				new route.PointCountry("GB")
			], 20),
			new route.Route([
				new route.PointCountry("AU"),
				new route.PointCountry("ET"),
				new route.PointCountry("FR")
			], 10)
		];
		arrows.drawMultipleRoutes(routes);
	},

	createCsvOnlyForm = function() {
		formElement.html(csvOnlySkeleton);
		fileInputElement = formElement.select("#fileinput");
		csv.setFileInputElement(fileInputElement);
	},

	createFilterForm = function() {
		// generate the form for playing with the data
		formElement.html(filterSkeleton);
		fileInputElement = formElement.select("#fileinput");
		csv.setFileInputElement(fileInputElement);

		// TODO: ...

	},

	csvLoadedCallback = function(csvType, csvData, routes) {
		// first cache the current values, so we can regenerate if we want
		currentCsvData = csvData;
		currentCsvType = csvType;

		createFilterForm();

		var pointRoles = routes.getPointRoles();
		// now draw the routes
		arrows.drawRouteCollectionSpiralTree(routes, pointRoles);
		//arrows.drawRouteCollectionPlainArrows(routes);
		// colour in the countries that are trading
		mapper.colorTradingCountries(pointRoles);
	},

	csvLoadErrorCallback = function(msg) {
		// TODO: show the error to the user
	};

	return {
		init: init
	};
});
