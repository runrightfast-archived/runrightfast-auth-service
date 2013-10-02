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
 * 	 couchbaseConn: conn								// REQUIRED - Couchbase.Connection
 *   logLevel : 'WARN' 									// OPTIONAL - Default is 'WARN'
 * }
 * </code>
 */
(function() {
	'use strict';

	var HawkAuthService = function(options) {
		var HawkCredentialsDatabase = require('..').HawkCredentialsDatabase;
		this.hawkCredentialsDatabase = new HawkCredentialsDatabase(options);
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
	HawkAuthService.prototype.getCredentials = function(id, callback) {
		this.hawkCredentialsDatabase.getCredentials(id, callback);
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

	module.exports = HawkAuthService;
}());