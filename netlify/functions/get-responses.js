const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Use environment variables instead of hardcoded values
    const TYPEFORM_TOKEN = process.env.TYPEFORM_TOKEN;
    const FORM_ID = process.env.TYPEFORM_FORM_ID;

    if (!TYPEFORM_TOKEN || !FORM_ID) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Missing configuration' })
        };
    }

    try {
        const response = await fetch(
            `https://api.typeform.com/forms/${FORM_ID}/responses?page_size=50`,
            {
                headers: {
                    'Authorization': `Bearer ${TYPEFORM_TOKEN}`
                }
            }
        );

        const data = await response.json();
        
        // Transform responses
        const transformedResponses = data.items.map(response => {
            const answers = {};
            response.answers?.forEach(answer => {
                answers[answer.field.ref] = answer.text;
            });

            return {
                id: response.response_id,
                submitted_at: response.submitted_at,
                answers
            };
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(transformedResponses)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch responses' })
        };
    }
};