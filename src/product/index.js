const {
  GetItemCommand,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { v4 as uuid } from "uuid";
const { ddbClient } = require("./ddbClient");

exports.handler = async (event) => {
  console.log("request", JSON.stringify(event, null, 2));

  switch (event.httpMethod) {
    case "GET":
      if (event.pathParameters != null) {
        body = await getProduct(event.pathParameters.id);
      } else {
        body = await getAllProducts();
      }
    case "POST":
      body = await createProduct(JSON.parse(event.body));
      break;
    case "DELETE":
      body = await deleteProduct(event.pathParameters.id);
      break;
    default:
      throw new Error(`Unsupported route: ${event.httpMethod}`);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello from Product ! You've hit ${event.path}`,
  };
};

const getProduct = async (productId) => {
  console.log("getProduct");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
    };

    const { Item } = await ddbClient.send(new GetItemCommand(params));

    console.log(Item);

    return Item ? unmarshall(Item) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllProducts = async () => {
  console.log("getAllProducts");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));

    console.log(Items);

    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createProduct = async (requestBody) => {
  console.log(`createProduct function. request body: "${requestBody}"`);

  try {
    requestBody.id = uuid();

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(requestBody || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));

    console.log(createResult);

    return createResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteProduct = async (productId) => {
  console.log(`deleteProduct function. productId: "${prductId}"`);

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
    };

    const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

    console.log(deleteResult);

    return deleteResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
