module.exports.requireAdmin = (req, res, next) => {
  console.log('Checking admin session...');
  if (req.session && req.session.isAdmin) {
    console.log('Admin session valid');
    return next();
  } else {
    console.log('Admin not logged in!');
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports.adminAuth = (req, res, next) => {
  console.log('Admin auth check for:', req.path, 'session:', !!req.session, 'isAdmin:', req.session?.isAdmin);
  if (req.session && req.session.isAdmin) {
    return next();
  } else {
    console.log('Redirecting to login');
    return res.redirect('/admin/login.html');
  }
};
