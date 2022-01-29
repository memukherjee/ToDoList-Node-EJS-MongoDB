const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")
require('dotenv').config()

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const port = process.env.PORT

//Database Connection
mongoose.connect(`mongodb+srv://memukherjee:${process.env.MONGOPASS}@cluster0.t2p2k.mongodb.net/todolistDB`);
console.log("Connected successfully to server");
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

let day = date.getDate();

app.get("/", (req, res) => {
  Item.find((err, items) => {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          console.log(err ? err : "Insertion of default items successful");
        });
        res.redirect("/");
      } else {
        console.log("render successful");
        res.render("list", { listTitle: day, list: items });
      }
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  let title = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (title === day) {
    item.save();
    console.log("item saved, redirecting to /");
    res.redirect("/");
  } else {
    title = _.capitalize(title)
    List.findOne({ name: title }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      console.log("item saved, redirecting to /" + title);
      res.redirect("/" + title);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.check;
  let listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      console.log(err ? err : "item deleted");
    });
    res.redirect("/");
  } else {
    listName = _.capitalize(listName)
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, list) => {
        if(err){
          console.log(err);
        }
        else{
          res.redirect("/"+listName)
        }
    });
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/:id", (req, res) => {
  let title = _.capitalize(req.params.id)
  List.findOne({ name: title }, (err, list) => {
    if (err) console.log(err);
    else {
      if (!list) {
        const list = new List({
          name: title,
          items: defaultItems,
        });
        
        console.log("new list created");
        list.save();
        res.redirect(`/${title}`);
      } else {
        if(list.items.length===0){
          console.log(list.items.length);
          List.collection.drop()
          res.redirect(`/${title}`);
        }
        else{
          console.log("already created list");
          res.render("list", { listTitle: title, list: list.items });
        }
      }
    }
  });
});

app.listen(port, () => {
  console.log("Server started at port " + port);
});
