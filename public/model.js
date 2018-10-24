var mongojs = require('mongojs');

// var cheerio = require('cheerio');
// var request = require('request');


// function webscrape() {
//   return new Promise(function(resolve,reject) {
//     request("https://www.law.com", function(error, response, html) {
//       if (error) {
//         console.log(error)
//         return reject(error)
//       }

//       var $ = cheerio.load(html)
//       var stories = [] 
//       // console.log(html);
//       $("div.brief").each(function(i, element) {
//         stories.push( {
//         storyid: $(element).attr('id'),
//         headline: $(element).children("h4.article-title").text(),
//         link: $(element).find("h4.article-title").find("a").attr("href"),          
//         date: $(element).children("p.sub").text(),
//         summary: $(element).children("p.deck").text()     
             
//         } )
//       })
//       return resolve(stories)
//       console.log(stories);
//     })
    
//   })
// }
// webscrape();

function saveStory( db, story ) {
  return new Promise(function(resolve,reject) {
    db.news.update(
      {headline: story.headline},  
      {$setOnInsert: 
        {
          storyid: story.storyid,
          headline: story.headline,
          link: story.link,
          authorProLink: story.authorProLink,
          date: story.date,
          summary: story.summary,     
          
        }
      },
      {upsert: true}, 
      function(error, value){
        if (error) {
          console.log(error)
          return reject(error)
        }

        return resolve()
      }
    )
  })
}

function saveAll( db, stories ) {
  stories.forEach( async function(story) {
    try {
      await saveStory( db, story )
    } catch (error) {
      console.log(error)
    }
  })
}

function getAll( db ) {
  return new Promise(function(resolve,reject) {
    db.news.find().sort({ _id:-1 },
      function(error,value){
      if (error) {
        console.log(error)
        return reject(error)
      }
      return resolve(value)
    })
  })
}

function get( db, id ) {
  return new Promise(function(resolve,reject) {
    db.news.findOne(
      {_id: mongojs.ObjectId(id)},
      function(error,value){
        if (error) {
          console.log(error)
          return reject(error)
        }
        return resolve(value)
      })
    }
  )
}

function saveComment( db, id, comment ) {
  return new Promise(function(resolve,reject) {
    db.news.update(
      {_id: mongojs.ObjectID(id)},  
      { $push: 
        { comments: 
          {
            _id: mongojs.ObjectId(),
            user: 'anonymous', 
            comment: comment
          }
        }
      },
      function(error, value){
        if (error) {
          console.log(error)
          return reject(error)
        }

        return resolve(value)
      }
    )
  })  
}

function deleteComment(db, storyId, commentId) {
  return new Promise(function(resolve,reject) {
    db.news.update(
      {_id: mongojs.ObjectId(storyId)},  
      { $pull: 
        { comments: 
          {
            _id: mongojs.ObjectId(commentId)
          }
        }
      },
      function(error, value){
        if (error) {
          console.log(error)
          return reject(error)
        }

        return resolve(value)
      }
    )
  })
}

module.exports = { saveAll, getAll, get, saveComment, deleteComment };