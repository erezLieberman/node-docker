const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis')
const cors = require('cors')
const session = require('express-session')
let RedisStore = require('connect-redis')(session)
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require('./config/config');

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
})

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoute');

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log('successfully connected to DB'))
    .catch((e)=>{
        console.log(e);
        setTimeout(() => connectWithRetry, 5000)
    })
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: SESSION_SECRET,
      cookie: { 
          secure: false,
          resave: false,
          saveUninitialized: false,
          httpOnly: true,
          maxAge: 60000
      }
    })
  )

app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h2>Hi there!!</h2>')
    console.log("yes!!")
})

app.use("/posts", postRouter)
app.use("/users", userRouter)

const port = process.env.PORT || 3000;



app.listen(port, ()=> console.log(`listening on port ${port}`));