module.exports = {
    // The base URL for this integration server, without trailing slash (example: http://localhost:8091)
    integrationUrl: process.env.APP_URL || '',

    // The application key retrieved from developer.blackboard.com.
    // NOTE: This is not the application ID used to configure the REST API Integration in Learn
    applicationKey: process.env.APP_KEY || '',

    // The application secret retrieved from developer.blackboard.com
    applicationSecret: process.env.APP_SECRET || '',
};