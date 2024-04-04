const postPetDetails = async (event, dynamo) => {
  try {
    // Set dynamoDB table
    const table = "Pets";
    
    if (typeof event.body === 'string') {
      // Parse the JSON string
      event.body = JSON.parse(event.body);
    }
    
    // Get table details
    const getSizeParams = {
      TableName: table,
      Key: { 'PetID': 0 },
    };
    
    const tableDetails = await dynamo.get(getSizeParams);
    
    // Ge table size
    let currentSize = tableDetails.Item?.size ?? null;
    
    if (currentSize === null) {
      console.log('Size attribute not found or undefined');
      throw new Error('Size attribute not found or undefined');
    } else {
      console.log('Current Size:', currentSize);
    }

    // Increment the size
    const incrementedSize = currentSize + 1;
    
    // Get nextPetID
    let nextPetID = tableDetails.Item?.nextPetID ?? null;
    
    if (nextPetID === null) {
      console.log('nextPetID attribute not found or undefined');
      throw new Error('nextPetID attribute not found or undefined');
    } else {
      console.log('Current nextPetID:', nextPetID);
    }

    // Increment nextPetID
    const incrementedNextPetID = nextPetID + 1;
  
    // Start a transaction
    const result = await dynamo.transactWrite({
      TransactItems: [
        // Update table size
        {
          Update: {
            TableName: table,
            Key: { 'PetID': 0 },
            UpdateExpression: 'SET size = :newSize, nextPetID = :newNextPetID',
            ExpressionAttributeValues: {
              ':newSize': incrementedSize,
              ':newNextPetID': incrementedNextPetID,
            },
          },
        },
        // Add new Pet to table
        {
          Put: {
            TableName: table,
            Item: {
              'PetID': nextPetID,
              'Name': event.body.name,
              'Age': parseInt(event.body.age, 10),
              'Type': event.body.type,
              // Add other attributes here
            },
            ConditionExpression: 'attribute_not_exists(PetID)', // Ensure the item doesn't exist
          },
        },
        
      ],
    });
    
    console.log('PUT Operation Result:', result);

    return result; // Return the entire transaction result

  } catch (error) {
    console.error('Error in transaction:', error);
    // Handle errors or conflicts
    throw error; // Propagate the error
  }
};

export default postPetDetails;