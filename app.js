
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const dotenv = require("dotenv").config()

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoUrl = process.env.MONGODB_CONNECT
var PORT = process.env.PORT

mongoose.connect(mongoUrl,{useNewUrlParser: true,useUnifiedTopology: true});

const itemSchema = ({
  name:String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item(
  {
    name:"welcome to ypur todolist!"
  }
);

const item2 = new Item({
  name : "hit hte + button to add a new item"
});

const item3 = new Item({
  name:"<-- hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find().then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
      .then(function(){
      console.log("inserted successfully");
      })
      .catch(function(err){
          console.log(err);
         });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    
  }).catch(function(err){
    console.log(err);
  });

});

app.get("/:newList",function(req,res){
  const newList = _.capitalize(req.params.newList);
  List.findOne({name:newList}).then(function(foundList){
   if(!foundList){
    // Create a new list
    const list =new List({
      name:newList,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+newList);
   }else{
    // Show a existed list
    res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
   }
  }).catch(function(err){
    console.log(err);
  });
 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listTitle === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listTitle}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listTitle);
    }).catch(function(err){
      console.log(err);
    });
  }

});

app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkbox;
  const listTitle = req.body.listTitle;

  if(listTitle === "Today"){
  Item.deleteOne({_id:checkedItemId}).then(function(){
    console.log("successdully deleted");
  }).catch(function(err){
    console.log(err);
  });
  res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:checkedItemId}}}).then(function(foundItem){
      res.redirect("/"+listTitle);
    });
  }

})

if(PORT=="" || PORT == "3000"){
  PORT = 3000
}
app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
});
