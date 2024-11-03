const User = require('../models/users');

const authorize = (roles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.body.createdBy);
            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ message: "Permisos insuficientes" });
            }
            next();
        } catch (error) {
            res.status(500).json({ message: "Error de autorización", error });
        }
    };
};

module.exports = authorize;
