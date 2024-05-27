const jwt=require('jsonwebtoken')

exports.requireSignIn = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    } else {
        return res.status(400).json({ message: "Authorization header required" });
    }
};

exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Admin access denied" });
    }
    next();
};

exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== "User") {
        return res.status(403).json({ message: "User access denied" });
    }
    next();
};
