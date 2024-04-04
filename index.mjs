import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import getPetDetails from './handlers/getHandler.js';
import putPetDetails from './handlers/putHandler.js';
import deletePetDetails from './handlers/deleteHandler.js';
import postPetDetails from './handlers/postHandler.js';

const dynamo = DynamoDBDocument.from(new DynamoDB());

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
export const handler = async (event) => {
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": '*', // Allows any origin
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": '*' // Allowed request methods
    };
    
    console.log(event);

    try {
        switch (event.httpMethod) {
            case 'DELETE':
                body = await deletePetDetails(event, dynamo);
                break;
            case 'GET':
                body = await getPetDetails(event, dynamo);
                break;
            case 'POST': // Not Idempotent, the same query creates multiple copies (Creates Pets)
                body = await postPetDetails(event, dynamo);
                break;
            case 'PUT': // Idempotent, the same query changes the same item (updates the Pet)
                body = await putPetDetails(event, dynamo);
                break;
            case 'OPTIONS':
                body = JSON.stringify('Hello from Lambda!');
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

