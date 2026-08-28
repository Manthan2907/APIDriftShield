export const SAMPLE_V1_SPEC = `{
  "openapi": "3.0.0",
  "info": { "title": "User API", "version": "1.0.0" },
  "paths": {
    "/users": {
      "get": {
        "operationId": "listUsers",
        "responses": {
          "200": { "description": "List of users", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/User" } } } } }
        }
      },
      "post": {
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/UserInput" } } }
        },
        "responses": { "201": { "description": "User created" } }
      }
    },
    "/users/{id}": {
      "get": {
        "operationId": "getUser",
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "200": { "description": "User details" } }
      },
      "delete": {
        "operationId": "deleteUser",
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "204": { "description": "Deleted" } }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "email": { "type": "string" },
          "age": { "type": "integer" }
        }
      },
      "UserInput": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string" },
          "age": { "type": "integer" }
        },
        "required": ["name"]
      }
    }
  }
}`;

export const SAMPLE_V2_SPEC = `{
  "openapi": "3.0.0",
  "info": { "title": "User API", "version": "2.0.0" },
  "paths": {
    "/users": {
      "get": {
        "operationId": "listUsers",
        "responses": {
          "200": { "description": "List of users", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/User" } } } } }
        }
      },
      "post": {
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/UserInput" } } }
        },
        "responses": { "201": { "description": "User created" }, "422": { "description": "Validation error" } }
      }
    },
    "/users/{id}/profile": {
      "get": {
        "operationId": "getUserProfile",
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "200": { "description": "User profile" } }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "email": { "type": "string" },
          "age": { "type": "integer" },
          "createdAt": { "type": "string" }
        }
      },
      "UserInput": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string" },
          "age": { "type": "string" }
        },
        "required": ["name", "email"]
      }
    }
  }
}`;
