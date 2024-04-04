const deletePetDetails = async (event, dynamo) => {
  try {
    // Set dynamoDB table
    const table = "Pets";
    
    // Extract PetID from path parameters
    const petIDToDelete = event.pathParameters ? parseInt(event.pathParameters.PetID, 10) : null;
    
    if (!petIDToDelete || petIDToDelete < 0) { // Apparently !0 = true. This handles the '0' case as well.
      throw new Error('Invalid or missing PetID. Set PetID to an integer greater than 0.');
    }

    const deleteResponse = await dynamo.delete({
      TableName: table,
      Key: { PetID: petIDToDelete },
      ReturnValues: 'ALL_OLD', // Specify the desired return values
    });

    console.log('Delete Response:', deleteResponse);

    // Check if the delete operation succeeded
    if (deleteResponse.Attributes) {
      // If the item was deleted, perform the size decrement
      const decrementResponse = await dynamo.update({
        TableName: table,
        Key: { PetID: 0 },
        UpdateExpression: 'SET #s = #s - :decrement',
        ExpressionAttributeNames: {
          '#s': 'size',
        },
        ExpressionAttributeValues: {
          ':decrement': 1,
        },
      });

      console.log('Decrement Response:', decrementResponse);
    }

    return deleteResponse;
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
};

export default deletePetDetails;