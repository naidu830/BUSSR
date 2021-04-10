'use strict';
const mongojs = require('mongojs')
const mongoose = require('mongoose')
const cmn = require('./commonFns/common.js')
const connectMongojsDB = cmn.connectMongojsDB
const buildResp = cmn.buildResponse
const buildError = cmn.buildError

function buildResponse(data) {
  return buildResp({ 'Theater_data': data });
}
const Theater = require('./model/theater.js')

var tables = ["theater_info"]
var db = connectMongojsDB(mongojs, tables)


/**
 * @author Ayyappa Naidu
 * @api https:localhost:4000/dev/create
 * @method post
 * @returns string
 */
module.exports.createTicket = (event, context, callback) => {
  console.log('test')
  var reqJson = JSON.parse(event.body)
  var showTime = reqJson.performance_time.split(' ')[0] + '+' + reqJson.performance_time.split(' ')[1];
  reqJson["performance_time"] = new Date(showTime)
  reqJson["createdOn"] = new Date(Date.now())
  console.log(reqJson)
  var newTheater = new Theater(reqJson);
  db.theater_info.insert(newTheater, function (err, data) {
    if (err) {
      console.log(err)
      context.done(null, buildError(err))
    } else {
      context.done(null, buildResponse("inserted"))
    }
  })
};

/**
 * @author Ayyappa Naidu
 * @api https:localhost:4000/dev/getAll
 * @method post
 * @returns Object
 */
module.exports.getTickets = (event, context, callback) => {

  db.theater_info.find({}, function (err, data) {
    if (err) {
      console.log(err)
      context.done(null, buildError(err))
    } else {
      context.done(null, buildResponse(data))
    }
  })
};

/**
 * @author Ayyappa Naidu
 * @api https:localhost:4000/dev/getOne
 * @method post
 * @returns Object
 */
module.exports.getTicket = (event, context, callback) => {
  console.log('test')
  var params = event.pathParameters
  if (params && params.id) {
    var id = params.id
  } else {
    context.done(null, buildError("missing parameter"))
  }
  db.theater_info.find({ _id: mongoose.Types.ObjectId(id) }, function (err, data) {
    if (err) {
      context.done(null, buildError(err))
    } else {
      context.done(null, buildResponse(data))
    }
  })
};

/**
 * @author Ayyappa Naidu
 * @api https:localhost:4000/dev/update
 * @method PUT
 * @returns string
 */
module.exports.updateTicket = (event, context, callback) => {

  var params = event.pathParameters
  var updateJson = JSON.parse(event.body)
  if (params && params.id) {
    var id = params.id
  } else {
    context.done(null, buildError("missing parameter"))
  }

  db.theater_info.update({ _id: mongoose.Types.ObjectId(id) }, {
    $set: updateJson
  }, function (err, data) {
    if (err) {
      console.log(err)
      context.done(null, buildError(err))
    } else {
      context.done(null, buildResponse("updated"))
    }
  })
};

/**
 * @author Ayyappa Naidu
 * @api https:localhost:4000/dev/delete
 * @method delete
 * @returns string
 */
module.exports.deleteTicket = (event, context, callback) => {
  console.log('test')
  var params = event.pathParameters
  if (params && params.id) {
    var id = params.id
  } else {
    context.done(null, buildError("missing parameter"))
  }

  db.theater_info.remove({ _id: mongoose.Types.ObjectId(id) }, function (err, data) {
    if (err) {
      console.log(err)
      context.done(null, buildError(err))
    } else {
      context.done(null, buildResponse("deleted"))
    }
  })
};



/**
 * @author Ayyappa Naidu
 * @api https:localhost:4000/dev/monthly_profit
 * @method post
 * @returns Object
 */
module.exports.get_monthly_profit = (event, context, callback) => {
  /* type=profit // query string
  
    "p_start": "2021-01-09T10:35:00 05:30",  // body
    "p_end": "2021-09-09T10:35:00 05:30"
   */

  var queryParam = event.queryStringParameters
  var params = JSON.parse(event.body)
  if (!params || !queryParam || !params.p_start || !params.p_end || !queryParam.type) {
    context.done(null, buildError("missing parameter"))
  }
  var monthsArray = [, 'January', 'February', 'March', 'April', 'May', 'June', 'july', 'august', 'September', "October", "November", "December"]
  console.log(queryParam, params)
  if (queryParam && queryParam.type == 'profit') {
    var queryJson = [{
      $match: {
        performance_time: dateRangeFilter(params.p_start, params.p_end)
      }
    }, {
      $group: {
        _id: { $month: "$performance_time" },
        "total": { $sum: "$ticket_price" }
      }
    }, {
      $sort: {
        _id: 1
      }
    }, {
      $addFields: {
        month: {
          $let: {
            vars: {
              monthsInString: monthsArray
            },
            in: {
              $arrayElemAt: ['$$monthsInString', '$_id']
            }
          }
        }
      }
    }, {
      $project: {
        _id: 0,
        month: 1,
        summaryProfit: "$total"
      }
    }]
  } else {  // persons visited
    var queryJson = [{
      $match: {
        performance_time: dateRangeFilter(params.p_start, params.p_end)
      }
    }, {
      $group: { // group by
        _id: { $month: "$performance_time" }, // month
        "count": { $sum: 1 }
      }
    }, {
      $addFields: {
        month: {
          $let: {
            vars: {
              monthsInString: monthsArray
            },
            in: {
              $arrayElemAt: ['$$monthsInString', '$_id']
            }
          }
        }
      }
    }, {
      $sort: {
        month: 1
      }
    }, {
      $project: {
        _id: 0,
        month: 1,
        summaryVisits: "$count"
      }
    }]
  }


  console.log(queryJson)
  db.theater_info.aggregate(queryJson, function (err, data) {
    if (err) {
      context.done(null, buildError(err))
    } else {
      console.log(data)
      context.done(null, buildResponse(data))
    }
  })
};


function dateRangeFilter(start, end) {
  var startDate = start.split(' ')[0] + '+' + start.split(' ')[1];
  var endDate = end.split(' ')[0] + '+' + end.split(' ')[1];
  return { $gte: new Date(startDate), $lt: new Date(endDate) }
}