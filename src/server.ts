// import app from '@/app';
// import { logger } from '@/utils/logger';
// import { MONGODB_URI, PORT } from '@config';
// import connection from '@/databases';
// import validateEnv from '@/utils/validateEnv';
// import routes from './routes';
// import songRoutes from './routes/audio.route'
//  import videoRoutes from './routes/video.route'
// import statusRoutes from './routes/status.routes'
//  import cron from 'node-cron'



// // ROUTES
// validateEnv();
// connection(MONGODB_URI);

// const version = '/v1';
// routes.forEach((route) => {
//   const path = version + route.path;
//   app.use(path, route.func);
// });
// //


// //audio
// app.use('/',songRoutes)

// app.use('/',videoRoutes)

// app.use('/videos', videoRoutes);
// app.use("/", statusRoutes)



// // LISTEN PORT
// app.listen(PORT, () => {
//   logger.info(`·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•·`);
//   logger.warn(`App is running on http://localhost:${PORT}`);
//   logger.info(`·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•·`);
// });

import app from '@/app';
import { logger } from '@/utils/logger';
import { MONGODB_URI, PORT } from '@config';
import connection from '@/databases';
import validateEnv from '@/utils/validateEnv';
import routes from './routes';
import songRoutes from './routes/audio.route';
import videoRoutes from './routes/video.route';
import statusRoutes from './routes/status.routes';
import cron from 'node-cron'; // Import node-cron

// Start the cron job
cron.schedule("* * * * *", async () => {
  try {
    // Your code for deleting expired statuses here
    console.log("Cron job ran.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// ROUTES
validateEnv();
connection(MONGODB_URI);

const version = '/v1';
routes.forEach((route) => {
  const path = version + route.path;
  app.use(path, route.func);
});

//audio
app.use('/', songRoutes);
app.use('/', videoRoutes);
app.use('/videos', videoRoutes);
app.use("/", statusRoutes);

// LISTEN PORT
app.listen(PORT, () => {
  logger.info(`·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•·`);
  logger.warn(`App is running on http://localhost:${PORT}`);
  logger.info(`·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•· ·•·`);
});

