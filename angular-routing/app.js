// Create an application module for our demo.
var Demo = angular.module("Demo", []);

// Configure the routing. The $routeProvider will be automatically injected into 
// the configurator.
Demo.config(function($routeProvider){

		// Typically, when defining routes, you will map the route to a Template to be 
		// rendered; however, this only makes sense for simple web sites. When you are 
		// building more complex applications, with nested navigation, you probably need 
		// something more complex. In this case, we are mapping routes to render "Actions" 
		// rather than a template.
		$routeProvider
			.when(
				"/login",
				{
					action: "login"
				}
			)
			.when(
				"/search",
				{
					action: "search"
				}
			)
			.when(
				"/student/new",
				{
					action: "newstudent"
				}
			).when(
				"/student/:index",
				{
					action: "student.aplikant"
				}
			).when(
				"/student/:index/dosie/:dosie",
				{
					action: "student.student"
				}
			).when(
				"/student/:index/dosie/:dosie/personal-data",
				{
					action: "student.student.personalData"
				}
			).when(
				"/student/:index/dosie/:dosie/assign-index",
				{
					action: "student.student.assignIndex"
				}
			).when(
				"/student/:index/dosie/:dosie/faculty-change",
				{
					action: "student.student.facultyChange"
				}
			).when(
				"/student/:index/dosie/:dosie/enroll-subjects",
				{
					action: "student.student.enrollSubjects"
				}
			).when(
				"/student/:index/dosie/:dosie/print",
				{
					action: "student.student.print"
				}
			).when(
				"/student/:index/dosie/:dosie/finance",
				{
					action: "student.student.finance"
				}
			).otherwise(
				{
					redirectTo: "/login"
				}
			)
		;
	}
);



(function(ng, app){
	"use strict";

	app.controller("AppCtrl", function($scope, $route, $routeParams, $location, requestContext) {
			// --- Define Controller Methods. ------------------- //
			// I check to see if the given route is a valid route; or, is the route being
			// re-directed to the default route (due to failure to match pattern).
			function isRouteRedirect(route) {
				// If there is no action, then the route is redirection from an unknown 
				// route to a known route.
				return (!route.current.action);
			}

			// --- Define Scope Methods. ------------------------ //
			// I get the current time for use when display the time a controller was rendered.
			// This way, we can see the difference between when a controller was instantiated
			// and when it was re-populated with data.
			$scope.getInstanceTime = function() {

				var now = new Date();
				var timeString = now.toTimeString();
				var instanceTime = timeString.match( /\d+:\d+:\d+/i );

				return( instanceTime[ 0 ] );
			};

			// TODO: Flesh this out - for now, just trying to create a wrapper for alert().
			$scope.openModalWindow = function( modalType ) {
				alert( arguments[ 1 ] || "Opps: Something went wrong." );
			};

			// I update the title tag.
			$scope.setWindowTitle = function( title ) {

				$scope.windowTitle = title;
			};

			// ------------------------ Define Controller Variables. ----------------------- //
			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext();
			
			// ---------------------------- Define Scope Variables. ------------------------ //
			// Set up the default window title.
			$scope.windowTitle = "Adopt-A-Pet";
			// The subview indicates which view is going to be rendered on the page.
			$scope.subview = renderContext.getNextSection();

			// --- Bind To Scope Events. ------------------------ //
			// I handle changes to the request context.
			$scope.$on("requestContextChanged", function() {
					// Make sure this change is relevant to this controller.
					if ( ! renderContext.isChangeRelevant() ) {
						return;
					}
					// Update the view that is being rendered.
					$scope.subview = renderContext.getNextSection();
				}
			);

			//Listen for route changes so that we can trigger request-context change events.
			$scope.$on("$routeChangeSuccess", function(event) {
					// If this is a redirect directive, then there's no action to be taken.
					if (isRouteRedirect($route)) {
						return;
					}
					// Update the current request action change.
					requestContext.setContext($route.current.action, $routeParams);
					// Announce the change in render conditions.
					$scope.$broadcast("requestContextChanged", requestContext );
				}
			);
		}
	);
})( angular, Demo );



(function(ng, app) {
	"use strict";

	// I provide information about the current route request, local to the given render path.
	app.value("RenderContext", function(requestContext, actionPrefix, paramNames ) {
			console.log("requestContext, actionPrefix, paramNames", requestContext, actionPrefix, paramNames);
			//I return the next section after the location being watched.
			function getNextSection() {
				return (requestContext.getNextSection(actionPrefix));
			}

			// I check to see if the action has changed (and is local to the current location).
			function isChangeLocal() {
				return(requestContext.startsWith(actionPrefix));
			}

			// I determine if the last change in the request context is relevant to
			// the action and route params being observed in this render context.
			function isChangeRelevant() {
				// If the action is not local to the action prefix, then we don't even 
				// want to bother checking the params.
				if (!requestContext.startsWith(actionPrefix)) {
					return (false);
				}

				// If the action has changed, we don't need to bother checking the params.
				if ( requestContext.hasActionChanged() ) {
					return (true);
				}

				// If we made it this far, we know that the action has not changed. As such, we''ll 
				// have to make the change determination based on the observed parameters.
				return (paramNames.length && requestContext.haveParamsChanged(paramNames));
			}


			// ---------------------------------------------- //
			// ---------------------------------------------- //

			
			// Private variables...
			// ---------------------------------------------- //
			// ---------------------------------------------- //


			// Return the public API.
			return ({
				getNextSection: getNextSection,
				isChangeLocal: isChangeLocal,
				isChangeRelevant: isChangeRelevant
			});
	});
})(angular, Demo);




(function(ng, app) {
	"use strict";

	// I provide information about the current route request.
	app.service(
		"requestContext",
		function( RenderContext ) {

			// I get the current action.
			function getAction() {
				return (action);
			}

			// I get the next section at the given location on the action path.
			function getNextSection( prefix ) {
				// Make sure the prefix is actually in the current action.
				if (!startsWith(prefix)) {
					return (null);
				}

				// If the prefix is empty, return the first section.
				if ( prefix === "" ) {
					return (sections[0]);
				}

				// Now that we know the prefix is valid, lets figure out the depth 
				// of the current path.
				var depth = prefix.split( "." ).length;

				// If the depth is out of bounds, meaning the current action doesn't
				// define sections to that path (they are equal), then return null.
				if (depth === sections.length) {
					return (null);
				}

				// Return the section.
				return (sections[depth]);
			}


			// I return the param with the given name, or the default value (or null).
			function getParam( name, defaultValue ) {
				if ( ng.isUndefined( defaultValue ) ) {
					defaultValue = null;
				}
				return( params[ name ] || defaultValue );
			}

			// I return the param as an int. If the param cannot be returned as an 
			// int, the given default value is returned. If no default value is 
			// defined, the return will be zero.
			function getParamAsInt( name, defaultValue ) {

				// Try to parse the number.
				var valueAsInt = ( this.getParam( name, defaultValue || 0 ) * 1 );

				// Check to see if the coersion failed. If so, return the default.
				if ( isNaN( valueAsInt ) ) {
					return( defaultValue || 0 );
				} else {
					return( valueAsInt );
				}
			}


			// I return the render context for the given action prefix and sub-set of 
			// route params.
			function getRenderContext( requestActionLocation, paramNames ) {

				// Default the requestion action.
				requestActionLocation = ( requestActionLocation || "" );
				// Default the param names. 
				paramNames = ( paramNames || [] );
				// The param names can be passed in as a single name; or, as an array
				// of names. If a single name was provided, let's convert it to the array.
				if ( ! ng.isArray( paramNames ) ) {
					paramNames = [ paramNames ];
				}

				return (new RenderContext( this, requestActionLocation, paramNames ));

			}


			// I determine if the action has changed in this particular request context.
			function hasActionChanged() {
				return( action !== previousAction );
			}


			// I determine if the given param has changed in this particular request 
			// context. This change comparison can be made against a specific value 
			// (paramValue); or, if only the param name is defined, the comparison will 
			// be made agains the previous snapshot.
			function hasParamChanged( paramName, paramValue ) {
				// If the param value exists, then we simply want to use that to compare 
				// against the current snapshot. 
				if (!ng.isUndefined(paramValue)) {
					return (!isParam(paramName, paramValue));

				}

				// If the param was NOT in the previous snapshot, then we'll consider
				// it changing.
				if (!previousParams.hasOwnProperty( paramName ) && params.hasOwnProperty( paramName )) {
					return (true);
				// If the param was in the previous snapshot, but NOT in the current, 
				// we'll consider it to be changing.
				} else if (previousParams.hasOwnProperty( paramName ) && !params.hasOwnProperty( paramName )) {
					return (true);
				}
				// If we made it this far, the param existence has not change; as such,
				// let's compare their actual values.
				return( previousParams[ paramName ] !== params[ paramName ] );
			}


			// I determine if any of the given params have changed in this particular
			// request context.
			function haveParamsChanged(paramNames) {
				for ( var i = 0, length = paramNames.length ; i < length ; i++ ) {
					if ( hasParamChanged(paramNames[ i ])) {
						// If one of the params has changed, return true - no need to
						// continue checking the other parameters.
						return( true );
					}
				}
				// If we made it this far then none of the params have changed.
				return( false );
			}

			// I check to see if the given param is still the given value.
			function isParam( paramName, paramValue ) {
				// When comparing, using the coersive equals since we may be comparing 
				// parsed value against non-parsed values.
				if (params.hasOwnProperty( paramName ) && ( params[ paramName ] == paramValue )) {
					return( true );
				}
				// If we made it this far then param is either a different value; or, 
				// is no longer available in the route.
				return (false);
			}


			// I set the new request context conditions.
			function setContext( newAction, newRouteParams ) {
				// Copy the current action and params into the previous snapshots.
				previousAction = action;
				previousParams = params;

				// Set the action.
				action = newAction;

				// Split the action to determine the sections.
				sections = action.split( "." );

				// Update the params collection.
				params = ng.copy( newRouteParams );
			}

			// I determine if the current action starts with the given path.
			function startsWith( prefix ) {
				// When checking, we want to make sure we don't match partial sections for false
				// positives. So, either it matches in entirety; or, it matches with an additional
				// dot at the end.
				if (!prefix.length || (action === prefix ) || ( action.indexOf( prefix + "." ) === 0 )) {
					return (true);
				}
				return (false);
			}

			// ---------------------------------------------- //
			// ---------------------------------------------- //
			// Store the current action path.
			var action = "";

			// Store the action as an array of parts so we can more easily examine 
			// parts of it.
			var sections = [];

			// Store the current route params.
			var params = {};

			// Store the previous action and route params. We'll use these to make 
			// a comparison from one route change to the next.
			var previousAction = "";
			var previousParams = {};

			// ---------------------------------------------- //
			// ---------------------------------------------- //
			// Return the public API.
			return({
				getNextSection: getNextSection,
				getParam: getParam,
				getParamAsInt: getParamAsInt,
				getRenderContext: getRenderContext,
				hasActionChanged: hasActionChanged,
				hasParamChanged: hasParamChanged,
				haveParamsChanged: haveParamsChanged,
				isParam: isParam,
				setContext: setContext,
				startsWith: startsWith
			});


		}
	);
})( angular, Demo );