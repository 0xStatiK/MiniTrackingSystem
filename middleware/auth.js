// middleware/auth.js

// Check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userID) {
        return next();
    }

    return res.status(401).json({
        success: false,
        error: {
            message: 'Authentication required. Please log in.',
            code: 'UNAUTHORIZED'
        }
    });
}

// Check if the user isAdmin
function isAdmin(req, res, next) {
    if (!req.session || !req.session.userID) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required.',
                code: 'UNAUTHORIZED'
            }
        });
    }

    if (!req.session.isAdmin) {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Admin access required.',
                code: 'FORBIDDEN'
            }
        });
    }

    next(); // User is admin, continue on wayward son
}

// Optional authentication (doesn't require login)
function optionalAuth(req, req, next) {
    next(); //Passthrough
}

module.exports = {
    isAuthenticated,
    isAdmin,
    optionalAuth
};