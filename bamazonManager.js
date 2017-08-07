var mysql = require("mysql");
var inquirer = require("inquirer");
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
});

var Manage = function manageInventory() {
    inquirer
        .prompt(
            {
                name: "options",
                type: "list",
                message: "What would you like to do?",
                choices: ["View Products","View Low Inventory","Add to Inventory", "Add New Product"]
            })
    .then(function (answer){
        if (answer.options === "View Products") {
            viewProducts();
        } else if (answer.options === "View Low Inventory") {
            lowInventory();
        } else if (answer.options === "Add to Inventory") {
            addInventory();
        } else if (answer.options === "Add New Product") {
            newProduct();
        }
    });
}

function viewProducts() {
    var query = "SELECT item_id, product_name, price FROM products";
    connection.query(query, function (err, res){
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < res.length; i++) {
            var table = "Item Number: " + res[i].item_id + " || Product: " + res[i].product_name + " || Price: " + res[i].price;
            console.log(table);
        }
    });
}

function lowInventory() {
    var query = "SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 300";
    connection.query(query, function (err, res){
       if (err) {
           console.log(err);
       }
       for (var i=0; i < res.length; i++) {
           var stock = "Item Number: " + res[i].item_id + " || Product: " + res[i].product_name + " || In Stock: " + res[i].stock_quantity;
           console.log(stock);
       }
    });

}

function addInventory() {
    inquirer
        .prompt(
            [{
                name: "add",
                type: "input",
                message: "Which product would you like to restock?"
            },
            {
                name: "stock",
                type: "input",
                message: "How many units would you like to add?"
            }])
        .then(function (answer){
           addUnits(answer.stock, answer.add);

        });
    // var query = UPDATE products SET
}


function addUnits(stock, prod) {
    var query2 = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?";
    connection.query(query2, [stock, prod], function(err, res){
    });

    var query3 = "SELECT item_id, product_name, stock_quantity FROM products where item_id = ?";
    connection.query(query3, [prod], function(err,res){
        console.log("Amont of " + res[0].product_name + " currently in stock is: " + res[0].stock_quantity);
    })

}

function newProduct() {
    inquirer
        .prompt([
            {
                name: "new",
                type: "input",
                message: "What is the name of the new product?"
            },
            {
                name: "department",
                type: "input",
                message: "To which department does it belong?"
            },
            {
                name: "price",
                type: "input",
                message: "What is the price of the item?"
            },
            {
                name: "inventory",
                type: "input",
                message: "How many are in stock?"
            }])
        .then(function(answer){
           var query4 = "INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)";
               connection.query(query4, [answer.new, answer.department, answer.price, answer.inventory], function(err, res){
               });

           var query5 = "SELECT * from products where product_name = ?";
               connection.query(query5, [answer.new], function(err, res){
                  var newProd = "Item Number: " + res[0].item_id + " || Product: " + res[0].product_name +
                      " || Department: " + res[0].department_name + " || Price: " + res[0].price +
                      " || In Stock: " + res[0].stock_quantity;
                  console.log("New Item: " + newProd);
               })

        });
}

module.exports = Manage;