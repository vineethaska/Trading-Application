const Story = require('../models/items');
/*Authorization rules:
if a user is not logged in(guest), then user can only access new account page na d login page
Actions: signup for a new account/ login to the app 
Otherwise, user is redirected to the profile page */

//check if user is guest
exports.isGuest = (req,res,next)=>{
    if(!req.session.user){
         return next();
         }else{
             req.flash('error', 'You are logged in already');
             return res.redirect('/agro/profile');
         }
}

/*Authorization rules:
if a user is logged in(authenticated), then user can access profile page and new story page
Actions: create a new story/ logoff 
Otherwise, user is redirected to the login page */

//check if user is authenticated
exports.authenticated = (req,res,next)=>{
    if(req.session.user){
        return next();
    }else{
        req.flash('error', 'You need to login first!');
        res.redirect('/agro/login');
    }
};

/* if the user is authenticated (logged in) and the user is the author of a story, then user can
access edit story page.
Actions: edit the story, delete the story
otherwise, the user is redirected to login page if the user is not logged in 
or redirected to error page if logged in but not the author of the story.*/

//checks if user is author of the story
exports.isAuthor = (req,res,next)=>{
    id = req.params.id;
    Story.findById(id)
    .then((story)=>{
        if(story){
            if(story.author==req.session.user){
                console.log("author is same as user");
                return next();
            }else{
                let err= new Error ("you are not authorised to perform action");
                err.status =401;
                next(err);
            }
        }
    })
    .catch(err=>{
        next(err);
    })
};
