const { json2xml } = require("xml-js");
const {xml2json} = require("xml-js");
const xmlAppParser = require("express-xml-bodyparser");
let xmlParser = require('xml2json');

const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri =
  "mongodb+srv://JayceDB:yhlnSd5eupLkZ55N@cmps415.rfhvwh1.mongodb.net/?retryWrites=true&w=majority";

// --- This is the standard stuff to get it to work on the browser
const express = require("express");
const app = express();
const port = 3000;

app.listen(port);
console.log("Server started at http://localhost:" + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlAppParser());

// routes will go here

// Default route:
app.get("/", function (req, res) {
  const myquery = req.query;
  res.send(`<form method = "POST" action ="/rest/newticket">
    <label for="_id"> Id: </label>
    <input type="number" name="_id" placeholder="Id"> <br>

    <label for="createdAt"> Date Created: </label>
    <input type="date" name="createdAt" placeholder="Date Created"> <br>

    <label for="updatedAt"> Date Updated: </label>
    <input type = "date" name="updatedAt" placeholder="Date Updated"> <br>

    <label for="type"> Type: </label>
    <input type = "text" name="type" placeholder="Type"> <br>

    <label for="subject"> Subject: </label>
    <input type = "text" name="subject" placeholder="Subject"> <br>

    <label for="description"> Description: </label>
    <input type = "text" name="Description" placeholder="Description"> <br>

    <label for="priority"> Priority: </label>
    <input type = "text" name="priority" placeholder="Priority"> <br>

    <label for="status"> Status: </label>
    <input type = "text" name="status" placeholder="Status"> <br>

    <label for="recipient"> Recipient: </label>
    <input type = "email" name="recipient" placeholder="Recipient"> <br>

    <label for="submitter"> Submitter: </label>
    <input type = "email" name="submitter" placeholder="Submitter"> <br>

    <label for="assignee_ID"> Assignee Id: </label>
    <input type = "number" name="assignee_ID" placeholder="Assignee Id"> <br>

    <label for="follower_IDs"> Follower Ids: </label>
    <input type = "number" name="follower_IDs[]" placeholder="Follower Ids"> <br>

    <label for="tags"> Tags: </label>
    <input type = "text" name="tags[]" placeholder="Tags"> <br>
    
    
    <input type = "submit">
  </form>`);
});

app.get("/say/:name", function (req, res) {
  res.send("Hello " + req.params.name + "!");
});

// Get Ticket by Id
app.get("/rest/ticket/:id", function (req, res) {
  const client = new MongoClient(uri);

  const searchKey = "{ Ticket ID : '" + parseInt(req.params.id) + "' }";
  console.log("Looking for: " + searchKey);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const tickets = database.collection("Ticket");
      const searchId = req.params.id;

      if (searchId < 1) {
        return res.send("Invalid ID");
      }
      const queryInt = { _id: parseInt(searchId) };
      const ticket = await tickets.findOne(queryInt);
      if (ticket == null) {
        return res.send("Ticket not found");
      }
      console.log(ticket);
      res.send("Found this: " + JSON.stringify(ticket)); //Use stringify to print a json
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});

//Get All Tickets
app.get("/rest/list", function (req, res) {
  console.log("Looking for: All Tickets");
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      let results = await ticket.find({}).limit(50).toArray();
      res.send(JSON.stringify(results)).status(200);
    } finally {
      await client.close();
      console.log("No Tickets Found");
    }
  }
  run().catch(console.dir);
});
//Post Ticket
app.post("/rest/newticket/", function (req, res) {
  console.log("Posting Ticket: ");
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      //let newId = await ticket.find().sort( { _id : -1 } ).limit(1).toArray();

      if (req.body == null) {
        return res.send("Content cannot be null");
      }

      var newTicket = req.body;
      newTicket._id = parseInt(newTicket._id);

      //Can't input a time stamp but the Phase I doc requires it be a postable field. Therefore check if the time stamp is at least an integer

      await ticket.insertOne(newTicket);
      let result = newTicket;
      res.send(JSON.stringify(result)).status(204);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

app.patch("/rest/ticket/patch/:id", function (req, res) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      const searchId = req.params.id;
      const query = { _id: parseInt(searchId) };

      var updateTicket = {
        $set: {
          createdAt: req.body.createdAt,
          updatedAt: req.body.updatedAt,
          type: req.body.type,
          subject: req.body.subject,
          Description: req.body.Description,
          priority: req.body.priority,
          status: req.body.status,
          recipient: req.body.recipient,
          submitter: req.body.submitter,
          assignee_ID: req.body.assignee_ID,
          follower_IDs: req.body.follower_IDs,
          tags: req.body.tags,
        },
      };
      await ticket.updateOne(query, updateTicket);
      let result = await ticket.findOne(query);
      console.log(ticket);
      res.send(result).status(200);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});


app.delete("/rest/ticket/delete/:id", function (req, res) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      const searchId = req.params.id;

      if (searchId < 0) {
        res.send("Id must be greater than 0");
      }
      const query = { _id: parseInt(searchId) };

      if ((await ticket.findOne(query)) == null) {
        res.send("Ticket not found");
      }

      await ticket.deleteOne(query);
      res.send("Deleted").status(200);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});


class Target{
  request(JSON){}
}

class JsonAdaptee{
  convertXML(ticket){
    return json2xml(ticket, {compact: true, spaces: 4})
  }
}
class XmlAdaptee{
  convertXML(xml){
    //return xmlParser.toJson(xml);
    return JSON.parse(JSON.stringify(xml));
  }
}

class Adapter extends Target{
  constructor(adaptee){
    super();
    this.adaptee = adaptee;
  }
  request(ticket){
    return this.adaptee.convertXML(ticket);
  }
}


app.get("/rest/ticket/xml/:id", function (req, res) {
  const client = new MongoClient(uri);

  const searchKey = "{ Ticket ID : '" + parseInt(req.params.id) + "'}";

  async function run() {
    try {
      const database = client.db("CMPS415");
      const tickets = database.collection("Ticket");
      const searchId = req.params.id;
      
      const target = new Target();
      const adaptee = new JsonAdaptee();
      const adaptor = new Adapter(adaptee);

      if (searchId < 1) {
        return res.send("Invalid ID");
      }
      const queryInt = { _id: parseInt(searchId) };
      const ticket = await tickets.findOne(queryInt);
      if (ticket == null) {
        return res.send("Ticket not found");
      }
      
      const xmlTicket = adaptor.request(ticket);
      res.send("Found this: " + xmlTicket);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

app.patch("/rest/ticket/xml/patch/:id", function (req, res) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      const searchId = req.params.id;
      const query = { _id: parseInt(searchId) };

      const target = new Target();
      const adaptee = new XmlAdaptee();
      const adaptor = new Adapter(adaptee);

      let xml = req.body;
      let jsonTicket = {
        $set:
          adaptor.request(xml)  
      }
      
      await ticket.updateOne(query, jsonTicket);

      let result = await ticket.findOne(query);

      res.send(result).status(200);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});