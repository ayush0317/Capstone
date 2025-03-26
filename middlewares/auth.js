// middlewares/auth.js
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
      next(); // User is authenticated
    } else {
      res.redirect('/login');
    }
  }
  
  module.exports = { requireLogin };
  