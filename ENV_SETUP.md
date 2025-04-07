# FuckTyping Environment Setup

This document explains how to set up the environment for the FuckTyping voice-first form platform.

## Environment Variables

FuckTyping uses environment variables to configure various aspects of the application. A sample configuration file is provided in `example.env` which you can copy to `.env` and modify according to your needs.

### Required Environment Variables

At minimum, you'll need to set up these variables for the application to function:

| Variable | Description | Example |
|---------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/fucktyping` |
| `GROQ_API_KEY` | API key for Groq AI service | Get from [Groq](https://console.groq.com/) |

### Obtaining API Keys

#### Groq API Key
1. Create an account at [Groq](https://console.groq.com/)
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the key and add it to your `.env` file

#### ElevenLabs API Key (Optional, for production text-to-speech)
1. Create an account at [ElevenLabs](https://elevenlabs.io/)
2. Navigate to your profile settings
3. Find your API key
4. Copy the key and add it to your `.env` file

### Database Setup

The application requires a PostgreSQL database. You can set up a local instance or use a cloud service.

#### Local PostgreSQL Setup:

1. Install PostgreSQL
2. Create a new database:
   ```sql
   CREATE DATABASE fucktyping;
   ```
3. Set the `DATABASE_URL` in your `.env` file

#### Cloud PostgreSQL Options:
- [Supabase](https://supabase.com/) (Recommended)
- [Neon](https://neon.tech/)
- [Railway](https://railway.app/)
- AWS RDS

### WebRTC Configuration

For production use, you'll need TURN servers to ensure reliable WebRTC connectivity:

- For development, Google's public STUN servers are sufficient:
  ```
  STUN_SERVER_URL=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
  ```

- For production, consider:
  - Self-hosting using [coturn](https://github.com/coturn/coturn)
  - A managed service like [Xirsys](https://xirsys.com/) or [Twilio](https://www.twilio.com/stun-turn)

### Development Setup

For local development, the minimal `.env` file would be:

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fucktyping
GROQ_API_KEY=your_groq_api_key_here
```

### Production Deployment

In production, ensure these additional variables are set:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
API_URL=https://your-api-domain.com
JWT_SECRET=strong_random_string
EMAIL_SERVICE=...
EMAIL_USER=...
EMAIL_PASSWORD=...
TURN_SERVER_URL=...
TURN_USERNAME=...
TURN_CREDENTIAL=...
```

## Storage Configuration

The application can store user uploads and form data in different ways:

### Local Storage (Development)

```env
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./uploads
```

### S3 Storage (Production)

```env
STORAGE_TYPE=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-west-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
```

## Testing Your Configuration

After setting up your environment variables, you can test the connection:

```bash
# Test database connection
npm run test:db

# Test API keys
npm run test:api-keys
```