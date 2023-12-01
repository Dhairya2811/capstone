var express = require("express");
var sassMiddleware = require("sass-middleware");
var path = require("path");
var sqlite3 = require("sqlite3");
var { open } = require("sqlite"); 
var bcrypt = require("bcrypt");

// var express = require("express");


// variables
const saltRound = 10;

// code 
sqlite3.verbose();

const db = open({
    filename: "Database.db",
    driver: sqlite3.Database
});

const server = express();
server.locals.db = db;

server.use(sassMiddleware({
    src: path.join(__dirname, "scss"),
    dest: path.join(__dirname, "public"),
    debug: true,
    outputStyle: 'compressed'
}));

server.use(express.json({limit: '50mb'}));

server.set("view engine", "ejs");

server.use(express.json());

var pathArray = [
    "/", 
    "/signin", 
    "/register", 
    "/addItem", 
    "/details/:id", 
    "/myCart", 
    "/myItems", 
    "/editItem/:id", 
    "/payment", 
    "/category/:name",
    "/myCart/category/:name",
    "/myItems/category/:name",
    "/search/:search_by",
    "/UsersAndData/search/:query",
    "/higestSale",
    "/UsersAndData"
 ];
server.get(pathArray, (req, response)=>{
        response.render('index');    
});

const returnData = {};
const setReturn = (key, data)=>{
    returnData[key] = data;
};
const getReturn = ()=> {return returnData}
server.get(["/index", "/index/category/:name"], async (req, response)=>{
    var name = req.params.name;
    var sql = "";
    var params = [];
    if(name == undefined || name == "All"){    
        // get the last 6 items which are on deal
        setReturn("index", true);
        var sql_index = `Select rowid,* from items where quantity > ? AND deal=1 ORDER BY rowid DESC LIMIT 0,6`;
        var params_index = [ 0];
        (await db).all(sql_index, params_index).then(
            async data=>{
                setReturn("Deals", data);
                // get the last 6 items which has category Electronic
                let sql = "SELECT rowid, * FROM items WHERE quantity > ? AND category = ? ORDER BY rowid DESC LIMIT 0,6";
                let params = [0, 'Electronics'];
                (await db).all(sql, params).then(
                    async data=>{
                        setReturn('Electronic', data)
                        // get the last 6 items which has category Fashion
                        let sql = "SELECT rowid, * FROM items WHERE quantity > ? AND category = ? ORDER BY rowid DESC LIMIT 0,6";
                        let params = [0, 'Fashion'];
                        (await db).all(sql, params).then(
                            async data=>{
                                setReturn('Fashion', data);
                                // get the last 6 items which has category Home
                                let sql = "SELECT rowid, * FROM items WHERE quantity > ? AND category = ? ORDER BY rowid DESC LIMIT 0,6";
                                let params = [0, 'Home'];
                                (await db).all(sql, params).then(
                                    async data=>{
                                        setReturn('Home', data);
                                        // get the last 6 items which has category Toys
                                        let sql = "SELECT rowid, * FROM items WHERE quantity > ? AND category = ? ORDER BY rowid DESC LIMIT 0,6";
                                        let params = [0, 'Toys'];
                                        (await db).all(sql, params).then(
                                            async data=>{
                                                setReturn('Toys', data);
                                                response.json(getReturn())
                                            }
                                        );
                                    }
                                );
                            }
                        );   
                    }
                );
            }
        );        
    }else if(name == "Lowtohigh"){
        setReturn("index", "Price: low to high");
        sql = `SELECT rowid, * FROM items WHERE quantity > ? ORDER BY price, rowid DESC`;
        params = [ 0];
        (await db).all(sql, params).then(
            data=>{
                setReturn("data", data);
                response.json(getReturn());        
            }
        );
    }else if(name == "Hightolow"){
        setReturn("index", "Price: high to low");
        sql = `SELECT rowid, * FROM items WHERE quantity > ? ORDER BY price DESC`;
        params = [ 0];
        (await db).all(sql, params).then(
            data=>{
                setReturn("data", data);
                response.json(getReturn());
            }
        );
    }else if(name == "Deals"){
        setReturn("index", "Deals");
        sql = `SELECT rowid, * FROM items WHERE quantity > ? AND deal=1 ORDER BY price`;
        params = [0];
        (await db).all(sql, params).then(
            data=>{
                setReturn("data", data);
                response.json(getReturn());
            }
        );
    }else{
        setReturn("index", name);
        sql = `SELECT rowid, * FROM items WHERE quantity > ? AND category = ? ORDER BY rowid DESC`
        params = [ 0, name];
        (await db).all(sql, params).then(
            data=>{
                setReturn("data", data);
                response.json(getReturn());
            }
        );
    }
});

server.post("/userInfo", async (req, res)=>{
    var name = req.body.username;
    var sql = "SELECT username, email, blocked, admin FROM users WHERE username = ?";
    var params = [name];
    (await db).get(sql, params)
    .then(row=>{
        res.json(row);
    });
});

server.post("/users", async (req, res)=>{
    var data = req.body;
    var username = data.user;
    console.log(data);
    var sql = "SELECT username, email, blocked, admin FROM users WHERE username not in (?, ?)";
    var params = [username, "Dhairya"];
    (await db).all(sql, params)
    .then(row => {
        res.json({res: row});
    });
});

server.put("/userblockadmin", async (req, res)=>{
    const data = req.body;
    const username = data.username;
    const blocked = data.block;
    const admin = data.admin;
    var sql = "UPDATE users SET blocked = ?, admin = ? WHERE username = ?";
    var params = [blocked, admin, username];
    (await db).all(sql, params)
    .then(row => res.send("USER INFO UPDATED"));
});

server.get("/index/search/:search_by", async(req, res)=>{
    var name = req.params.search_by;
    setReturn("index", name);
    var sql = `SELECT rowid, * FROM items WHERE title LIKE ? OR category LIKE ? OR description LIKE ? ORDER BY deal DESC`;
    var params = ['%'+name+'%', '%'+name+'%', '%'+name+'%'];
    (await db).all(sql, params).then(
        data=>{
            setReturn("data", data);
            res.json(getReturn());
        }
    )
})

server.get("/getComments/:itemid", async(req, res)=>{
    var itemid = req.params.itemid;
    var sql = `SELECT rowid, * FROM comment WHERE itemid=${itemid}`;
    (await db).all(sql).then(data=>res.send(data));
});

server.post("/deleteComment", async (req, res) => {
    var commentid = req.body.commentid;
    var sql = 'DELETE FROM comment WHERE rowid=?';
    var params = [commentid];
    (await db).run(sql, params)
    .then(()=>
        res.send('COMMENT DELETED')
    );
});

server.get(["/getMyItems/:username", "/getMyItems/:username/category/:name"], async(req, res)=>{
    var username = req.params.username;
    var name = req.params.name;
    var sql = "";
    var params = [];
    if(name == undefined || name == "All"){
        sql = `Select rowid, * from items where name = ?`;
        params = [username];
    }else if(name == "Lowtohigh"){
        sql = `SELECT rowid, * FROM items WHERE name = ? ORDER BY price`;
        params = [username];
    }else if(name == "Hightolow"){
        sql = `SELECT rowid, * FROM items WHERE name = ? ORDER BY price DESC`;
        params = [username];
    }else{
        sql = `SELECT rowid, * FROM items WHERE name = ? AND category = ?`
        params = [username, name];
    }
    (await db).all(sql, params).then(
        data =>{
            res.json(data);
        }
    )
});
// ****************************************************************************
server.get(["/getCartItems/:username", "/getCartItems/:username/category/:name"], async (req, res)=>{
    var userName = req.params.username;
    var name = req.params.name;
    var sql = "";
    if(name == undefined || name == "All"){
        sql = `SELECT c.name as username, i.rowid, i.name, i.title, i.description, i.price, i.image, i.imageName, i.quantity, i.category, i.deal, i.deal_title, i.dealPrice FROM cart AS c INNER JOIN items AS i ON c.itemid = i.rowid WHERE c.name="${userName}" AND i.quantity > 0`;
    }else if(name == "Lowtohigh"){
        sql = `SELECT c.name as username, i.rowid, i.name, i.title, i.description, i.price, i.image, i.imageName, i.quantity, i.category FROM cart AS c INNER JOIN items AS i ON c.itemid = i.rowid WHERE c.name="${userName}" AND i.quantity > 0 ORDER BY price`;
    }else if(name == "Hightolow"){
        sql = `SELECT c.name as username, i.rowid, i.name, i.title, i.description, i.price, i.image, i.imageName, i.quantity, i.category FROM cart AS c INNER JOIN items AS i ON c.itemid = i.rowid WHERE c.name="${userName}" AND i.quantity > 0 ORDER BY price DESC`;
    }else{
        sql = `SELECT c.name as username, i.rowid, i.name, i.title, i.description, i.price, i.image, i.imageName, i.quantity, i.category FROM cart AS c INNER JOIN items AS i ON c.itemid = i.rowid WHERE c.name="${userName}" AND i.quantity > 0 AND i.category = "${name}"`;
    }
    (await db).all(sql)
    .then(row=>{
        res.send(row);
    });
});
server.get("/getItem/:id/:username", async (req, res)=>{
    var itemId = req.params.id;
    var username = req.params.username;
    var sql = `select rowid, * from items WHERE rowid=${itemId}`;
    (await db).get(sql)
    .then(
        async (rows)=>{
            // rows["incart"] = true;
            if(rows !== undefined){
                var sql2 = `SELECT * FROM cart WHERE itemID = ? and name = ?`;
                var params2 = [itemId, username];
                (await server.locals.db).all(sql2, params2)
                .then(internalrows =>{
                    var inCart = false;
                    if ((internalrows).length !== 0){
                        inCart = true;
                    }
                    rows["inCart"] = inCart;
                    res.send(rows);
                });
            }else{
                let row = {"item": "undefined"}
                res.send(row);
            }
        }
    );
});

server.get("/delete/:id", async (req, response)=>{
    var itemID = req.params.id;
    var sql = `DELETE FROM items where rowid = ?`;
    var params = [itemID];
    (await db).get(sql, params)
    .then(res=>{
        response.send("deleted")
    });
});

server.post("/addComment", async(req, res)=>{
    var data = req.body;
    var username = data.username;
    var datetime = data.datetime;
    var flag = false;
    var comment = data.comment;
    var itemid = data.itemid;
    var sql = `INSERT INTO comment (name, datetime, flag, comment, itemid) VALUES (?, ?, ?, ?, ?)`;
    var params = [username, datetime, flag, comment, itemid];
    (await db).all(sql, params)
    .then((err, rows)=>{
        if(err){console.error(err)}
        res.send("Inserted");
    });
});

server.post("/flagComment", async(req, res)=>{
    var data = req.body;
    var sql = "UPDATE comment SET flag=? WHERE rowid=? ";
    var flag = !(parseInt(data.flag));
    var params = [flag, data.rowid];
    (await db).all(sql, params).then((err, rows)=>{
        if(err){console.log(err);}
        res.send("flag_change");
    });
});

server.post("/register" ,async (req, response)=>{
    var data = req.body;
    var usename = data.useName;
    var email = data.email;
    (await db).get(`select * from users where username = '${usename}'`).then(res=>{ 
        if((typeof res)== "undefined"){
            var password = data.password; bcrypt.hash(password, saltRound, async(err, hash)=>{
                if(err){console.log("err: "+err)}
                ((await db).all("select rowid, * from users"))
                .then(async res=>{
                    var id = 0;
                    if(res.length == 0){
                        id = 1;
                    }else{
                        id = (res[res.length - 1].rowid)+1;
                    }
                    var sql = "insert into users (rowid, username, email, password) values (?, ?, ?, ?);"
                    var params = [id, usename, email, hash];
                    (await db).all(sql, params)
                    .then( (err, rows)=>{
                        if(err){console.error(err)}
                        response.send("Inserted");
                    });
                });
            })
        }else{
            response.send("Taken");
        }
    });
});
server.post("/signIn", async (req, response)=>{
    var data = req.body;
    var username = data.userName;
    var password = data.password;
    var sql = "select username, password, blocked, admin from users where username=?";
    var params = [username];
    (await db).all(sql, params)
    .then(resp=>{
        if(resp.length === 0){
            console.log("incorrect username");
            response.json({res: "incorrect username"});
        }else{
            var username = resp[0].username;
            var blocked = resp[0].blocked;
            var admin = resp[0].admin;
            bcrypt.compare(password, resp[0].password, (err, res)=>{
                if(err){console.log(err);}
                if(res){
                    response.json({res:{username: username, blocked: blocked, admin: admin}});
                }else{
                    response.json({res: "incorrect password"});
                }
            }); 
        }
    })
});

server.post("/addItem", async (req, response)=>{
    var data = req.body;
    var title = data.title;
    var description = data.description;
    var price = data.price;
    var quantity = data.quantity;
    var category = data.category;
    var image = data.image;
    var imageName = data.imageName;
    var name = data.username;
    var deal = data.deal;
    var deal_title = data.dealText;
    var dealPrice = data.dealPrice;
    var sql, params;

    if(deal){
        sql = "INSERT INTO items(title, description, price, image, imageName, quantity, category," +  
            "name, deal, deal_title, dealPrice) Values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        params = [title, description, price,image, imageName, quantity, category, name, deal, deal_title, dealPrice];
    }
    else{
        sql = "INSERT INTO items(title, description, price, image, imageName, quantity, category," +  
            "name, deal) Values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        params = [title, description, price,image, imageName, quantity, category, name, deal];
    }
    (await db).all(sql, params).then((err)=>{
        if(err){
            console.log(err);
        }
        response.send("inserted");
    });
});
server.post("/addToCart", async (req, res)=>{
    var data = req.body;
    var username = data.username;
    var itemid = data.itemId;
    var sql = "INSERT INTO cart (name, itemID) VALUES (?, ?)";
    var sql2 = "DELETE FROM cart WHERE name=? AND itemID=?"
    var params = [username, itemid];
    if(data.cartAction){
        (await db).all(sql, params).then(
            (err, rows)=>{
                res.send("added");
            }
        );
    }
    else{
        (await db).all(sql2, params).then(
            (err, rows)=>{
                res.send("removed");
            }
        );
    }
});
server.post("/updateItem", async (req, res)=>{
    var data = req.body;
    var id = data.id;
    var title = data.title;
    var description = data.description;
    var price = data.price;
    var quantity = data.quantity;
    var category = data.category;
    var image = data.image;
    var imageName = data.imageName;
    var name = data.username;
    var deal = data.deal;
    var deal_title = data.dealText;
    var dealPrice = data.dealPrice;
    var sql, params;
    if(deal){
        sql = "UPDATE items SET title = ?, description = ?, price = ?, image = ?, imageName = ?,quantity = ? "+
        ", category = ?, name = ?, deal = ?, deal_title = ?, dealPrice = ? WHERE rowid = ?";
        params = [title, description, price,image, imageName, quantity, category, name, deal, deal_title, dealPrice, id];
    }
    else{
        sql = "UPDATE items SET title = ?, description = ?, price = ?, image = ?, imageName = ?,quantity = ? "+
        ", category = ?, name = ?, deal = ? WHERE rowid = ?";
        params = [title, description, price,image, imageName, quantity, category, name, deal, id];
    }
    (await db).all(sql, params).then(
        (err, rows)=>{
            if(err){console.log(err);}
            res.send("updated");
        }
    );
});

server.post("/successfulPurchase", async (req, res)=>{
    var data = req.body;
    console.log(data);
    var items = data.items;
    for(let i = 0; i<items.length; i++){
        var sql = `UPDATE items SET quantity = ? WHERE rowid=?`;
        var params = [parseInt(items[i].quantity)-1, parseInt(items[i].rowid)];
        (await db).all(sql, params)
        .then((err, rows)=>{
            if(err){console.log(err);}
        });
        var sql2 = `DELETE FROM cart WHERE name = ? and itemID = ?`;
        var params2= [data.userName, parseInt(items[i].rowid)];
        (await db).all(sql2, params2)
        .then((err, rows)=>{
            if(err){console.log(err);}
        });
        var sql3 = "INSERT INTO purchaseHistory (itemtitle, price, buyername, sellername, date) VALUES (?, ?, ?, ?, ?)";
        var params3 = [items[i].title, items[i].price, data.userName, items[i].name, data.date];
        (await db).all(sql3, params3)
        .then((err, rows)=>{
            if(err){console.log(err);}
        });
    }
    res.send("purchased");
});

server.post("/starreview", async (req, res)=>{
    var data = req.body;
    var rate = data.rate;
    var username  = data.username;
    var itemid = data.itemid;

    var sql = "SELECT rowid FROM rates WHERE itemid = ? and username = ?";
    var params = [itemid, username];
    (await db).all(sql, params)
    .then(async row=>{
        if(row.length == 0){
            var sql = "INSERT INTO rates (itemid, username, rate) VALUES (?, ?, ?)";
            var params = [itemid, username, rate];
            (await db).run(sql, params, (err, rows)=>{
                if(err){
                    res.send("ERROR")
                }else{
                    res.send("reviewed");
                }
            });
        }else{
            var sql = "UPDATE rates SET rate = ? WHERE itemid = ? and username = ?";
            var params = [rate, itemid, username];
            (await db).run(sql, params, (err, rows)=>{
                if(err){
                    res.send("ERROR")
                }else{
                    res.send("reviewed");
                }
            });
        }
    });
});

server.get("/starreview", async (req, res)=>{
    var username = req.query["username"];
    var itemid = req.query["itemid"];
    var sql = "SELECT rate FROM rates WHERE itemid = ? AND username = ?;"
    var params = [itemid, username];
    (await db).all(sql, params)
    .then(row=>{
        res.json({"res": row});
    });
});

server.get("/aveReview", async (req, res)=>{
    var itemid = req.query["itemid"];
    var sql = 'select avg(rate) as average from rates where itemid = ?'
    var params = [itemid];
    (await db).all(sql, params)
    .then((row)=>{
        res.json({"avg": row[0].average});
    });
});

server.post("/addAd", async (req, res)=>{
    var data = req.body;
    var url = data.url;
    var title = data.title;
    var description = data.description;
    var itemid = data.itemid;
    var sql = "SELECT * FROM ad";
    (await db).all(sql)
    .then(async row=>{
        if(row.length == 0){
            var sql2 = "INSERT INTO ad (videoLink, title, adDescription, itemid) VALUES (?, ?, ?, ?)";
            var params2 = [url, title, description, itemid];
            (await db).all(sql2, params2)
            .then(err=>res.send("Ad added"));
        }else if(row.length == 1){
            var sql2 = "UPDATE ad set videoLink = ?, title = ?, adDescription = ?, itemid = ?";
            var params2 = [url, title, description, itemid];
            (await db).run(sql2, params2)
            .then(err=>res.send("Ad updated"));
        }
    });
});

server.get("/lastAd", async (req, res)=>{
    var sql = "SELECT * FROM ad WHERE rowid = ?";
    var params = [1];
    (await db).all(sql, params)
    .then(row=>{res.json({"res":row})});
});

server.get("/higestSellReq", async(req, res)=>{
    var sql = "SELECT rowid, sellername, SUM(price) as profit FROM purchaseHistory where date LIKE ? GROUP BY sellername Order by SUM(price) Desc";
    var params = [`%${new Date().toLocaleString('en-US', { month: 'short' })}%`];
    (await db).all(sql, params)
    .then(async row=>{
        var data = row;
        if(data.length != 0){
            for(let i = 0; i<data.length; i++){
                var sql2 = "Select * from purchaseHistory Where sellername = ? and date LIKE ? order by price desc";
                var params2 = [data[i].sellername, `%${new Date().toLocaleString('en-US', { month: 'short' })}%`];
                (await db).all(sql2, params2)
                .then(async row=>{
                    data[i]["details"]=row;
                    if(i+1 == data.length){
                        var sql3 = "DELETE FROM purchaseHistory WHERE date NOT LIKE ?";
                        var params3 = [`%${new Date().toLocaleString('en-US', { month: 'short' })}%`];
                        (await db).run(sql3, params3);
                        console.log(data);
                        res.json(data);
                    }
                });
            }
        }else{
            res.json(data);
        }
    });
});

server.get("/UsersAndData/adminSearch/:query", async(req, res)=>{
    var query = req.params.query;
    var userSql = "Select username, email, blocked, admin from users where username = ?";
    var userParams = [query];
    await (await db).all(userSql, userParams)
    .then(async resp => {
        if(resp.length > 0){
            res.json({"resp": resp, "page": "user"});
        }else{
            var itemsSql = "Select rowid, * from items where title like ? OR category like ? OR description like ?;";
            var itemsParams = [`%${query}%`, `%${query}%`, `%${query}%`];
            (await db).all(itemsSql, itemsParams)
            .then(resp => {
                if(resp.length > 0){
                    res.json({"resp": resp, "page": "data"});
                }else{
                    res.json({"resp": "No User or Data found with search query of "+query});
                }
            });
        }
    });
});

server.get("/getAllItems", async (req, res)=>{
    var page = parseInt(req.query.page);
    console.log(`/getAllItems get called. \n page no.: ${page}`)
    var sql = `SELECT rowid, * FROM items ORDER BY rowid DESC LIMIT ?, 10;`;
    var params = [parseInt(page)*10];
    (await db).all(sql, params)
    .then(data => {
        res.json({"nextPage": page+1, "response": data});
    });
});

server.use(express.static('public')); // use this middleware before get method.

server.get("/:path", (req, res)=>{
    res.render('index');    

});

var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
server.listen(server_port, async ()=>{
    // var sql = `INSERT INTO "main"."cart"
    // ("name", "itemID")
    // VALUES ('das5', 33);`;
    // (await db).all(sql)
    // .then(res => {
    //     console.log(res);
    // });

    console.log("Server is listening on http://localhost:3000");
});