/**
 * Copyright [2013] [runrightfast.co]
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * <code>
 * options = { 
 * 	 couchbase : {										// REQUIRED
 * 		host : [ 'localhost:8091' ],					// OPTIONAL - Default is [ 'localhost:8091' ]
 *		bucket : 'default',								// OPTIONAL - Default is 'default'
 *		password : 'password' 							// OPTIONAL
 *   },
 *   connectionListener : function(error){},			// OPTIONAL
 *   connectionErrorListener : function(){},			// OPTIONAL
 *   logLevel : 'WARN' 									// OPTIONAL - DEBUG | INFO | WARN | ERROR - default is WARN
 *   
 * }
 * </code>
 */
(function() {
	'use strict';

	var HawkAuthService = function(options) {
		this.hawkCredentialsDatabase = require('..').hawkCredentialsDatabase(options);
		// TODO - register event listeners
	};

	/**
	 * 
	 * @param callback -
	 *            OPTIONAL: function(result){} - where result is either an Error
	 *            or CouchbaseLogger
	 */
	HawkAuthService.prototype.start = function(callback) {
		this.hawkCredentialsDatabase.start(callback);
	};

	HawkAuthService.prototype.stop = function(callback) {
		this.hawkCredentialsDatabase.stop(callback);
	};

	/**
	 * @param id
	 *            HawkCredentials id
	 * @param callback
	 *            function with signature function(err, credentials) where:
	 * 
	 * <pre>
	 * 		err - an internal error.
	 * 		credentials - if not found, then undefined is returned 		
	 * </pre>
	 */
	HawkAuthService.prototype.getCredentials = function(id,callback) {
		this.hawkCredentialsDatabase.getCredentials(id,callback	);
	};

	/**
	 * 
	 * @param callback
	 *            with signature function(err, credentials) where:
	 * 
	 * <pre>
	 * 		err - an internal error.
	 * 		credentials - the new HawkCredentials object that was persisted to the database
	 * </pre>
	 */
	HawkAuthService.prototype.createCredentials = function(callback) {
		this.hawkCredentialsDatabase.createCredentials(callback);
	};

	/**
	 * 
	 * @param id
	 *            credential id
	 * @param callback
	 *            with signature function(err) where:
	 * 
	 * <pre>
	 * 		err - an internal error.
	 * </pre>
	 */
	HawkAuthService.prototype.deleteCredentials = function(id, callback) {
		this.hawkCredentialsDatabase.deleteCredentials(id, function(error) {
			callback(error);
		});
	};

	/**
	 * 
	 * @param ids
	 *            array of credential ids
	 * @param callback
	 *            with signature function(err, result) where:
	 * 
	 * <code>
	 * 		err - an internal error.
	 * 		result - array of HawkCredential ids that were deleted
	 * </code>
	 * 
	 * @param options
	 *            Couchbase specific options
	 * 
	 */
	HawkAuthService.prototype.deleteMultiCredentials = function(id, callback) {
		this.hawkCredentialsDatabase.deleteMultiCredentials(id, function(error, result) {
			if (error) {
				callback(error);
			} else {
				callback(error, Object.keys(result));
			}
		});
	};

	module.exports = function(options) {
		return new HawkAuthService(options);
	};
}());