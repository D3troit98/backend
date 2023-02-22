const mysql = require('mysql2')


module.exports =  mysql.createConnection(
    {
        host:'localhost',
        user:'Lithium',
        password:'Lithiumgx98',
        database:'bincomphptest'
    }
)