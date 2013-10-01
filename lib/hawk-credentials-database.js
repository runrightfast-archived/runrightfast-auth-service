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

	var logging = require('runrightfast-commons').logging;
	var log = logging.getLogger('hawk-credentials-database');
	var events = require('runrightfast-commons').events;
	var lodash = require('lodash');
	var util = require('util');
	var Hoek = require('hoek');
	var assert = Hoek.assert;
	var hawk = require('./hawk');
	var Couchbase = require('couchbase');

	var EVENTS = {
		CONN_ERR : 'CONN_ERR',
		STARTING : 'STARTING',
		STARTED : 'STARTED',
		STOPPED : 'STOPPED'
	};

	var HawkCredentialsDatabase = function(options) {
		events.AsyncEventEmitter.call(this);

		this.options = options;

		if (lodash.isFunction(options.connectionListener)) {
			this.on(EVENTS.STARTED, options.connectionListener);
		}

		if (lodash.isFunction(options.connectionErrorListener)) {
			this.on(EVENTS.CONN_ERR, options.connectionErrorListener);
		}
	};

	util.inherits(HawkCredentialsDatabase, events.AsyncEventEmitter);

	/**
	 * Emits a 'STARTING' event when invoked and the Couchbase connection has
	 * not yet been created.
	 * 
	 * if an error occurs while connecting, then an event is emitted where the
	 * event name is 'CONN_ERR' and the event data : (Error,CouchbaseLogger)
	 * 
	 * if the connection is successful, then an event is emitted where the event
	 * name is 'STARTED', with the CouchbaseListener as the event data
	 * 
	 * @param callback -
	 *            OPTIONAL: function(result){} - where result is either an Error
	 *            or CouchbaseLogger
	 */
	HawkCredentialsDatabase.prototype.start = function(callback) {
		if (callback) {
			assert(lodash.isFunction(callback, 'callback must be a function'));
		}

		var self = this;

		if (!this.cb) {
			this.cb = new Couchbase.Connection(this.options.couchbase, function(error) {
				setImmediate(function() {
					if (error) {
						log.error('Failed to start: ' + error);
						self.emit(EVENTS.CONN_ERR, error, self);
						if (callback) {
							process.nextTick(callback.bind(null, error));
						}
					} else {
						log.info('STARTED');
						self.emit(EVENTS.STARTED, self);
						if (callback) {
							process.nextTick(callback.bind(null, self));
						}
					}
				});
				self.emit(EVENTS.STARTING);
				log.info('STARTING');
			});
		}
	};

	/**
	 * emits 'STOPPED' event with the CouchbaseLogger as the event data.
	 * 
	 */
	HawkCredentialsDatabase.prototype.stop = function(callback) {
		if (this.cb) {
			this.cb.shutdown();
			this.emit(EVENTS.STOPPED, this);
			this.cb = undefined;
			log.info('STOPPED');
			if (callback) {
				process.nextTick(callback);
			}
		}
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
		this.cb.get(id, function(error, result) {
			if (error) {
				if (error.code === Couchbase.errors.keyNotFound) {
					process.nextTick(callback);
				} else {
					log.error('getCredentials() : ' + error);
					process.nextTick(callback.bind(null, error));
				}
			} else {
				if (log.isDebugEnabled) {
					log.debug('getCredentials() : ' + JSON.stringify(result));
				}
				process.nextTick(callback.bind(null, error, result.value));
			}
		});
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
	 * @param options
	 *            Couchbase specific options
	 * 
	 */
	HawkCredentialsDatabase.prototype.createCredentials = function(callback, options) {
		var credentials = new hawk.HawkCredentials();
		this.cb.add(credentials.id, credentials, options, function(error, result) {
			if (error) {
				log.error('createCredentials() : ' + error);
				if (callback) {
					process.nextTick(callback.bind(null, error));
				}
			} else {
				if (log.isDebugEnabled) {
					log.debug('createCredentials() : ' + JSON.stringify(result));
				}
				if (callback) {
					process.nextTick(callback.bind(null, error, credentials));
				}
			}
		});

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
	 * 		result - couchbase result, which is the cas - the document's unique id, e.g. 
	 * 		
	 * 				{"cas":{"0":2143551488,"1":1943914051}}
	 * </code>
	 * 
	 * @param options
	 *            Couchbase specific options
	 * 
	 * TODO: ensure it is persisted, i.e., written to file
	 */
	HawkCredentialsDatabase.prototype.deleteCredentials = function(id, callback, options) {
		assert(lodash.isString(id), 'id is required');
		this.cb.remove(id, options, function(error, result) {
			try {
				if (error) {
					log.error('deleteCredentials() : ' + error);
					if (callback) {
						process.nextTick(callback.bind(null, error));
					}
				} else {
					if (log.isDebugEnabled) {
						log.debug('deleteCredentials() : ' + JSON.stringify(result));
					}
					if (callback) {
						process.nextTick(callback.bind(null, error, result));
					}
				}
			} catch (error2) {
				process.nextTick(callback.bind(null, error2));
			}
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
	 * 		result - the Couchbase cas for each deleted document, e.g., 
	 * 
	 * 		{
			   "70956420b7be43829d6f9f585c9e4ab2":{
			      "cas":{
			         "0":2143551488,
			         "1":2709475139
			      }
			   },
			   "14f5973e65f04c6d9def65d7ec0520d6":{
			      "cas":{
			         "0":2143551488,
			         "1":3939598659
			      }
			   }
			}
	 * </code>
	 * 
	 * @param options
	 *            Couchbase specific options
	 * 
	 */
	HawkCredentialsDatabase.prototype.deleteMultiCredentials = function(ids, callback, options) {
		var kv = {};
		var i = 0;

		assert(lodash.isArray(ids), 'ids is required and must be an Array');
		if (ids.length === 0) {
			process.nextTick(callback);
			return;
		}

		for (i = 0; i < ids.length; i++) {
			kv[ids[i]] = null;
		}

		this.cb.removeMulti(kv, options, function(error, result) {
			if (error) {
				log.error('deleteCredentials() : ' + error);
				if (callback) {
					process.nextTick(callback.bind(null, error));
				}
			} else {
				if (log.isDebugEnabled) {
					log.debug('deleteCredentials() : ' + JSON.stringify(result));
				}
				if (callback) {
					process.nextTick(callback.bind(null, error, result));
				}
			}
		});
	};

	module.exports = function(options) {
		var validateOptions = function() {
			assert(lodash.isObject(options), 'options is required');
			assert(lodash.isObject(options.couchbase), 'options.couchbase is required');
			if (options.connectionListener) {
				assert(lodash.isFunction(options.connectionListener), 'options.connectionListener must be a function');
			}
			if (options.connectionErrorListener) {
				assert(lodash.isFunction(options.connectionErrorListener), 'options.connectionErrorListener must be a function');
			}
		};

		var logOptions = function() {
			var logLevel = options.logLevel || 'WARN';
			logging.setLogLevel(log, logLevel);
			if (log.isLevelEnabled('DEBUG')) {
				log.debug(options);
			}
		};

		validateOptions();
		logOptions();
		return new HawkCredentialsDatabase(options);
	};
}());
