let dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
const { sequelize, UserModel } = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

async function auth(req, res, next) {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send('');
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        var user = await UserModel.findByPk(payload.userId);
        if (user) {
            next();
            return;
        }
    
        res.status(403).send('');
    } catch(e) {
        return res.status(401).send('');

    }

}

app.get('/led/:state', auth, (req, res) => {
    res.send(`State: ${req.params.state}`);
})

app.post('/users', async (req, res) => {
    try {
        const { password, email } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        await UserModel.create({ password: hashPassword, email });
        res.status(201).send({ email });
    } catch(e) {
        console.log(e);
        res.status(500).send({ message: e.message});
    }
});

app.post('/login', async (req, res) => {
    const { password, email } = req.body;
    const user = await UserModel.findOne({ where: { email}});
    if (!user) {
        res.status(401).send({ msg: 'Failed to auth'});
        return;
    }
    let isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        res.status(401).send({ msg: 'Failed to auth'});
        return;
    }

    let jwtSecretKey = process.env.JWT_SECRET;
    let data = {
        time: Date(),
        userId: user.id
    };

    const token = jwt.sign(data, jwtSecretKey);
    res.send({ token });
});

app.listen(3000, async function() {
    await sequelize.authenticate();
    await sequelize.sync({ force: true});
    console.log('working');
});

