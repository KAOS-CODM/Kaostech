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
