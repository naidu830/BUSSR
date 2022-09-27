

let cachedDb = null
let mongojsDB = null

module.exports.connectMongojsDB = (mongojs, tables) => {
    if (mongojsDB) {
        mongojsDB.collection(tableArr)
        console.log('=> using cached database instance', tables);
        return mongojsDB
    }
    var mongoDbConnection = "mongodb+srv://namexyz:password@cluster0.v7xbs.mongodb.net/BUSSR?retryWrites=true&w=majority"
    var tableArr = tables
    mongojsDB = mongojs(mongoDbConnection)
    mongojsDB.on('error', function (err) {
        console.log('error--', err)
    })
    mongojsDB.collection(tableArr)
    return mongojsDB
}


module.exports.connectDB = (mongoose, context, runfunc) => {
    if (mongoose.connection.readyState) {
        console.log('--->using cached db')
        runfunc(cachedDb)
    }
    mongoose.connect("mongodb+srv://cluster0.v7xbs.mongodb.net/BUSSR?retryWrites=true&w=majority", {
        user: "namexyz",
        pass: "passwordxyz",
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }).then(() => {
        cachedDb = mongoose.connection;
        runfunc(cachedDb)
    }, (err) => {
        context.done(null, module.exports.buildError(err))
    })
}


module.exports.buildResponse = (data, status = 200) => {
    return {
        statusCode: status,
        body: JSON.stringify(data)
    }
}


module.exports.buildError = (error = null, status = 400) => {
    return module.exports.buildResponse({ 'error': error }, status);

}
