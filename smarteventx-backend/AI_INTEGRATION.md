# AI Service Integration Guide

This document explains how to connect the EWE platform to actual AI services for enhanced recommendations and analytics.

## Supported AI Services

1. **OpenAI GPT Models**
2. **AWS Personalize**
3. **Google Recommendations AI**

## Configuration

To enable AI integration, you need to set environment variables in your `.env` file:

### OpenAI Integration

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### AWS Personalize Integration

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_PERSONALIZE_CAMPAIGN_ARN=your_campaign_arn
```

### Google Recommendations AI Integration

```env
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json
GOOGLE_PROJECT_ID=your_google_project_id
```

## Implementation Details

### 1. OpenAI Integration

The system uses OpenAI's GPT models to generate personalized recommendations based on user preferences and booking history.

To enable OpenAI integration:
1. Uncomment the OpenAI import in `src/utils/aiRecommendations.ts`
2. Set the `OPENAI_API_KEY` environment variable
3. The system will automatically use OpenAI for all recommendation requests

### 2. AWS Personalize Integration

AWS Personalize provides fully managed machine learning services for creating individualized recommendations.

To enable AWS Personalize integration:
1. Uncomment the AWS SDK import in `src/utils/aiRecommendations.ts`
2. Set the required AWS environment variables
3. Create a Personalize campaign and set the `AWS_PERSONALIZE_CAMPAIGN_ARN`
4. The system will automatically use AWS Personalize for recommendation requests

### 3. Google Recommendations AI Integration

Google Recommendations AI delivers highly personalized product recommendations at scale.

To enable Google Recommendations AI integration:
1. Uncomment the Google APIs import in `src/utils/aiRecommendations.ts`
2. Set the required Google environment variables
3. Configure your Google Recommendations AI service
4. The system will automatically use Google Recommendations AI for recommendation requests

## API Endpoints

All AI functionality is exposed through the following API endpoints:

### User Recommendations
- `GET /api/ai/recommendations/personalized` - Personalized service recommendations
- `GET /api/ai/recommendations/history` - History-based recommendations

### Admin Recommendations
- `GET /api/ai/recommendations/trending` - Trending services
- `GET /api/admin/bundles/suggestions` - Bundle suggestions
- `GET /api/admin/services/alerts` - Weak service alerts

### Vendor Recommendations
- `GET /api/ai/pricing/suggestions` - Price optimization suggestions
- `GET /api/vendors/matchmaking` - Vendor matchmaking suggestions

## Testing AI Integration

To test the AI integration:

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Make API requests to the recommendation endpoints with appropriate authentication tokens

3. Check the server logs for AI service connection status

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your API keys are correctly set in the environment variables
2. **Network Issues**: Verify that your server can access the AI service endpoints
3. **Rate Limiting**: Check the AI service documentation for rate limits and implement appropriate retry logic

### Logs

Check the server logs for detailed error messages and debugging information:
```bash
# View logs
tail -f logs/server.log
```

## Best Practices

1. **Fallback Mechanism**: The system includes mock data fallbacks when AI services are not configured
2. **Caching**: Implement caching for AI responses to reduce API calls and improve performance
3. **Error Handling**: Always handle AI service errors gracefully and provide meaningful feedback to users
4. **Monitoring**: Monitor AI service usage and performance to optimize costs and user experience

## Cost Considerations

AI services typically charge based on usage:
- OpenAI: Per token usage
- AWS Personalize: Per API call and data processing
- Google Recommendations AI: Per prediction request

Monitor your usage and set up billing alerts to avoid unexpected costs.