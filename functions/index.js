const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const serviceAccount = require("./service.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "<you database url>",
});

const typeDefs = gql`
  type Cat {
    name: String
    weight: String
    owner: String
  }

  type Query {
    cats: [Cat]
  }
`;

const resolvers = {
  Query: {
    cats: () => {
      return admin
        .database()
        .ref("cats")
        .once("value")
        .then((snap) => snap.val())
        .then((val) => Object.keys(val).map((i) => val[i]));
    },
  },
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

server.applyMiddleware({ app, path: "/", cors: true });

exports.graphql = functions.https.onRequest(app);
