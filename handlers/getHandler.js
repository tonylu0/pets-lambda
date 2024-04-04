const getPetDetails = async (event, dynamo) => {
  try {
    // Set dynamoDB table
    const table = "Pets";
    
    // Check if PetID is present in path parameters
    const petIDString = event.pathParameters ? event.pathParameters.PetID : null;
    const petID = petIDString ? parseInt(petIDString, 10) : null;
    
    if (petID === 0) {
      throw new Error('PetID must be > 0');
    }
    
    if (petID) {
      // Perform action for a specific PetID (e.g., query a single pet)
      const pet = await dynamo.get({
        TableName: table,
        Key: { PetID: petID },
      });

      if (pet.Item) {
        console.log(pet);
        return pet;
      } else {
        // Throw an error for pet not found
        throw new Error('Pet not found');
      }
    } else {
      // Perform action for the entire database (e.g., scan)
      const scanResponse = await dynamo.scan({ TableName: table });

      const formattedResponse = {
        metadata: scanResponse.$metadata,
        count: scanResponse.Count,
        items: scanResponse.Items,
        scannedCount: scanResponse.ScannedCount,
      };

      const formattedResponseString = JSON.stringify(formattedResponse, null, 2);

      console.log(formattedResponseString);

      return scanResponse;
    }
  } catch (error) {
    console.error('Error processing GET re:', error);
    throw error; // Re-throw the error for higher-level error handling if needed
  }
};

export default getPetDetails;