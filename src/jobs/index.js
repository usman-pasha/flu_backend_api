import cron from 'node-cron';

// Run every 14 minutes
cron.schedule('*/12 * * * *', async () => {
    try {
        console.log(`[${new Date().toISOString()}] 🔄 Running Every 14 Minutes`);
    } catch (err) {
        console.error(err.message);
    }
});
