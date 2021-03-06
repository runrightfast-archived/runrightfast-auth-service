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

'use strict';
var expect = require('chai').expect;
var HawkCredentialsDatabase = require('..').HawkCredentialsDatabase;

var ElasticSearchClient = require('runrightfast-elasticsearch').ElasticSearchClient;
var ejs = new ElasticSearchClient({
	host : 'localhost',
	port : 9200
}).ejs;

describe('HawkCredentialsDatabase', function() {
	var hawkCredentialsDatabase = null;

	var idsToDelete = [];

	before(function() {
		hawkCredentialsDatabase = new HawkCredentialsDatabase({
			elastic : {
				ejs : ejs
			},
			logLevel : 'DEBUG'
		});
	});

	after(function() {
		idsToDelete.forEach(function(id) {
			hawkCredentialsDatabase.deleteCredentials(id);
		});
		idsToDelete = [];
	});

	it('can create new HawkCredentials that are persisted in the database', function(done) {
		hawkCredentialsDatabase.createCredentials(function(error, credentials) {
			try {
				if (error) {
					done(error);
				} else {
					console.log("new credentials : %s", JSON.stringify(credentials));
					idsToDelete.push(credentials.id);

					hawkCredentialsDatabase.getCredentials(credentials.id, function(error, credentials2) {
						if (error) {
							done(error);
						} else {
							console.log("new credentials2 : %s", JSON.stringify(credentials2));
							expect(credentials2.id).to.equal(credentials.id);
							expect(credentials2.key).to.equal(credentials.key);

							done();
						}
					});

				}
			} catch (error) {
				done(error);
			}
		});
	});

	it('can create multiple new HawkCredentials that are persisted in the database', function(done) {
		var counter = 0;
		for (var i = 0; i < 10; i++) {
			hawkCredentialsDatabase.createCredentials(function(error, credentials) {
				var ii = i;
				try {
					if (error) {
						done(error);
					} else {
						console.log("new credentials #d : %s", ii, JSON.stringify(credentials));
						idsToDelete.push(credentials.id);

						hawkCredentialsDatabase.getCredentials(credentials.id, function(error, credentials2) {
							if (error) {
								done(error);
							}
						});

						counter++;
						console.log('counter = ' + counter);
						if (counter >= 10) {
							done();
						}

					}
				} catch (error) {
					done(error);
				}
			});
		}

	});

	it('can delete HawkCredentials', function(done) {
		hawkCredentialsDatabase.createCredentials(function(error, credentials) {
			try {
				if (error) {
					done(error);
				} else {
					console.log('deleting %s ...', credentials.id);
					hawkCredentialsDatabase.deleteCredentials(credentials.id, function(error, result) {
						if (error) {
							done(error);
						} else {
							console.log("deleted : %s", JSON.stringify(result));
							done();
						}
					});

				}
			} catch (error) {
				done(error);
			}
		});
	});

	it("return undefined if credentials could not be found", function(done) {
		hawkCredentialsDatabase.getCredentials("fsdfsdf", function(error, credentials) {
			if (error) {
				done(error);
				return;
			}

			if (credentials) {
				done(new Error('expecting nothing to be found'));
			}

			done();
		});
	});
});