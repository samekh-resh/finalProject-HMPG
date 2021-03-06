module.exports = function (app, passport, db, ObjectId, neighborhoods, zipcodes) {

  const fs = require('fs');
  const path = require('path');

  const multer = require('multer')
  // Image Upload Code =========================================================================
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  let upload = multer({ storage: storage });
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

 

  //route to render map 

  app.get('/map', isLoggedIn, function (req, res) {
    //limit it to your zipcode asp
    console.log(req.user.zipcode)
    db.collection('housingPost').find().toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('map.ejs', {
        user: req.user,
        housingPosts: result
      })
    })
  });


  //get locations so that they can render on the map

  // for save page
  app.get('/save', isLoggedIn, async function (req, res) {

    //retrieving housing posts
    const housingRes = await
      db.collection('housingPost').find({
        interestedUsers: ObjectId(req.user.id)
      }).toArray();

    //retrieving topics
    const topicRes = await
      db.collection('topic').find({
        interestedUsers: ObjectId(req.user.id)
      }).toArray();

    res.render('saved.ejs', {
      user: req.user,
      housingPosts: housingRes,
      topic: topicRes
    })
  });

  app.get('/locations', isLoggedIn, async function (req, res) {

    //retrieving housing posts
    const housingRes = await
      db.collection('housingPost').find().toArray();

    //retrieving topics
    const topicRes = await
      db.collection('topic').find().toArray();


    res.send({
      user: req.user,
      housingPosts: housingRes,
      topic: topicRes
    })
  });


  app.get('/profile', isLoggedIn, async function (req, res) {

    //retrieving housing posts
    const chatRes = await
      db.collection('chatSubmitted').findOne({ userId: ObjectId(req.user._id) });

    //retrieving topics
    let userString = req.user._id.toString()
    const userOffersRes = await
      db.collection('userOffers').find({ intendedFor: userString }).toArray();
    console.log('user offers', userOffersRes)
    console.log('user\'s id', req.user._id)
    res.render('profile.ejs', {
      user: req.user,
      chatSubmitted: chatRes ? chatRes : { userId: 0 },
      userOffers: userOffersRes
    })
  });




  app.get('/otherUserProfile/:id', isLoggedIn, async function (req, res) {
    // let id = new ObjectId(req.params.id)
    // console.log( 'this is the id', id)
    //retrieving housing posts
    const userRes = await
      db.collection('users').find({ _id: ObjectId(req.params.id) })

    //retrieving topics
    const chatRes = await
      db.collection('chatSubmitted').findOne({ userId: ObjectId(req.params.id) })
    // console.log(userRes, chatRes)
    res.render('otherUserProfile.ejs', {
      user: userRes,
      loggedInUser: req.user,
      chat: chatRes
    })
  });

  // Submit Housing Post=========================
  app.get('/submitHousingPost', isLoggedIn, function (req, res) {
    res.render('submitHousingPost.ejs',
      {
        user: req.user,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
  });
  // get the housing post feed =========================
  app.get('/housingPostFeed', isLoggedIn, function (req, res) {
    //limit it to your zipcode asp
    console.log(req.user.zipcode)
    db.collection('housingPost').find({ zipcode: req.user.zipcode }).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('housingPostFeed.ejs', {
        user: req.user,
        housingPosts: result,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
    })
  });

  //post request for zipcodes for topic posts
  app.post('/zipcodesTopic', isLoggedIn, (req, res) => {
    console.log(req.body)
    //the following code is clean up 
    // saying: if req.body.zipcodes is undefined, we will return an empty array, and IF it is defined, we will check to see if req.body.zipcodes is an array. if it is an array, we say; fine, let's just pass it through, however, if it is not one (for the edge case of one zipcode selected) we will make it an array but putting it in brackets and returning that. 
    let zipcodeSearch = req.body.zipcodesTopic === undefined ? [] : Array.isArray(req.body.zipcodesTopic) ? req.body.zipcodesTopic : [req.body.zipcodesTopic]
    db.collection('topic').find(
      {
        zipcode: {
          $in: zipcodeSearch
          //had to change this naming because it was interfering
          //having one selection doesn't give us an array but having two gibes us an array, and the $in operator needs that 
        }
      }
    ).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('topicFeed.ejs', {
        user: req.user,
        topic: result,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
    })
  })

  //post for getting zipcodes for housing posts
  app.post('/zipcodesHousing', isLoggedIn, (req, res) => {
    console.log(req.body)
    //the following code is clean up 
    // saying: if req.body.zipcodes is undefined, we will return an empty array, and IF it is defined, we will check to see if req.body.zipcodes is an array. if it is an array, we say; fine, let's just pass it through, however, if it is not one (for the edge case of one zipcode selected) we will make it an array but putting it in brackets and returning that. 
    let zipcodeSearch = req.body.zipcodesHousing === undefined ? [] : Array.isArray(req.body.zipcodesHousing) ? req.body.zipcodesHousing : [req.body.zipcodesHousing]
    db.collection('housingPost').find(
      {
        zipcode: {
          $in: zipcodeSearch
          //had to change this naming because it was interfering
          //having one selection doesn't give us an array but having two gibes us an array, and the $in operator needs that 
        }
      }
    ).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('housingPostFeed.ejs', {
        user: req.user,
        housingPosts: result,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
    })
  })

  // route to get posts via neighborhoods for housing
  app.post('/neighorhoodsHousing', isLoggedIn, (req, res) => {
    console.log(req.body)
    //the following code is clean up 
    // saying: if req.body.zipcodes is undefined, we will return an empty array, and IF it is defined, we will check to see if req.body.zipcodes is an array. if it is an array, we say; fine, let's just pass it through, however, if it is not one (for the edge case of one zipcode selected) we will make it an array but putting it in brackets and returning that. 
    let neighborhoodSearch = req.body.neighorhoodsHousing === undefined ? [] : Array.isArray(req.body.neighorhoodsHousing) ? req.body.neighorhoodsHousing : [req.body.neighorhoodsHousing]
    db.collection('housingPost').find(
      {
        neighborhood: {
          $in: neighborhoodSearch
          //had to change this naming because it was interfering
          //having one selection doesn't give us an array but having two gibes us an array, and the $in operator needs that 
        }
      }
    ).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('housingPostFeed.ejs', {
        user: req.user,
        housingPosts: result,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
    })
  })

  //get route for topic neighborhoods
  app.post('/neighborhoodsTopic', isLoggedIn, (req, res) => {
    console.log(req.body)
    //the following code is clean up 
    // saying: if req.body.zipcodes is undefined, we will return an empty array, and IF it is defined, we will check to see if req.body.zipcodes is an array. if it is an array, we say; fine, let's just pass it through, however, if it is not one (for the edge case of one zipcode selected) we will make it an array but putting it in brackets and returning that. 
    let neighborhoodSearch = req.body.neighborhoodsTopic === undefined ? [] : Array.isArray(req.body.neighborhoodsTopic) ? req.body.neighborhoodsTopic : [req.body.neighborhoodsTopic]
    db.collection('topic').find(
      {
        neighborhood: {
          $in: neighborhoodSearch
          //had to change this naming because it was interfering
          //having one selection doesn't give us an array but having two gibes us an array, and the $in operator needs that 
        }
      }
    ).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('topicFeed.ejs', {
        user: req.user,
        topic: result,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
    })
  })

  // get individual Housing Post=========================
  app.get('/housingPost', isLoggedIn, function (req, res) {

    let postId = req.query.id
    console.log('postid =', postId, req)
    db.collection('housingPost').findOne({ _id: ObjectId(postId) }, (err, result) => {
      if (err) return console.log(err)
      db.collection('comments').find({ postId: ObjectId(postId) }).toArray((err, comments) => {
        if (err) return console.log(err)
        console.log(result)
        res.render('housingPost.ejs', {
          comments: comments,
          user: req.user,
          housingPost: result
        })
      })
    })
  });

  // comments for housing posts routes
  app.post('/makeComment/:id', (req, res) => {
    let user = req.user.userName
    db.collection('comments').save({ comment: req.body.comment, postedBy: user, postedById: req.user._id, postId: ObjectId(req.params.id) }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(`/housingPost?id=${req.params.id}`)
    })
  })

  //comments for topic post
  app.post('/makeCommentTopic/:id', (req, res) => {
    let user = req.user.userName
    db.collection('comments').save({ comment: req.body.comment, postedBy: user, postedById: req.user._id, postId: ObjectId(req.params.id) }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(`/topicPost?id=${req.params.id}`)
    })
  })

  // Submit Topic=========================
  app.get('/submitTopic', isLoggedIn, function (req, res) {
    res.render('submitTopic.ejs',
      {
        user: req.user,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
  });

  // get topic page=========================
  app.get('/topicFeed', isLoggedIn, function (req, res) {
    db.collection('topic').find({ zipcode: req.user.zipcode }).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('topicFeed.ejs', {
        user: req.user,
        topic: result,
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      })
    })
  });

  app.get('/topicPost', isLoggedIn, function (req, res) {

    let postId = req.query.id
    console.log('postid =', postId, req)
    db.collection('topic').findOne({ _id: ObjectId(postId) }, (err, result) => {
      if (err) return console.log(err)
      db.collection('comments').find({ postId: ObjectId(postId) }).toArray((err, comments) => {
        if (err) return console.log(err)
        console.log(result)
        res.render('topicPost.ejs', {
          comments: comments,
          user: req.user,
          topic: result
        })
      })
    })
  });



  // housing oist route board routes ===============================================================

  app.post('/topicPost', isLoggedIn, (req, res) => {
    db.collection('topic').save({
      userName: req.user.userName,
      userId: req.user._id,
      zipcode: req.body.zipcode,
      city: req.body.city,
      neighborhood: req.body.neighborhood,
      title: req.body.title,
      aboutPosting: req.body.aboutPosting,
      datePostedBy: new Date(req.body.datePostedBy)
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/topicFeed')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
    })
  })

  app.post('/offers', isLoggedIn, (req, res) => {
    db.collection('userOffers').save({
      intendedFor: req.body.intendedFor,
      postedBy: req.body.postedBy,
      userEmail: req.body.userEmail,
      userName: req.body.userName,
      offersSent: req.body.offersSent,
      contact: req.body.contact,
      datePostedBy: new Date(req.body.datePostedBy)
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
      //trying it with a res.render
    })
  })

  // post route for housing post

  app.post('/submitHousingPost', isLoggedIn, upload.single('file-to-upload'), (req, res) => {
    console.log(req.file)
    const picData = fs.readFileSync(path.join(__dirname + '/../public/images/uploads/' + req.file.filename))
    console.log(path.join(__dirname + '/../public/images/uploads/' + req.file.filename))
    db.collection('housingPost').save({
      userName: req.user.userName,
      fullAddress: req.body.fullAddress,
      userId: req.user._id,
      zipcode: req.body.zipcode,
      city: req.body.city,
      neighborhood: req.body.neighborhood,
      title: req.body.title,
      housingType: req.body.housingType,
      aboutPosting: req.body.aboutPosting,
      img: req.file ? picData : null,
      //something going on with not being able to send no image
      datePostedBy: new Date(req.body.datePostedBy)
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/housingPostFeed')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
    })
  })
  // post route for chat submitted

  app.post('/chatSubmitted', isLoggedIn, (req, res) => {
    console.log(req.user)
    db.collection('chatSubmitted').save({
      userId: req.user._id,
      userName: req.user.userName,
      housingStatus: req.body.housingStatus,
      datePostedBy: new Date(req.body.datePostedBy)
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
    })
  })
  //saving housoing post

  app.put('/saveHousing', isLoggedIn, (req, res) => {

    db.collection('housingPost')
      .findOneAndUpdate({ _id: ObjectId(req.body.postId) }, {
        $addToSet: {
          interestedUsers: ObjectId(req.user.id)
        }
      }, {
        sort: { _id: -1 },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })
  //saving topic post

  app.put('/saveTopic', isLoggedIn, (req, res) => {

    db.collection('topic')
      .findOneAndUpdate({ _id: ObjectId(req.body.postId) }, {
        $addToSet: {
          interestedUsers: ObjectId(req.user.id)
        }
      }, {
        sort: { _id: -1 },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.put('/unsaveHousing', isLoggedIn, (req, res) => {

    db.collection('housingPost')
      .findOneAndUpdate({ _id: ObjectId(req.body.postId) }, {
        $pull: {
          interestedUsers: ObjectId(req.user.id)
        }
      }, {
        sort: { _id: -1 },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.put('/unsaveTopic', isLoggedIn, (req, res) => {

    db.collection('topic')
      .findOneAndUpdate({ _id: ObjectId(req.body.topicId) }, {
        $pull: {
          interestedUsers: ObjectId(req.user.id)
        }
      }, {
        sort: { _id: -1 },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.delete('/delete', isLoggedIn, (req, res) => {
    db.collection('topic').findOneAndDelete({ _id: ObjectId(req.body.id) }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  app.delete('/deleteHousing', isLoggedIn, (req, res) => {
    db.collection('housingPost').findOneAndDelete({ _id: ObjectId(req.body.id) }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })
  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs',
      {
        message: req.flash('signupMessage'),
        neighborhoods: neighborhoods,
        zipcodes: zipcodes
      });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    // successRedirect : '/profile', // redirect to the secure profile section

    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), function (req, res) { //doing more after passport creates req.user properties other than email and password
    console.log('bday', req.body)
    db.collection('users')
      .findOneAndUpdate({ _id: req.user._id }, {
        $set: {
          userName: req.body.userName,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          address: req.body.address,
          city: req.body.city,
          neighborhood: req.body.neighborhood,
          zipcode: req.body.zipcode,
          state: req.body.state,
          birthDate: new Date(req.body.birthDate)
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        res.redirect('/profile')
      })
  });

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
