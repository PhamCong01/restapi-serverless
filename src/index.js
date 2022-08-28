const db = require("../DynamoDb/data");
const dotenv = require("dotenv");
dotenv.config();
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// get post
const getPost = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
    };
    const { Item } = await db.send(new GetItemCommand(params));

    response.body = JSON.stringify({
      message: "get post successfully",
      post: Item ? unmarshall(Item) : null,
    });
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "get post failed",
      post: null,
    });
  }
  return response;
};

// create post
const createPost = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall(body || {}),
    };
    const post = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "create post successfully",
      post,
    });
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "create post failed",
      post: null,
    });
  }
  return response;
};

// update post
const updatePost = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const objKey = Object.keys(body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
      UpdateExpression: `SET ${objKey
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKey.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKey.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const post = await db.send(new UpdateItemCommand(params));

    response.body = JSON.stringify({
      message: "update post successfully",
      post,
    });
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "update post failed",
      post: null,
    });
  }
  return response;
};

// delete post
const deletePost = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
    };
    await db.send(new DeleteItemCommand(params));

    response.body = JSON.stringify({
      message: "delete post successfully",
    });
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "delete post failed",
      post: null,
    });
  }
  return response;
};

//  getAllPost
const getAllPost = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };
    const { Items } = await db.send(new ScanCommand(params));

    response.body = JSON.stringify({
      message: "get posts successfully",
      posts: Items ? Items.map((item) => unmarshall(item)) : [],
    });
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "get posts failed",
      post: null,
    });
  }
  return response;
};

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  getAllPost,
};
