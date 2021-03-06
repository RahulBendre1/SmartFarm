var db = require('./database')

var state = 1;
function setState(var_state, gate_id) {
	"use strict";
	
	var new_state = (var_state === 1) ? 
		0 : 1;
	
	db.connection.query(
		'UPDATE smart_fences_gates' +
			' SET state = ' + new_state + 
			' WHERE gate_id = ' + gate_id, 
		function(err) {
			if(err) {
				throw(" > setState, query failed");
			} else {
				state = new_state;
			}
		}
	);
	
}

module.exports = {

	getGateCount: function(data, callback) {
		"use strict";

		try {

			console.log(" > getGateCount");

			db.connection.query(
				'SELECT COUNT(*) AS `count` FROM smart_fences_gates', 
				function(err, rows) {

					if (err) {
						throw(err);
					} 

					callback(null, rows[0].count);

				}
			);

		} catch(ex) {
			callback(ex);
		}

	},
	getGate: function(data, callback) {
		"use strict";

		var gate_id = (typeof data.id !== "undefined") ?
			data.id : 0

		if(gate_id < 1) {
			callback(null, {status : 405, action : 'getGate', error : 'unknown gate id'});
		} else {

			db.connection.query(
				'SELECT g.*, f.name AS fence_name FROM smart_fences_gates g' +
					' JOIN smart_fences f ON g.fence_id = f.fence_id' +
					' WHERE gate_id = ' + gate_id, 
				function(err, rows) {

					var responseArray = {
						status 	: 500,
						action 	: 'getGate'
					};

					if (!err) {

						if(rows.length !== 1) {
							responseArray.status = 404;
							responseArray.error = 'gate does not exist';
						} else {

							responseArray.status = 200;
							responseArray.data = {
								id			: gate_id,
								name		: rows[0].name,
								fence_id	: rows[0].fence_id,
								fence_name	: rows[0].fence_name,
								state		: rows[0].state,
								updated		: rows[0].updated
							};

						}

					} else {
						responseArray.status = 500;
						responseArray.error = 'query failed';
					}

					callback(null, responseArray);

				}

			);

		}
		
	},
	toggleGate: function(data, callback) {
		"use strict";
				
		var gate_id = (typeof data.id !== "undefined") ?
			data.id : 0

		if(gate_id < 1) {
			callback({status : 405, action : 'toggleGate', error : 'unknown gate id'});
		} else {
		
			db.connection.query(
				'SELECT gate_id, state FROM smart_fences_gates' +
					' WHERE gate_id = ' + gate_id, 
				function(err, rows) {

					var responseArray = {
						status 	: 500,
						data	: {}
					};

					if(!err) {

						setState(rows[0].state, rows[0].gate_id);

						responseArray.status = 200;
						responseArray.data = {
							id		: gate_id,
							state	: state
						};


					} else {
						responseArray.error = 'query failed (' + err.message + ')';
					}

					callback(null, responseArray);

				}

			);
		
		}
		
	},
	setGateState: function(data, callback) {

		"use strict";

		if(typeof data.id === "undefined" || (data.id < 1)) {
			callback({status : 401, action : 'setGateState', error : 'unknown gate id'});
		} else {

			if(typeof data.state === "undefined" || (data.state < 0)) {
				callback({status : 402, action : 'setGateState', error : 'unknown gate state'});
			} else {
					
				db.connection.query(
					'UPDATE smart_fences_gates' +
						' SET state = ' + data.state +
						' WHERE gate_id = ' + data.id, 
					function(err, rows) {

						var responseArray = {
							status 	: 500,
							action 	: 'setGateState'
						};

						if (!err) {

							responseArray.status = 200;
							responseArray.data = {
								id			: data.id,
								state		: data.state
							};

						} else {
							responseArray.status = 500;
							responseArray.error = 'query failed (' + err.message + ')';
						}

						callback(null, responseArray);

					}

				);
			
			}

		}

	}
	
};