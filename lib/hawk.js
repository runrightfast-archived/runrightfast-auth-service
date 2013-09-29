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

(function() {
	'use strict';

	var uuid = require('uuid');

	var HawkCredentials = function() {
		this.id = uuid.v4().replace(/-/g, '');
		this.key = uuid.v4().replace(/-/g, '');
		this.algorithm = 'sha256';
	};

	/**
	 * Returns the HawkCredentials constrictire that can be used to create new
	 * credentials (containing a new id and key) that can be supplied to a
	 * client.
	 * 
	 * <code>
	 * { id: '7c3f36371d144d91bcd747842f3d9746',
	 *   key: '5b85a5b854f84f9b9d62f4bc45d9fbf1', 
	 *   algorithm: 'sha256'
	 * }
	 * </code>
	 */
	module.exports.HawkCredentials = HawkCredentials;
}());
