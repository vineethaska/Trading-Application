const model = require ('../models/items');
const watchList = require('../models/watchList');

exports.index = (req,res,next)=>{                
    model.find()
    .then((stories)=>{
        res.render('./story/trades',{stories});
    })
    .catch((err)=>{
        next(err);
    })
};

exports.new = (req,res)=>{
    res.render('./story/newTrade');
};

exports.create = (req,res,next)=>{
    let story= new model(req.body);
    story.author = req.session.user;
    story.save()
    .then((tradeStory)=>{
        console.log('trade created', tradeStory);
      req.flash('success', 'You have successfully created a new trade');
        res.redirect('/stories');
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            err.status = 400;
        }
        next(err);
    });
};

exports.show = (req,res,next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid  story Id value  ' + id);
        err.status = 400;
        next(err);
    }
    model.findById(id)
    .populate('author', 'firstName lastName')
    .then((story)=>{
        if(story){
            res.render('./story/trade',{story});
         }else {
          let error = new Error('No story found with id  ' + id);
          error.status = 404;
          next(error);
         } 
    })
    .catch((err)=>{
        next(err);
    })
  
    
};

exports.edit = (req,res,next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid  story Id value  ' + id);
        err.status = 400;
        next(err);
    }
    model.findById(id)
    .then((story)=>{
        if(story){
            res.render('./story/edit',{story});
        }
        else{
            let error = new Error('No story found with id  ' + id);
            error.status = 404;
            next(error);
        }
    })
    .catch((err)=>{
        next(err);
    })
    
};
    //res.send('send the edited content');

exports.update = (req,res,next)=> {
    let story = req.body;
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
     let err = new Error('Invalid  story Id value  ' + id);
     err.status = 400;
     next(err);
 }
     model.findByIdAndUpdate(id,story,{useFindAndModify:false, runValidators:true})
     .then((story)=>{
         if(story){
             res.redirect('/stories/'+id);
            }else{
             let error = new Error('No story found with id  ' + id);
             error.status = 404;
             next(error);
            }
     })
     .catch(err=>{
         if(err.name === 'ValidationError'){
             err.status = 400;
         }
         next(err);
     });
    
 };
    //console.log(story);

exports.delete = (req,res,next)=> {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
     let err = new Error('Invalid  story Id value  ' + id);
     err.status = 400;
     next(err);
 };
    model.findByIdAndDelete(id,{useFindAndModify:false})
    .then((story)=>{
     if(story){
         res.redirect('/stories');
     }
     else{
       let error = new Error('No story found with id  ' + id);
       error.status = 404;
       next(error);
     }
    })
    .catch(err=>{
     next(err);
 });       
 };

 exports.watchList = (req, res, next) => {
    let requestUser = req.session.user;
    let id = req.params.id;
  
    watchList
      .find({ user: requestUser, trade: id })
      .then((watch) => {
        if (watch.length) {
          req.flash('error', 'trade is already added to watchlist');
          res.redirect('back');
        } else {
          let watch = new watchList();
          watch.user = requestUser;
          watch.trade = id;
          watch
            .save()
            .then((watch) => {
              if (watch) {
                req.flash('success', 'Successfully added to watchList for this trade!');
                res.redirect('/agro/profile');
              } else {
                req.flash('error', 'There was an error');
              }
            })
            .catch((err) => {
              if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('back');
              } else {
                next(err);
              }
            });
        }
      })
      .catch((err) => next(err));
  };
  
  exports.deletewatchList = (req, res, next) => {
    let id = req.params.id;
    watchList
      .findOneAndDelete({ user: req.session.user, trade: id })
      .then((watchList) => {
        if (watchList) {
          req.flash('success', 'trade has been sucessfully removed from watchlist!');
          res.redirect('/agro/profile');
        } else {
          let err = new Error('Cannot find an watchList with id ' + id);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  };
  
  exports.updateStatus = (req, res, next) => {
    let ownItem = req.body;
    // others item
    let otherItemsId = req.params.id;
    let tradingUser = req.session.user;
  
    Promise.all([model.findById(ownItem.trade), model.findById(otherItemsId)])
      .then((results) => {
        const [ownItem, otherItem] = results;
        ownItem.status = 'Offer Pending';
        ownItem.save();
  
        otherItem.status = 'Offer Pending';
        otherItem.tradeWith = ownItem._id;
        otherItem.save();
        res.redirect('/agro/profile');
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  };
  
 
