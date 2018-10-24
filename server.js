var cheerio = require('cheerio');
var request = require('request');

// var path = require('path');

var express = require('express');
var mongojs = require('mongojs');

// var webscrape = require('./public/newsscrape.js');
var model = require('./public/model.js');

var app = express();

// app.use(express.static(path.join(__dirname, './public')));
app.use(express.static("public"));
// request.body parser
app.use(express.urlencoded({extended: true}))

var dbUrl = 'legalNews_db'
var collections = ['news']

// Hook mongojs configuration to the db variable
var db = mongojs(dbUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.get('/news', async function(req, res) {  
 
  res.json(await model.getAll(db));  
  
})

app.get('/scrapeNews', async function(req, res) {  
function webscrape() {
  return new Promise(function(resolve,reject) {
    request("https://www.law.com", function(error, response, html) {
      if (error) {
        console.log(error)
        return reject(error)
      }

      var $ = cheerio.load(html)
      var stories = [] 
      // console.log(html);
      $("div.brief").each(function(i, element) {
        stories.push( {
        storyid: $(element).attr('id'),
        headline: $(element).children("h4.article-title").text(),
        link: $(element).find("h4.article-title").find("a").attr("href"),          
        date: $(element).children("p.sub").text(),
        summary: $(element).children("p.deck").text()     
             
        } )
      })
      return resolve(stories)
      console.log(stories);
    })
    
  })
}
webscrape();

var stories = await webscrape();  
model.saveAll( db, stories );
// res.json(await model.getAll(db));  
res.redirect('/');
});
  
//read story
app.get('/story/:id', async function(req, res) { 
  
  res.json(await model.get(db, req.params.id));

 });
 
 // create a comment
 app.post('/comment/:id', async function(req, res) { 
   res.json(await model.saveComment(db, req.params.id, req.body.comment))
 });


 // deleting a comment
app.delete('/comment/:id', async function(req, res) {  
  res.json(await model.deleteComment(db, req.params.id, req.body.commentId))
})

app.get("/delete/:id", function(req, res) {
  // Remove a note using the objectID
  db.news.remove(
    {
      _id: mongojs.ObjectID(req.params.id)
    },
    function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
        // res.redirect('/');
      }
    }
  );
});


app.listen(3000, 'localhost', function(){
  console.log('Listening on port localhost:3000')
})
