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
		this.hawkCredentialsDatabase.deleteCredentials(id, callback);
	};

	module.exports = HawkAuthService;
}());