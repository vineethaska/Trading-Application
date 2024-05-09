const express = require('express');
const model = require('../models/user');
const item = require('../models/items');
const watchList = require('../models/watchList');
const bcrypt = require('bcrypt');

exports.index = (req, res, next) => {
    model.find()
        .then(connections => res.render('./views/index', { connections }))
        .catch(err => next(err));
};

exports.about = (req, res) => {
    res.render('about');
};

exports.contact = (req, res) => {
    res.render('contact');
};

exports.login = (req, res) => {
    console.log("in login function");
    res.render("./user/login");
  };
exports.authenticate = (req, res, next) => {
    console.log("in authenticate function");
    //authincate user's login details
    let email = req.body.email;
    let password = req.body.password;
    console.log("email is " + email);
    console.log("pwd is " + password);
    model.findOne({ email: email })
        .then((user) => {
            if (user) {
                console.log("beofre compare password");
                user.comparePassword(password)
                    .then((result) => {
                        if (result) {
                            req.session.user = user._id;// storing user info
                            req.flash('success', 'you have successfully logged in');
                            res.redirect('/agro/profile');
                        } else {
                            //console.log("wrong pwd");
                            req.flash('error', 'wrong password');
                            res.redirect('/agro/login');
                        }
                    })
            } else {
                // console.log('wrong email');
                req.flash('error', 'No account found with this Email!! Please Signup');
                res.redirect('/agro/login');
            }
        })
        .catch((err) => {
            next(err);
        });
}

exports.signup = (req, res) => {
    console.log("in signup function");
    res.render('./user/signup');
};

exports.create = (req, res, next) => {
    console.log("in create function");
    let body = new model(req.body);

    body.save()
        .then(() => {
            req.flash('success', 'You have successfully registered');
            res.redirect('/agro/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/agro/signup');
            }
            if (err.code === 11000) {
                req.flash('error', 'Email has been used');
                res.redirect('/agro/signup');
            }
            next(err);
        })
}

exports.msg = (req, res) => {
    res.render('message');
};

exports.profile = (req, res, next) => {
    console.log("in profile function");
    let id = req.session.user;
    let pendingTradeIds = [];
    item
        .find({ author : id, status: 'Offer Pending' })
        .then((pendingTrades) => {
            return (pendingTradeIds = pendingTrades.map((pt) => pt._id.toString()));
        })
        .then(async (response) => {
            const results = await Promise.all([
                model.findById(id), 
                item.find({ author: id }),
                watchList.find({ user: id }).populate('trade'),
                item.find({ tradeWith: { $in: response } }),
            ])
            const [user, stories, watchLists, myOffers] = results;
            console.log(user,"this are the stiries", stories,"this are the watchlist", watchLists,"this are the myOffer", myOffers);
            res.render('./user/profile', { user, stories, watchLists, myOffers });
        })
        .catch((err) => {
            next(err);
        })
}


exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err)
            return next(err);
        else
            res.redirect('/');
    })
}

exports.trades = (req, res, next) => {
  let itemToTrade = { id: req.params.id };
  let id = req.session.user;
  Promise.all([model.findById(id), item.find({ author: id, status: 'Available' })])
    .then((results) => {
      const [user, stories] = results;
      console.log("vineeth ", user,"this are the in trade stiries", stories);
      res.render('./user/trade', { user, stories, itemToTrade });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.offer = (req, res, next) => {
  let tradeId = req.params.id;
  item
    .findOne({ tradeWith: tradeId })
    .then(async (othersTrade) => {
      item
        .findById(othersTrade.tradeWith)
        .then((ownTrade) => {
          res.render('./user/offer', { ownTrade, othersTrade });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

// manage own offer
exports.ownoffer = (req, res, next) => {
  let tradeId = req.params.id;
  item
    .findById(tradeId)
    .then(async (ownTrade) => {
      item
        .findById(ownTrade.tradeWith)
        .then((othersTrade) => {
          res.render('./user/offer', { othersTrade, ownTrade });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.cancelOffer = (req, res, next) => {
  let tradeIds = req.params.id.split('&');
  let othersTradeId = tradeIds[0];
  let ownTradeId = tradeIds[1];

  item
    .findByIdAndUpdate(
      othersTradeId,
      {
        $unset: {
          tradeWith: '',
        },
        $set: {
          status: 'Available',
        },
      },
      { useFindAndModify: false, runValidators: true }
    )
    .then((result) => {
      if (result) {
        item
          .findByIdAndUpdate(
            ownTradeId,
            {
              $unset: {
                tradeWith: '',
              },
              $set: {
                status: 'Available',
              },
            },
            { useFindAndModify: false, runValidators: true }
          )
          .then((x) => {
            req.flash('success', 'Cancelled Offer Successfully');
            res.redirect('/agro/profile');
          });
      } else {
        req.flash('Failure', 'Cancel Offer Failed');
        res.redirect('back');
      }
    })
    .catch((err) => next(err));
};

exports.acceptOffer = (req, res, next) => {
  let tradeIds = req.params.id.split('&');
  let othersTradeId = tradeIds[0];
  let ownTradeId = tradeIds[1];

  item
    .findByIdAndUpdate(
      othersTradeId,
      {
        $unset: {
          tradeWith: '',
        },
        $set: {
            status: 'Traded',
        },
      },
      { useFindAndModify: false, runValidators: true }
    )
    .then((result) => {
      if (result) {
        item
          .findByIdAndUpdate(
            ownTradeId,
            {
              $unset: {
                tradeWith: '',
              },
              $set: {
                status: 'Traded',
              },
            },
            { useFindAndModify: false, runValidators: true }
          )
          .then((x) => {
            req.flash('success', 'Accepted Offer Successfully');
            res.redirect('/agro/profile');
          });
      } else {
        req.flash('Failure', 'Accept Offer Failed');
        res.redirect('back');
      }
    })
    .catch((err) => next(err));
};
