I have used Mongodb as a database and mongoose, mongojs as ORM.

Robo3t for testing purpose.

Postman for CRUD operations.

install via npm:npm install -g severless

created a database connection mongodb(mongoose,mongojs) with collection name:awsusers.

in handler.js, first created 'post' for created method.

gettickets for 'get' method.

getticket by id for 'get' method// for one ticket

update ticket for 'put' method.

in serverless.yml, setted region as east-us-1 with plugins: serverless-offline and httpport:4000


lambda functions

  --path:create
    method:post
    
     --path:getall
       method:get
       
        --path:getOne
          method:get
          
           --path:update
             method:put
