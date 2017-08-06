var mysql = require("mysql");
var inquirer = require("inquirer");
var Manage = require("./bamazonManager");
var table;
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "P@ssword1",
    database: "bamazon"
});
connection.connect(function(err) {
    if (err) throw err;
    mainMenu();
});

//Give the user the option to browse and purchase products or manage the inventory
function mainMenu() {
    inquirer
        .prompt(
            {
                name: "main",
                type: "rawlist",
                choices: ["Browse and Buy", "Handle Inventory"],
                message: "Please make a selection:"
            })
        .then(function (answer) {
           if (answer.main === "Browse and Buy") {
               //Call the promise function showProducts, and if we get results, call buy stuff
               showProducts().then(function(rows) {
                   buyStuff();
               });
           } else if (answer.main === "Handle Inventory") {
               //Or call the function to handle the inventory
              Manage();
           }
    });
}

function showProducts() {
    //Construct a new promise
    return new Promise(function(resolve, reject) {
        //Identify our select statement
        var query = "SELECT item_id, product_name, price FROM products";
        //Run our query
        connection.query(query, function (err, res, rows) {
            if (err) {
                console.log(err);
            }
            //Handle a successful resolution of our promise
            resolve(rows);
            //By looping through and displaying our results
            for (var i = 0; i < res.length; i++) {
                table = "Item Number: " + res[i].item_id + " || Product: " + res[i].product_name + " || Price: " + res[i].price;
                console.log(table);
            }
        });
    });
}

function buyStuff() {
    inquirer
        .prompt([
            {
                name: "product",
                type: "input",
                message: "Please type the number of the item you would like to purchase:"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many items would you like to purchase?"
            }])
        .then(function (answer) {
            checkStock(answer.product, answer.quantity);
        });
}

function checkStock(prod, quant) {
    //Check to see if we have enough in stock
    var query = "SELECT stock_quantity FROM products WHERE item_id = ?";
    connection.query (query, [prod] , function (err, res) {
        if (err) {
            console.log(err);
            return
        }

        var haveLeft = (res[0].stock_quantity);

        if (quant > haveLeft) {
            console.log("Insufficient Inventory. Please make another selection.");
            buyStuff();
        } else {
            console.log("We have " + haveLeft + " in stock!");
            inquirer
                .prompt(
                    {
                        name: "payme",
                        type: "list",
                        message: "Would you like to proceed with this purchase?",
                        choices: ["Yes", "No"]
                    })
                .then(function (answer) {
                    if (answer.payme === 'Yes') {

                        var query = "SELECT price FROM products WHERE item_id = ?";
                        connection.query(query, [prod], function (err, res) {
                            var price = res[0].price;
                            console.log("Your total is: $" + price * quant);
                            //Create an update statement to reduce stock by quantity
                        });

                        var query2 = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?";
                        connection.query(query2, [quant, prod], function (err, res) {
                        });


                    } else if (answer.payme === 'No') {
                        buyStuff();
                    }
                })
            }
        })
    }


