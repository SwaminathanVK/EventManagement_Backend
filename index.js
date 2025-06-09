import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import ConnectDB  from './Database/Config.js';
import authRouter from './Routers/authRouter.js';
import userRoutes from './Routers/userRouter.js';
import eventRoutes from './Routers/eventRouter.js';
import ticketRoutes from './Routers/ticketRouter.js';
import organizerRoutes from './Routers/organizerRoutes.js';
import adminRoutes from './Routers/adminRouter.js';
import paymentRouter from './Routers/PaymentRouter.js';
import registrationRouter from './Routers/registrationRouter.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

ConnectDB();



app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}))



app.use('/api/auth', authRouter);                   // Register, Login

app.use('/api/user', userRoutes);                    // Profile

app.use('/api/events', eventRoutes);                // Event CRUD + Public

app.use('/api/tickets', ticketRoutes);             // Booking, Canceling, Transferring

app.use('/api/organizer', organizerRoutes);        // Organizer dashboard

app.use('/api/admin', adminRoutes);               // Admin dashboard

app.use('/api/payment', paymentRouter);            // Stripe integration

app.use('/api/registration', registrationRouter);
           
// Optional: Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const port = process.env.PORT;     
          
app.listen(port,()=>{
    console.log(`Server is running on the ${port}`);
})

export default app; 