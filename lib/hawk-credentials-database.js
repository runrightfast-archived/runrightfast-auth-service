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
 * elastic: {
 *   ejs					REQUIRED - elastic.js ejs instance - require('elastic.js')
 *   index					OPTIONAL - name of elastic index to store the log events - default is 'log'
 *   type					OPTIONAL - name of elastic type - default is 'event'
 * }
 * logLevel : 'WARN'		OPTIONAL - Default is 'WARN' 
 * </code>
 */
(function() {
	'use strict';

	var logging = require('runrightfast-commons').logging;
	var log = logging.getLogger('hawk-credentials-database');
	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;
	var hawk = require('./hawk');
	var extend = require('extend');
	var joi = require('joi');

	var HawkCredentialsDatabase = function(options) {
		assert(lodash.isObject(options), 'options is required');

		var schema = {
			elastic : joi.types.Object({
				ejs : joi.types.Object().required(),
				index : joi.types.String(),
				type : joi.types.String()
			}).required(),
			logLevel : joi.types.String()
		};

		var settings = {
			elastic : {
				index : 'hawk',
				type : 'credential'
			},
			logLevel : 'WARN'
		};

		extend(true, settings, options);

		var err = joi.validate(settings, schema);
		if (err) {
			throw err;
		}

		logging.setLogLevel(log, settings.logLevel);
		if (log.isDebugEnabled()) {
			log.debug(settings);
		}
		this.debugEnabled = log.isDebugEnabled();
		this.ejs = settings.elastic.ejs;
		this.index = settings.elastic.index;
		this.type = settings.elastic.type;
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
	HawkCredentialsDatabase.prototype.getCredentials = function(id, callback) {
		assert(lodash.isString(id), 'id is required and muste be a String');
		assert(lodash.isFunction(callback), 'callback is required and must be a function');

		var self = this;
		var doc = this.ejs.Document(self.index, self.type, id);
		doc.doGet(function(result) {
			if (self.debugEnabled) {
				log.debug('getCredentials() : ' + JSON.stringify(result));
			}
			var err;
			if (result.exists) {
				callback(null, result._source);
			} else if (lodash.isBoolean(result.exists)) {
				if (callback) {
					callback();
				}
			} else if (result.error) {
				log.error('getCredentials() : ' + result.error);
				if (callback) {
					err = new Error(result.error);
					err.code = result.code;
					callback(err);
				}
			} else {
				if (callback) {
					callback(null, result._source);
				}
			}
		}, callback);
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
	 * 
	 * 
	 */
	HawkCredentialsDatabase.prototype.createCredentials = function(callback) {
		var credentials = new hawk.HawkCredentials();
		var self = this;

		var doc = self.ejs.Document(self.index, self.type, credentials.id);
		doc.opType('create');
		doc.source(credentials);
		doc.doIndex(function(result) {
			if (self.debugEnabled) {
				log.debug('createCredentials() : ' + JSON.stringify(result));
			}

			if (result.error) {
				log.error('getCredentials() : ' + result.error);
				if (callback) {
					var err = new Error(result.error);
					err.code = result.code;
					callback(err);
				}
			} else {
				if (callback) {
					callback(null, credentials);
				}
			}
		}, callback);

	};

	/**
	 * 
	 * @param id
	 *            credential id
	 * @param callback
	 *            with signature function(err, credentials) where:
	 * 
	 * <code>
	 * 		err - an internal error.
	 * 		result - elasticsearch response
	 * </code>
	 * 
	 * 
	 */
	HawkCredentialsDatabase.prototype.deleteCredentials = function(id, callback) {
		if (!lodash.isString(id)) {
			callback(new Error('id is required and must be a String'));
			return;
		}

		var self = this;
		var doc = self.ejs.Document(self.index, self.type, id);
		doc.doDelete(function(result) {
			if (self.debugEnabled) {
				log.debug('deleteCredentials() : ' + JSON.stringify(result));
			}

			if (result.error) {
				log.error('deleteCredentials() : ' + result.error);
				if (callback) {
					var err = new Error(result.error);
					err.code = result.code;
					callback(err);
				}
			} else {
				if (callback) {
					callback(null, result);
				}
			}
		}, callback);
	};

	module.exports = HawkCredentialsDatabase;
}());
