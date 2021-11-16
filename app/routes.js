module.exports = function (app, passport, db, multer, ObjectId) {

  // Image Upload Code =========================================================================
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  var upload = multer({ storage: storage });
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    //at some point, we need to be finding from the database that shows the saved posts and topcis of each user, but for now it will jsut find the postings. 
    db.collection('chatSubmitted').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        chatSubmitted: result
      })
    })
  });


  // Submit Housing Post=========================
  app.get('/submitHousingPost', isLoggedIn, function (req, res) {
    res.render('submitHousingPost.ejs',
      { user: req.user })
  });
  // get the housing post feed =========================
  app.get('/housingPostFeed', isLoggedIn, function (req, res) {
    //limit it to your zipcode asp
    console.log(req.user.zipcode)
    db.collection('housingPost').find({zipcode: req.user.zipcode }).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('housingPostFeed.ejs', {
        user: req.user,
        housingPosts: result
      })
    })
  });
  // // get individual Housing Post=========================
  // app.get('/housingPost', isLoggedIn, function (req, res) {
  //   res.render('housingPost.ejs',
  //     { user: req.user })
  // });

  // get individual Housing Post=========================
  app.get('/housingPost', isLoggedIn, function (req, res) {
    
    let postId = req.query.id
    console.log('postid =', postId, req)
    db.collection('housingPost').findOne({_id: ObjectId(postId)}, (err, result) => {
      if (err) return console.log(err)
      res.render('housingPost.ejs', {
        user: req.user,
        housingPost: result
      })
    })
  });

  // Submit Topic=========================
  app.get('/submitTopic', isLoggedIn, function (req, res) {
    res.render('submitTopic.ejs',
      { user: req.user })
  });
  // get topic page=========================
  // app.get('/topicPost', isLoggedIn, function (req, res) {
  //   res.render('topicPost.ejs',
  //     { user: req.user })
  // });
  // get topic page=========================
  app.get('/topicFeed', isLoggedIn, function (req, res) {
    db.collection('topic').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('topicFeed.ejs', {
        user: req.user,
        topic: result
      })
    })
  });
  app.get('/topicPost', isLoggedIn, function (req, res) {
    let postId = req.query.id
    console.log('postid =', postId, req)
    db.collection('topic').findOne({_id: ObjectId(postId)}, (err, result) => {
      if (err) return console.log(err)
      res.render('topicPost.ejs', {
        user: req.user,
        topic: result
      })
    })
  });
  //make topic post feed
  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  //chat postings

  //  app.post('/chatSubmitted', (req, res) => {
  //     db.collection('chatSubmitted').save({ name: req.body.name, title: req.body.title, msg: req.body.msg, datePostedBy: new Date(req.body.datPostdBy), neighborhood: req.body.neighborhood, thumbUp: 0, thumbDown: 0 }, (err, result) => {
  //       if (err) return console.log(err)
  //       console.log('saved to database')
  //       res.redirect('/profile')
  //       // this ejs file will haave to be the page where the post is individuall going to be shown. 
  //     })
  //   })

  // housing oist route board routes ===============================================================

  app.post('/topicPost', isLoggedIn, (req, res) => {
    db.collection('topic').save({ userName: req.user.userName,
      userId: req.user._id, 
      zipcode: req.body.zipcode, 
      city: req.body.city, 
      neighborhood: req.body.neighborhood,
      title: req.body.title, 
      aboutPosting: req.body.aboutPosting, 
      datePostedBy: new Date(req.body.datePostedBy) }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/topicFeed')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
    })
  })

  // post route for housing post

  app.post('/submitHousingPost', isLoggedIn, (req, res) => {
    console.log(req.user)
    db.collection('housingPost').save({ userName: req.user.userName,
      userId: req.user._id, 
      zipcode: req.body.zipcode, 
      city: req.body.city, 
      neighborhood: req.body.neighborhood,
      title: req.body.title, 
      housingType: req.body.housingType, 
      aboutPosting: req.body.aboutPosting, 
      datePostedBy: new Date(req.body.datePostedBy) }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/housingPostFeed')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
    })
  })
  // post route for chat submitted

  app.post('/chatSubmitted', isLoggedIn, (req, res) => {
    console.log(req.user)
    db.collection('chatSubmitted').save({ userName: req.user.userName, userId: req.user._id, title: req.body.title, msg: req.body.msg, datePostedBy: new Date(req.body.birthday) }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
      // this ejs file will haave to be the page where the post is individuall going to be shown. 
    })
  })

  // app.put('/messages', (req, res) => {
  //   db.collection('messages')
  //     .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
  //       $set: {
  //         thumbUp: req.body.thumbUp + 1
  //       }
  //     }, {
  //       sort: { _id: -1 },
  //       upsert: true
  //     }, (err, result) => {
  //       if (err) return res.send(err)
  //       res.send(result)
  //     })
  // })

  app.delete('/delete', (req, res) => {
    db.collection('topic').findOneAndDelete({ _id: ObjectId(req.body.id)}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  app.delete('/deleteHousing', (req, res) => {
    db.collection('housingPost').findOneAndDelete({ _id: ObjectId(req.body.id)}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })


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
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    // successRedirect : '/profile', // redirect to the secure profile section

    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), function (req, res) { //doing more after passport creates req.user properties other than email and password
    console.log('bday',req.body.birthDate)
    db.collection('users')
      .findOneAndUpdate({ _id: req.user._id }, {
        $set: {
          userName: req.body.userName,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          address: req.body.address,
          city: req.body.city,
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
