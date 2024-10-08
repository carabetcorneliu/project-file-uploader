require('dotenv').config();

// App config
const express = require('express');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./db/prisma');
const passport = require('./config/passport');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const folderRouter = require('./routes/folderRouter');

const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// View Engine and static Files set up
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// Removed to prevent direct access without user authorization either other user's files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware configuration
app.use(session({
    secret: 'dogs',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 60 * 60 * 1000, // 1 hour session
        dbRecordIdIsSessionId: true, // Whether the session ID is stored as the record ID
        dbRecordIdFunction: undefined // Function to generate session record IDs
    }),
    cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: process.env.NODE_ENV === 'production',
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Ensure that user object is available in all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Middleware
app.use(morgan('combined'));
app.use(helmet());

// Routers
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/folders', folderRouter);

// Handle 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Global Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke');
})

// Server config
const HOST = process.env.HOST_ADDRESS || 'localhost';
const PORT = process.env.HOST_PORT || 3000;
app.listen(PORT, () => console.log(`Express server listening at http://${HOST}:${PORT}`));