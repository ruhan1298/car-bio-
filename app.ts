import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import sequelize from './models/index';  // Import the sequelize instance from the models directory
import cors from 'cors'

import createError from 'http-errors';

// import indexRouter from './routes/index';
// import usersRouter from './routes/users';
// import authRouter from './admin/routes/auth'
// import userRouter from './users/routes/user'
// import employerRouter from './employer/routes/employer'
import authRouter from './admin/routes/auth'
import agentRouter from './Agent/routes/agentAuth'
import agencyRouter from './Agency/routes/agencyauth'
const app = express();



// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));
app.use(cors());
import index from './models/index'

app.use('/api/v1/admin',authRouter)
app.use('/api/v1/agent',agentRouter)
app.use('/api/v1/agency',agencyRouter)


// app.use('/', indexRouter);
// app.use('/users', usersRouter);
import admin from './admin/models/auth'
admin.sync({force:true})
import agent from './Agent/models/Agent'
agent.sync({force:true})
import Job from './Agent/models/job'
Job.sync({force:true})
  // agent.sync({force:true})
import agency from './admin/models/Agency'
agency.sync({force:true})
import Support from './Agent/models/support'
Support.sync({force:true})
import customer from './admin/models/customer'
customer.sync({force:true})
import MasterData from './admin/models/MasterData';
MasterData.sync({force:true})
import Terms from './admin/models/terms'
// Terms.sync({force:true})

sequelize.sync().then(() => {
  console.log('Database connected');
}).catch((error: Error) => {  // Explicitly type `error` as `Error`
  console.error('Failed to sync database:', error);
});


// Error handler


// Start the server directly in `app.ts`
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
