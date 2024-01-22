# Blackboard Ultra Chat Helper Extension

## Overview

This project is an extension for Blackboard Ultra, designed to enhance the educational experience by integrating a chat helper feature. The extension leverages AWS Lambda for backend processing and API Gateway for managing API requests, all orchestrated using the Serverless Framework.

## Prerequisites

- AWS Account with appropriate permissions to create Lambda functions and API Gateway.
- Serverless Framework installed on your local machine. [Installation Guide](https://www.serverless.com/framework/docs/getting-started/)
- Node.js and npm (Node Package Manager).
- Access to Blackboard Ultra with permissions to install and configure extensions.

## Installation

1. **Clone the Repository**
   ```
   git clone [https://github.com/Pacific-College/uef-bb-chat-integration]
   cd [uef-bb-chat-integration]
   ```

2. **Install Dependencies**
   ```
   npm install
   ```

3. **Deploy to AWS**
   ```
   serverless deploy
   ```
   Note down the API endpoint provided after deployment.

4. **Blackboard Ultra Configuration**
   - Log in to your Blackboard Ultra account.
   - Navigate to the extensions management area.
   - Add a new extension and provide the API endpoint from the deployment step.

## Configuration

- **AWS Lambda Configuration**: Adjust memory, timeout settings, and environmental variables as needed in `serverless.yml`.
- **API Gateway Configuration**: Modify `serverless.yml` to define new endpoints or adjust existing ones.
- **Blackboard Ultra Settings**: Configure the extension within Blackboard Ultra to specify when the chat helper should be active.

## Usage

After successful installation and configuration:

- Users can access the chat helper link via a the chat icon within the Blackboard Ultra environment.

## Support

For issues, questions, or contributions, please use the following channels:

- **Issue Tracker**: [GitHub Issues](https://github.com/Pacific-College/uef-bb-chat-integration/issues)